import Tooltip from './Tooltip.jsx';
import { motion } from 'framer-motion';

const TOOLTIP_MAP = {
    pA: 'Marginal Probability P(A): The baseline chance of event A. Example: The probability it will rain today.',
    pB: 'Marginal Probability P(B): The baseline chance of event B. Example: The probability you forgot your umbrella.',
    pC: 'Marginal Probability P(C): The baseline chance of event C. Example: The probability of traffic on your commute.',
    pAB: 'Intersection P(A∩B): The chance of BOTH A and B occurring. Example: It rains AND you forgot your umbrella.',
    pAC: 'Intersection P(A∩C): The chance of BOTH A and C occurring.',
    pBC: 'Intersection P(B∩C): The chance of BOTH B and C occurring.',
    pABC: 'Triple Intersection P(A∩B∩C): All three events occurring simultaneously.',
};

const COL_A = '#5ac8fa';
const COL_B = '#bf5af2';
const COL_C = '#ff9f0a';

const PARAMS = [
    {
        section: 'Marginals',
        items: [
            { key: 'pA', label: 'P(A)', sliderClass: 'slider-a', color: COL_A },
            { key: 'pB', label: 'P(B)', sliderClass: 'slider-b', color: COL_B },
            { key: 'pC', label: 'P(C)', sliderClass: 'slider-c', color: COL_C },
        ],
    },
    {
        section: 'Pairwise',
        items: [
            { key: 'pAB', label: 'P(A∩B)', sliderClass: 'slider-ab', color: '#8e8ce6' },
            { key: 'pAC', label: 'P(A∩C)', sliderClass: 'slider-ac', color: '#7ec8a0' },
            { key: 'pBC', label: 'P(B∩C)', sliderClass: 'slider-bc', color: '#e89040' },
        ],
    },
    {
        section: 'Triple',
        items: [
            { key: 'pABC', label: 'P(A∩B∩C)', sliderClass: 'slider-abc', color: '#999' },
        ],
    },
];

const spring = { type: 'spring', stiffness: 260, damping: 26 };

function SliderRow({ item, value, onUpdate }) {
    const pct = `${(value * 100).toFixed(0)}%`;
    return (
        <motion.div
            className="flex items-center gap-3 py-1.5"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
        >
            {/* Label + Tooltip */}
            <div className="flex items-center min-w-[90px]">
                <span
                    className="text-xs font-mono font-semibold"
                    style={{ color: item.color }}
                >
                    {item.label}
                </span>
                <Tooltip content={TOOLTIP_MAP[item.key]} />
            </div>

            {/* Slider */}
            <div className="flex-1">
                <input
                    id={`slider-${item.key}`}
                    type="range"
                    min="0" max="1" step="0.01"
                    value={value}
                    className={`w-full ${item.sliderClass}`}
                    style={{ '--val': pct }}
                    onChange={e => onUpdate(item.key, e.target.value)}
                />
            </div>

            {/* Number input */}
            <input
                type="number"
                min="0" max="1" step="0.01"
                value={value.toFixed(2)}
                onChange={e => onUpdate(item.key, e.target.value)}
                className="w-[58px]"
                aria-label={`${item.label} value`}
            />
        </motion.div>
    );
}

export default function ControlPanel({ probs, update }) {
    return (
        <div className="glass p-6 h-full">
            <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
                Parameters
            </h2>

            <div className="space-y-5">
                {PARAMS.map(({ section, items }) => (
                    <div key={section}>
                        <div className="section-label mb-2.5 pb-1.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            {section}
                        </div>
                        <div className="space-y-0.5">
                            {items.map(item => (
                                <SliderRow
                                    key={item.key}
                                    item={item}
                                    value={probs[item.key]}
                                    onUpdate={update}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Live values mini summary */}
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="section-label mb-2">Current Values</div>
                <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                    {Object.entries(probs).map(([k, v]) => {
                        const label = {
                            pA: 'P(A)', pB: 'P(B)', pC: 'P(C)',
                            pAB: 'P(A∩B)', pAC: 'P(A∩C)', pBC: 'P(B∩C)',
                            pABC: 'P(A∩B∩C)',
                        }[k];
                        return (
                            <div
                                key={k}
                                className="flex justify-between rounded-lg px-2.5 py-1"
                                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
                            >
                                <span>{label}</span>
                                <span style={{ color: 'var(--text-primary)' }}>{v.toFixed(3)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
