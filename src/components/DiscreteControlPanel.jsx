import { motion } from 'framer-motion';
import { Hash, AlertTriangle, CheckCircle, Layers } from 'lucide-react';

const COL_A = '#5ac8fa';
const COL_B = '#bf5af2';
const COL_C = '#ff9f0a';

const SET_CONFIG = [
    { key: 'omega', label: 'Ω  Sample Space', color: 'var(--text-primary)', placeholder: '1, 2, 3, 4, 5, 6', isOmega: true },
    { key: 'setA', label: 'A', color: COL_A, placeholder: 'e.g. 1, 2, 3' },
    { key: 'setB', label: 'B', color: COL_B, placeholder: 'e.g. 2, 3, 4' },
    { key: 'setC', label: 'C', color: COL_C, placeholder: 'e.g. 4, 5' },
];

function SetBadge({ elements, color }) {
    const arr = [...elements].slice(0, 10);
    const extra = elements.size - arr.length;
    if (elements.size === 0) {
        return <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>∅ (empty)</span>;
    }
    return (
        <div className="flex flex-wrap gap-1">
            {arr.map(el => (
                <span
                    key={el}
                    className="px-1.5 py-0.5 rounded-md text-xs font-mono font-medium"
                    style={{
                        background: `${color}10`,
                        border: `1px solid ${color}25`,
                        color,
                    }}
                >
                    {el}
                </span>
            ))}
            {extra > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>+{extra}</span>
            )}
        </div>
    );
}

function InvalidWarning({ items }) {
    if (!items.length) return null;
    return (
        <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: '#ff9f0a' }}>
            <AlertTriangle size={11} />
            <span>Not in Ω: <span className="font-mono">{items.join(', ')}</span></span>
        </div>
    );
}

function SummaryRow({ label, count, total, color, elements }) {
    const p = total > 0 ? count / total : 0;
    return (
        <div className="flex flex-col gap-1.5 rounded-xl px-3 py-2.5" style={{ background: 'var(--surface-2)' }}>
            <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold" style={{ color }}>{label}</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                    |{label}|={count} &nbsp; P={p.toFixed(3)}
                </span>
            </div>
            <SetBadge elements={elements} color={color} />
        </div>
    );
}

export default function DiscreteControlPanel({ inputs, updateInput, data }) {
    const { summary } = data || {};

    return (
        <div className="glass p-6 h-full">
            <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
                Set Input
            </h2>

            {/* Input Fields */}
            <div className="space-y-4">
                {SET_CONFIG.map(({ key, label, color, placeholder, isOmega }) => {
                    const invalid = summary
                        ? { setA: summary.invalidA, setB: summary.invalidB, setC: summary.invalidC }[key] || []
                        : [];

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                            className="space-y-1.5"
                        >
                            <label
                                htmlFor={`input-${key}`}
                                className="flex items-center gap-2 text-sm font-medium"
                                style={{ color }}
                            >
                                {isOmega ? <Layers size={13} /> : <Hash size={13} />}
                                {label}
                            </label>

                            <input
                                id={`input-${key}`}
                                type="text"
                                value={inputs[key]}
                                onChange={e => updateInput(key, e.target.value)}
                                placeholder={placeholder}
                                className="w-full px-4 py-2.5 rounded-xl font-mono text-sm outline-none transition-all duration-300"
                                style={{
                                    background: 'var(--surface-2)',
                                    border: `1px solid ${color}20`,
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = `${color}50`;
                                    e.target.style.boxShadow = `0 0 0 3px ${color}08`;
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = `${color}20`;
                                    e.target.style.boxShadow = 'none';
                                }}
                            />

                            <InvalidWarning items={invalid} />
                        </motion.div>
                    );
                })}
            </div>

            <div className="my-5" style={{ borderTop: '1px solid var(--border-subtle)' }} />

            {/* Parsed preview */}
            {summary && (
                <div className="space-y-2">
                    <div className="section-label mb-3 flex items-center gap-2">
                        <CheckCircle size={11} />
                        Parsed Sets
                        <span className="ml-auto font-mono" style={{ color: 'var(--text-tertiary)' }}>|Ω| = {summary.nOmega}</span>
                    </div>

                    {summary.nOmega === 0 ? (
                        <div className="text-xs flex items-center gap-2" style={{ color: '#ff9f0a' }}>
                            <AlertTriangle size={13} />
                            Sample space Ω cannot be empty.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <SummaryRow label="A" count={summary.nA} total={summary.nOmega}
                                color={COL_A} elements={summary.A} />
                            <SummaryRow label="B" count={summary.nB} total={summary.nOmega}
                                color={COL_B} elements={summary.B} />
                            <SummaryRow label="C" count={summary.nC} total={summary.nOmega}
                                color={COL_C} elements={summary.C} />

                            {/* Intersection mini-table */}
                            <div className="grid grid-cols-2 gap-1 mt-2 text-xs font-mono">
                                {[
                                    { label: 'A∩B', count: summary.nAB, color: '#8e8ce6' },
                                    { label: 'A∩C', count: summary.nAC, color: '#7ec8a0' },
                                    { label: 'B∩C', count: summary.nBC, color: '#e89040' },
                                    { label: 'A∩B∩C', count: summary.nABC, color: '#999' },
                                ].map(({ label, count, color }) => (
                                    <div key={label} className="flex justify-between rounded-lg px-2.5 py-1.5"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
                                        <span style={{ color }}>{label}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            {count} &nbsp; P={summary.nOmega > 0 ? (count / summary.nOmega).toFixed(3) : '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tip */}
            <div
                className="mt-5 p-3.5 rounded-xl text-xs leading-relaxed"
                style={{
                    background: 'var(--surface-2)',
                    border: '1px dashed var(--border-medium)',
                    color: 'var(--text-tertiary)',
                }}
            >
                <strong style={{ color: 'var(--text-secondary)' }}>Tip:</strong> Enter comma-separated values —
                numbers, letters, or words. Leave blank for ∅.
            </div>
        </div>
    );
}
