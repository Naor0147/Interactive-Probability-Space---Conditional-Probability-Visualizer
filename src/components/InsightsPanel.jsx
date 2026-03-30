import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, ArrowRightLeft } from 'lucide-react';

const spring = { type: 'spring', stiffness: 300, damping: 30 };

function IndependenceBadge({ label, isIndep, isMutEx }) {
    if (isMutEx) {
        return (
            <motion.div
                className="badge"
                style={{
                    background: 'rgba(255, 69, 58, 0.08)',
                    border: '1px solid rgba(255,69,58,0.2)',
                    color: '#ff453a',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={spring}
            >
                <X size={11} />
                {label} Mutually Exclusive
            </motion.div>
        );
    }
    if (isIndep) {
        return (
            <motion.div
                className="badge"
                style={{
                    background: 'rgba(48, 209, 88, 0.08)',
                    border: '1px solid rgba(48,209,88,0.2)',
                    color: '#30d158',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={spring}
            >
                <Check size={11} />
                {label} Independent
            </motion.div>
        );
    }
    return (
        <div
            className="badge"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-tertiary)',
            }}
        >
            <Zap size={11} />
            {label} Dependent
        </div>
    );
}

export default function InsightsPanel({ probs, calc }) {
    const { pA, pB, pC, pAB } = probs;
    const { pAcB, pBcA, abIndep, acIndep, bcIndep, abMutEx, acMutEx, bcMutEx } = calc;

    const bayesNumerator = pBcA !== null ? pBcA * pA : null;
    const bayesResult = bayesNumerator !== null && pB > 0 ? bayesNumerator / pB : null;
    const directResult = pAcB;

    return (
        <div className="glass p-6 space-y-6">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Insights
            </h2>

            {/* Independence / Mutual Exclusivity Badges */}
            <div>
                <div className="section-label mb-3">Relationship Detection</div>
                <AnimatePresence mode="wait">
                    <div className="flex flex-wrap gap-2">
                        <IndependenceBadge label="A & B" isIndep={abIndep} isMutEx={abMutEx} />
                        <IndependenceBadge label="A & C" isIndep={acIndep} isMutEx={acMutEx} />
                        <IndependenceBadge label="B & C" isIndep={bcIndep} isMutEx={bcMutEx} />
                    </div>
                </AnimatePresence>
                <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Independence: |P(X∩Y) − P(X)·P(Y)| &lt; 0.005 &nbsp;|&nbsp; Mutual Exclusivity: P(X∩Y) = 0
                </p>
            </div>

            {/* Bayes' Theorem */}
            <div>
                <div className="section-label mb-3 flex items-center gap-2">
                    <ArrowRightLeft size={11} />
                    Bayes' Theorem
                </div>
                <div className="glass-light p-5 space-y-4">
                    <div className="text-center">
                        <div className="font-mono text-sm px-4 py-2.5 rounded-xl inline-block"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                            P(A|B) = <span style={{ color: '#5ac8fa' }}>P(B|A)</span> · <span style={{ color: '#5ac8fa' }}>P(A)</span> / <span style={{ color: '#bf5af2' }}>P(B)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {[
                            { label: 'P(B|A)', value: pBcA },
                            { label: 'P(A)', value: pA },
                            { label: 'P(B)', value: pB },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl p-2.5"
                                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ color: 'var(--text-tertiary)' }} className="mb-1">{label}</div>
                                <div className="font-mono" style={{ color: 'var(--text-primary)' }}>
                                    {value !== null ? value.toFixed(4) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="pt-3">
                        <div className="flex items-center justify-between">
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Bayes: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                                    {bayesResult !== null ? bayesResult.toFixed(4) : '—'}
                                </span>
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Direct: <span className="font-mono" style={{ color: '#bf5af2' }}>
                                    {directResult !== null ? directResult.toFixed(4) : '—'}
                                </span>
                            </div>
                        </div>
                        {bayesResult !== null && directResult !== null && (
                            <div className="mt-2 text-center text-xs">
                                {Math.abs(bayesResult - directResult) < 1e-6 ? (
                                    <span style={{ color: '#30d158' }}>✓ Both methods agree</span>
                                ) : (
                                    <span style={{ color: '#ff453a' }}>Numerical mismatch</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Key Formulas */}
            <div>
                <div className="section-label mb-2">Reference</div>
                <div className="space-y-1 text-xs font-mono">
                    {[
                        ['P(A∪B)', 'P(A) + P(B) − P(A∩B)', '#5ac8fa'],
                        ['P(A|B)', 'P(A∩B) / P(B)', '#8e8ce6'],
                        ['P(Aᶜ)', '1 − P(A)', '#5ac8fa'],
                        ['P(A∪B∪C)', 'Σ − ΣΣ + P(A∩B∩C)', '#ff9f0a'],
                    ].map(([lhs, rhs, col]) => (
                        <div key={lhs} className="flex gap-2 items-start rounded-xl px-3 py-2"
                            style={{ background: 'var(--surface-2)' }}>
                            <span style={{ color: col, minWidth: 80 }}>{lhs}</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>= {rhs}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
