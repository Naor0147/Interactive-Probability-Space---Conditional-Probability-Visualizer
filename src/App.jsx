import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Grid3X3, Sun, Moon } from 'lucide-react';
import { useProbability } from './hooks/useProbability.js';
import { useDiscreteSet } from './hooks/useDiscreteSet.js';
import ControlPanel from './components/ControlPanel.jsx';
import DiscreteControlPanel from './components/DiscreteControlPanel.jsx';
import VennDiagram from './components/VennDiagram.jsx';
import DataCards from './components/DataCards.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import Toast from './components/Toast.jsx';

// ── Spring presets ───────────────────────────────────────────────────────────
const springSmooth = { type: 'spring', stiffness: 200, damping: 28, mass: 0.8 };
const springSnappy = { type: 'spring', stiffness: 400, damping: 35 };

// ── Mode Toggle (segmented control) ─────────────────────────────────────────
function ModeToggle({ mode, onToggle }) {
    const isSlider = mode === 'slider';
    return (
        <div
            className="relative flex items-center rounded-full p-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            <motion.div
                className="absolute top-0.5 left-0.5 rounded-full"
                style={{
                    width: 'calc(50% - 2px)',
                    height: 'calc(100% - 4px)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
                animate={{ x: isSlider ? 0 : '100%' }}
                transition={springSnappy}
            />
            <button
                onClick={() => !isSlider && onToggle()}
                className="relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-colors duration-200"
                style={{ color: isSlider ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            >
                <Sliders size={12} />
                Continuous
            </button>
            <button
                onClick={() => isSlider && onToggle()}
                className="relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-colors duration-200"
                style={{ color: !isSlider ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            >
                <Grid3X3 size={12} />
                Discrete
            </button>
        </div>
    );
}

// ── Header ──────────────────────────────────────────────────────────────────
function Header({ mode, onToggle }) {
    return (
        <header className="relative px-6 sm:px-10 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl sm:text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Probability Space
                    </h1>
                    <p
                        className="text-sm mt-1 font-light"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {mode === 'slider'
                            ? 'Drag sliders to explore (Ω, 𝓕, P) in real-time'
                            : 'Enter elements — probabilities computed from set sizes'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <ModeToggle mode={mode} onToggle={onToggle} />
                </div>
            </div>
        </header>
    );
}

// ── Slider-mode content ─────────────────────────────────────────────────────
function SliderModeContent({ highlight, onHighlight }) {
    const { probs, update, calc, toast } = useProbability();
    return (
        <>
            <motion.aside
                key="slider-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={springSmooth}
                className="xl:sticky xl:top-6 xl:h-fit"
            >
                <ControlPanel probs={probs} update={update} />
            </motion.aside>

            <motion.div
                key="slider-right"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ ...springSmooth, delay: 0.06 }}
                className="flex flex-col gap-6"
            >
                <VennDiagramPanel probs={probs} highlight={highlight} elementRegions={null} />
                <DataCards calc={calc} probs={probs} highlight={highlight} onHighlight={onHighlight} />
                <InsightsPanel probs={probs} calc={calc} />
            </motion.div>
            <Toast message={toast} />
        </>
    );
}

// ── Discrete-mode content ───────────────────────────────────────────────────
function DiscreteModeContent({ highlight, onHighlight }) {
    const { inputs, updateInput, data } = useDiscreteSet();
    const probs = data?.probs ?? { pA: 0, pB: 0, pC: 0, pAB: 0, pAC: 0, pBC: 0, pABC: 0 };
    const calc = data?.calc ?? {};
    const regions = data?.regions ?? null;

    return (
        <>
            <motion.aside
                key="discrete-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={springSmooth}
                className="xl:sticky xl:top-6 xl:h-fit"
            >
                <DiscreteControlPanel inputs={inputs} updateInput={updateInput} data={data} />
            </motion.aside>

            <motion.div
                key="discrete-right"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ ...springSmooth, delay: 0.06 }}
                className="flex flex-col gap-6"
            >
                <VennDiagramPanel probs={probs} highlight={highlight} elementRegions={regions} />
                <DataCards calc={calc} probs={probs} highlight={highlight} onHighlight={onHighlight} />
                <InsightsPanel probs={probs} calc={calc} />
            </motion.div>
        </>
    );
}

// ── Shared Venn panel wrapper ───────────────────────────────────────────────
function VennDiagramPanel({ probs, highlight, elementRegions }) {
    return (
        <div className="glass p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Venn Diagram
                    {elementRegions && (
                        <span className="text-xs font-normal ml-2" style={{ color: 'var(--text-tertiary)' }}>
                            — elements mapped to regions
                        </span>
                    )}
                </h2>
                {highlight && (
                    <motion.div
                        className="text-xs font-mono px-3 py-1 rounded-full"
                        style={{
                            background: 'rgba(191,90,242,0.1)',
                            border: '1px solid rgba(191,90,242,0.2)',
                            color: '#bf5af2',
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={springSnappy}
                    >
                        {highlight}
                    </motion.div>
                )}
            </div>
            <VennDiagram probs={probs} highlight={highlight} elementRegions={elementRegions} />
            <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {elementRegions
                    ? 'Elements placed in their exact region — hover cards to highlight'
                    : 'Hover probability cards to highlight regions'}
            </p>
        </div>
    );
}

// ── Root App ────────────────────────────────────────────────────────────────
export default function App() {
    const [mode, setMode] = useState('slider');
    const [highlight, setHighlight] = useState(null);
    const onHighlight = useCallback(k => setHighlight(k), []);
    const onToggle = () => {
        setMode(m => m === 'slider' ? 'discrete' : 'slider');
        setHighlight(null);
    };

    return (
        <div className="min-h-screen relative" style={{ background: 'var(--surface-0)' }}>
            {/* Ambient glow orbs */}
            <div className="ambient-glow" style={{ width: 600, height: 600, top: -200, left: -200, background: 'var(--col-a)' }} />
            <div className="ambient-glow" style={{ width: 500, height: 500, top: -100, right: -150, background: 'var(--col-b)' }} />
            <div className="ambient-glow" style={{ width: 400, height: 400, bottom: -100, left: '40%', background: 'var(--col-c)' }} />

            <div className="max-w-[1440px] mx-auto relative z-10">
                <Header mode={mode} onToggle={onToggle} />

                <main className="px-4 sm:px-10 pb-10 grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
                    <AnimatePresence mode="wait">
                        {mode === 'slider'
                            ? <SliderModeContent key="slider" highlight={highlight} onHighlight={onHighlight} />
                            : <DiscreteModeContent key="discrete" highlight={highlight} onHighlight={onHighlight} />
                        }
                    </AnimatePresence>
                </main>

                <footer
                    className="text-center py-6 text-xs font-light"
                    style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)' }}
                >
                    Probability Space Visualizer &nbsp;·&nbsp; (Ω, 𝓕, P) &nbsp;·&nbsp; A, B, C ⊆ Ω
                </footer>
            </div>
        </div>
    );
}
