import { useState, useMemo } from 'react';

const EPSILON = 1e-9;

function parseElements(str) {
    if (!str || !str.trim()) return new Set();
    return new Set(
        str.split(',')
            .map(s => s.trim())
            .filter(Boolean)
    );
}

function setIntersection(setA, setB) {
    return new Set([...setA].filter(e => setB.has(e)));
}

function setUnion(...sets) {
    return new Set(sets.flatMap(s => [...s]));
}

export function useDiscreteSet() {
    const [inputs, setInputs] = useState({
        omega: '1, 2, 3, 4, 5, 6',
        setA: '1, 2, 3',
        setB: '2, 3, 4',
        setC: '4, 5',
    });

    const updateInput = (key, value) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const data = useMemo(() => {
        const Omega = parseElements(inputs.omega);
        const n = Omega.size;

        // Clamp sets to elements in Ω
        const A = new Set([...parseElements(inputs.setA)].filter(e => Omega.has(e)));
        const B = new Set([...parseElements(inputs.setB)].filter(e => Omega.has(e)));
        const C = new Set([...parseElements(inputs.setC)].filter(e => Omega.has(e)));

        // Which user-typed elements are outside Ω (for validation feedback)
        const invalidA = [...parseElements(inputs.setA)].filter(e => !Omega.has(e));
        const invalidB = [...parseElements(inputs.setB)].filter(e => !Omega.has(e));
        const invalidC = [...parseElements(inputs.setC)].filter(e => !Omega.has(e));

        // Safe probability: handle empty Ω
        const p = (set) => n === 0 ? 0 : set.size / n;

        // All pairwise and triple intersections
        const AB = setIntersection(A, B);
        const AC = setIntersection(A, C);
        const BC = setIntersection(B, C);
        const ABC = setIntersection(AB, C);

        const AuBuC = setUnion(A, B, C);

        // ── Logical regions for Venn element placement ─────────────────────────
        const regions = {
            onlyA: new Set([...A].filter(e => !B.has(e) && !C.has(e))),
            onlyB: new Set([...B].filter(e => !A.has(e) && !C.has(e))),
            onlyC: new Set([...C].filter(e => !A.has(e) && !B.has(e))),
            AB_only: new Set([...AB].filter(e => !C.has(e))),
            AC_only: new Set([...AC].filter(e => !B.has(e))),
            BC_only: new Set([...BC].filter(e => !A.has(e))),
            ABC: ABC,
            outside: new Set([...Omega].filter(e => !AuBuC.has(e))),
        };

        // ── Probabilities (compatible with useProbability output) ──────────────
        const probs = {
            pA: p(A),
            pB: p(B),
            pC: p(C),
            pAB: p(AB),
            pAC: p(AC),
            pBC: p(BC),
            pABC: p(ABC),
        };

        // ── Derived calculations ────────────────────────────────────────────────
        const safe = (num, den) => (den < EPSILON ? null : num / den);

        const pAuB = p(A) + p(B) - p(AB);
        const pAuC = p(A) + p(C) - p(AC);
        const pBuC = p(B) + p(C) - p(BC);
        const pAuBuC = p(A) + p(B) + p(C) - p(AB) - p(AC) - p(BC) + p(ABC);

        const tolI = 0.005;

        const calc = {
            pAuB, pAuC, pBuC, pAuBuC,
            pAcB: safe(p(AB), p(B)),
            pBcA: safe(p(AB), p(A)),
            pAcC: safe(p(AC), p(C)),
            pCcA: safe(p(AC), p(A)),
            pBcC: safe(p(BC), p(C)),
            pCcB: safe(p(BC), p(B)),
            pAc: 1 - p(A),
            pBc: 1 - p(B),
            pCc: 1 - p(C),
            abIndep: Math.abs(p(AB) - p(A) * p(B)) < tolI,
            acIndep: Math.abs(p(AC) - p(A) * p(C)) < tolI,
            bcIndep: Math.abs(p(BC) - p(B) * p(C)) < tolI,
            abMutEx: AB.size === 0,
            acMutEx: AC.size === 0,
            bcMutEx: BC.size === 0,
        };

        // ── Set summaries for control panel display ─────────────────────────────
        const summary = {
            nOmega: n,
            nA: A.size, nB: B.size, nC: C.size,
            nAB: AB.size, nAC: AC.size, nBC: BC.size, nABC: ABC.size,
            invalidA, invalidB, invalidC,
            Omega, A, B, C, AB, AC, BC, ABC,
        };

        return { probs, calc, regions, summary };
    }, [inputs]);

    return { inputs, updateInput, data };
}
