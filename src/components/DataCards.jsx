import { motion } from 'framer-motion';
import Tooltip from './Tooltip.jsx';

const COL_A = '#5ac8fa';
const COL_B = '#bf5af2';
const COL_C = '#ff9f0a';

const TOOLTIP_MAP = {
    pAcB: 'P(A|B) — Given B occurred, what\'s the probability of A?',
    pBcA: 'P(B|A) — Given A occurred, what\'s the probability of B?',
    pAcC: 'P(A|C) — Given C occurred, what\'s the probability of A?',
    pCcA: 'P(C|A) — Given A occurred, what\'s the probability of C?',
    pBcC: 'P(B|C) — Given C occurred, what\'s the probability of B?',
    pCcB: 'P(C|B) — Given B occurred, what\'s the probability of C?',
    pAuB: 'P(A∪B) — The chance of A or B (or both). Formula: P(A)+P(B)−P(A∩B)',
    pAuC: 'P(A∪C) — The chance of A or C (or both).',
    pBuC: 'P(B∪C) — The chance of B or C (or both).',
    pAuBuC: 'P(A∪B∪C) — Full union via inclusion-exclusion.',
    pAc: 'P(Aᶜ) — Complement. Formula: 1 − P(A)',
    pBc: 'P(Bᶜ) — Complement. Formula: 1 − P(B)',
    pCc: 'P(Cᶜ) — Complement. Formula: 1 − P(C)',
};

const spring = { type: 'spring', stiffness: 300, damping: 30 };

function CardValue({ value }) {
    if (value === null) {
        return <span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>—</span>;
    }
    const formatted = value.toFixed(4);
    const pct = (value * 100).toFixed(1) + '%';
    return (
        <div className="flex flex-col items-end">
            <span className="font-mono font-semibold text-base leading-none" style={{ color: 'var(--text-primary)' }}>
                {formatted}
            </span>
            <span className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {pct}
            </span>
        </div>
    );
}

function DataCard({ label, formula, calcKey, value, highlight, onHover, accentColor, tooltipKey }) {
    const isHighlit = highlight === calcKey;
    return (
        <motion.div
            className="data-card glass-light p-3 flex justify-between items-center relative overflow-hidden"
            style={{
                borderColor: isHighlit ? `${accentColor}40` : 'var(--border-subtle)',
                borderWidth: '1px',
                borderStyle: 'solid',
            }}
            onMouseEnter={() => onHover(calcKey)}
            onMouseLeave={() => onHover(null)}
            whileHover={{ scale: 1.01 }}
            transition={spring}
        >
            {isHighlit && (
                <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at center, ${accentColor}08 0%, transparent 70%)` }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
            <div className="flex flex-col gap-0.5">
                <span
                    className="text-sm font-mono font-semibold"
                    style={{ color: accentColor }}
                >
                    {label}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formula}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <CardValue value={value} />
                <Tooltip content={TOOLTIP_MAP[tooltipKey || calcKey]} />
            </div>
        </motion.div>
    );
}

function SectionHeader({ title }) {
    return (
        <div
            className="col-span-full section-label pb-1.5 mt-3"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
            {title}
        </div>
    );
}

export default function DataCards({ calc, probs, highlight, onHighlight }) {
    const { pA, pB, pC, pAB, pAC, pBC } = probs;
    const h = highlight;
    const oh = onHighlight;

    return (
        <div className="glass p-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Computed Probabilities
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Conditionals */}
                <SectionHeader title="Conditionals" />
                <DataCard label="P(A|B)" formula={`${pAB.toFixed(3)} / ${pB.toFixed(3)}`}
                    calcKey="AB" value={calc.pAcB} highlight={h} onHover={oh} accentColor="#8e8ce6" tooltipKey="pAcB" />
                <DataCard label="P(B|A)" formula={`${pAB.toFixed(3)} / ${pA.toFixed(3)}`}
                    calcKey="BA" value={calc.pBcA} highlight={h} onHover={oh} accentColor="#8e8ce6" tooltipKey="pBcA" />
                <DataCard label="P(A|C)" formula={`${pAC.toFixed(3)} / ${pC.toFixed(3)}`}
                    calcKey="AC" value={calc.pAcC} highlight={h} onHover={oh} accentColor="#7ec8a0" tooltipKey="pAcC" />
                <DataCard label="P(C|A)" formula={`${pAC.toFixed(3)} / ${pA.toFixed(3)}`}
                    calcKey="CA" value={calc.pCcA} highlight={h} onHover={oh} accentColor="#7ec8a0" tooltipKey="pCcA" />
                <DataCard label="P(B|C)" formula={`${pBC.toFixed(3)} / ${pC.toFixed(3)}`}
                    calcKey="BC" value={calc.pBcC} highlight={h} onHover={oh} accentColor="#e89040" tooltipKey="pBcC" />
                <DataCard label="P(C|B)" formula={`${pBC.toFixed(3)} / ${pB.toFixed(3)}`}
                    calcKey="CB" value={calc.pCcB} highlight={h} onHover={oh} accentColor="#e89040" tooltipKey="pCcB" />

                {/* Unions */}
                <SectionHeader title="Unions" />
                <DataCard label="P(A∪B)" formula="P(A)+P(B)−P(A∩B)"
                    calcKey="AuB" value={calc.pAuB} highlight={h} onHover={oh} accentColor={COL_A} tooltipKey="pAuB" />
                <DataCard label="P(A∪C)" formula="P(A)+P(C)−P(A∩C)"
                    calcKey="AuC" value={calc.pAuC} highlight={h} onHover={oh} accentColor={COL_A} tooltipKey="pAuC" />
                <DataCard label="P(B∪C)" formula="P(B)+P(C)−P(B∩C)"
                    calcKey="BuC" value={calc.pBuC} highlight={h} onHover={oh} accentColor={COL_B} tooltipKey="pBuC" />
                <DataCard label="P(A∪B∪C)" formula="Inclusion-Exclusion"
                    calcKey="AuBuC" value={calc.pAuBuC} highlight={h} onHover={oh} accentColor={COL_C} tooltipKey="pAuBuC" />

                {/* Complements */}
                <SectionHeader title="Complements" />
                <DataCard label="P(Aᶜ)" formula="1 − P(A)"
                    calcKey="Ac" value={calc.pAc} highlight={h} onHover={oh} accentColor={COL_A} tooltipKey="pAc" />
                <DataCard label="P(Bᶜ)" formula="1 − P(B)"
                    calcKey="Bc" value={calc.pBc} highlight={h} onHover={oh} accentColor={COL_B} tooltipKey="pBc" />
                <DataCard label="P(Cᶜ)" formula="1 − P(C)"
                    calcKey="Cc" value={calc.pCc} highlight={h} onHover={oh} accentColor={COL_C} tooltipKey="pCc" />
            </div>
        </div>
    );
}
