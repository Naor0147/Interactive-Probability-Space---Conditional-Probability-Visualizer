import { useState, useCallback } from 'react';

const EPSILON = 1e-9;

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

export function useProbability() {
    const [probs, setProbs] = useState({
        pA: 0.60,
        pB: 0.50,
        pC: 0.40,
        pAB: 0.20,
        pAC: 0.15,
        pBC: 0.15,
        pABC: 0.05,
    });

    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    }, []);

    const update = useCallback((key, rawValue) => {
        setProbs(prev => {
            const val = clamp(parseFloat(rawValue) || 0, 0, 1);
            let next = { ...prev, [key]: val };
            let warned = false;

            // ── Marginal clamping ──────────────────────────────────────────────────
            if (key === 'pA') {
                if (next.pAB > val && !warned) { showToast(`P(A∩B) auto-corrected: cannot exceed P(A).`); warned = true; }
                if (next.pAC > val && !warned) { showToast(`P(A∩C) auto-corrected: cannot exceed P(A).`); warned = true; }
                next.pAB = clamp(next.pAB, 0, Math.min(val, next.pB));
                next.pAC = clamp(next.pAC, 0, Math.min(val, next.pC));
            }
            if (key === 'pB') {
                if (next.pAB > val && !warned) { showToast(`P(A∩B) auto-corrected: cannot exceed P(B).`); warned = true; }
                if (next.pBC > val && !warned) { showToast(`P(B∩C) auto-corrected: cannot exceed P(B).`); warned = true; }
                next.pAB = clamp(next.pAB, 0, Math.min(next.pA, val));
                next.pBC = clamp(next.pBC, 0, Math.min(val, next.pC));
            }
            if (key === 'pC') {
                if (next.pAC > val && !warned) { showToast(`P(A∩C) auto-corrected: cannot exceed P(C).`); warned = true; }
                if (next.pBC > val && !warned) { showToast(`P(B∩C) auto-corrected: cannot exceed P(C).`); warned = true; }
                next.pAC = clamp(next.pAC, 0, Math.min(next.pA, val));
                next.pBC = clamp(next.pBC, 0, Math.min(next.pB, val));
            }

            // ── Two-way intersection clamping ──────────────────────────────────────
            if (key === 'pAB') {
                const maxAB = Math.min(next.pA, next.pB);
                if (val > maxAB && !warned) { showToast(`P(A∩B) cannot exceed min(P(A), P(B)) = ${maxAB.toFixed(2)}.`); warned = true; }
                next.pAB = clamp(val, 0, maxAB);
            }
            if (key === 'pAC') {
                const maxAC = Math.min(next.pA, next.pC);
                if (val > maxAC && !warned) { showToast(`P(A∩C) cannot exceed min(P(A), P(C)) = ${maxAC.toFixed(2)}.`); warned = true; }
                next.pAC = clamp(val, 0, maxAC);
            }
            if (key === 'pBC') {
                const maxBC = Math.min(next.pB, next.pC);
                if (val > maxBC && !warned) { showToast(`P(B∩C) cannot exceed min(P(B), P(C)) = ${maxBC.toFixed(2)}.`); warned = true; }
                next.pBC = clamp(val, 0, maxBC);
            }

            // ── Three-way intersection clamping ────────────────────────────────────
            const maxABC = Math.min(next.pAB, next.pAC, next.pBC);
            if (key === 'pABC' && val > maxABC && !warned) {
                showToast(`P(A∩B∩C) cannot exceed min of all pairwise intersections = ${maxABC.toFixed(2)}.`);
            }
            next.pABC = clamp(next.pABC, 0, maxABC);

            // ── Union ≤ 1 guard ────────────────────────────────────────────────────
            const union = next.pA + next.pB + next.pC - next.pAB - next.pAC - next.pBC + next.pABC;
            if (union > 1 + EPSILON) {
                // Proportionally shrink the updated marginal
                const excess = union - 1;
                if (key === 'pA') next.pA = clamp(next.pA - excess, 0, 1);
                else if (key === 'pB') next.pB = clamp(next.pB - excess, 0, 1);
                else if (key === 'pC') next.pC = clamp(next.pC - excess, 0, 1);
                if (!warned) {
                    showToast(`P(A∪B∪C) cannot exceed 1 — value auto-corrected.`);
                }
            }

            return next;
        });
    }, [showToast]);

    // ── Derived calculations ─────────────────────────────────────────────────
    const calc = (() => {
        const { pA, pB, pC, pAB, pAC, pBC, pABC } = probs;
        const safe = (num, den) => (den < EPSILON ? null : num / den);

        const pAuB = pA + pB - pAB;
        const pAuC = pA + pC - pAC;
        const pBuC = pB + pC - pBC;
        const pAuBuC = pA + pB + pC - pAB - pAC - pBC + pABC;

        const pAcB = safe(pAB, pB);   // P(A|B)
        const pBcA = safe(pAB, pA);   // P(B|A)
        const pAcC = safe(pAC, pC);   // P(A|C)
        const pCcA = safe(pAC, pA);   // P(C|A)
        const pBcC = safe(pBC, pC);   // P(B|C)
        const pCcB = safe(pBC, pB);   // P(C|B)

        const pAc = 1 - pA;
        const pBc = 1 - pB;
        const pCc = 1 - pC;

        // Independence: P(A∩B) ≈ P(A)·P(B)  (±0.005)
        const tolI = 0.005;
        const abIndep = Math.abs(pAB - pA * pB) < tolI;
        const acIndep = Math.abs(pAC - pA * pC) < tolI;
        const bcIndep = Math.abs(pBC - pB * pC) < tolI;

        // Mutual exclusivity
        const abMutEx = pAB < EPSILON;
        const acMutEx = pAC < EPSILON;
        const bcMutEx = pBC < EPSILON;

        return {
            pAuB, pAuC, pBuC, pAuBuC,
            pAcB, pBcA, pAcC, pCcA, pBcC, pCcB,
            pAc, pBc, pCc,
            abIndep, acIndep, bcIndep,
            abMutEx, acMutEx, bcMutEx,
        };
    })();

    return { probs, update, calc, toast };
}
