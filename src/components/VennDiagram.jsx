import { motion } from 'framer-motion';
import { useMemo } from 'react';

const W = 520;
const H = 400;
const CX = W / 2;
const CY = H / 2;

const COL_A = '#5ac8fa';
const COL_B = '#bf5af2';
const COL_C = '#ff9f0a';

function probToRadius(p) {
    return 30 + p * 110;
}

function overlapToDistance(rX, rY, pIntersect) {
    const maxOverlap = Math.PI * Math.min(rX, rY) ** 2;
    const fraction = Math.min(1, (pIntersect * 10000) / maxOverlap);
    const dMax = rX + rY;
    const dMin = Math.abs(rX - rY);
    return dMax - fraction * (dMax - dMin);
}

function computePositions(rA, rB, rC, dAB, dAC, dBC) {
    const ax = CX - dAB / 2;
    const ay = CY;
    const bx = CX + dAB / 2;
    const by = CY;
    const d = dAB || 1;
    const x = (dAC ** 2 - dBC ** 2 + d ** 2) / (2 * d);
    const y2 = dAC ** 2 - x ** 2;
    const cy_ = Math.sqrt(Math.max(0, y2));
    return [
        { x: ax, y: ay },
        { x: bx, y: by },
        { x: ax + x, y: ay + cy_ * 0.85 },
    ];
}

function useDerivedGeo(probs) {
    return useMemo(() => {
        const { pA, pB, pC, pAB, pAC, pBC } = probs;
        const rA = probToRadius(pA);
        const rB = probToRadius(pB);
        const rC = probToRadius(pC);
        const dAB = overlapToDistance(rA, rB, pAB);
        const dAC = overlapToDistance(rA, rC, pAC);
        const dBC = overlapToDistance(rB, rC, pBC);
        const centres = computePositions(rA, rB, rC, dAB, dAC, dBC);
        return { rA, rB, rC, centres };
    }, [probs]);
}

/**
 * Compute approximate centroid for each logical region.
 */
function computeRegionCentroids(posA, rA, posB, rB, posC, rC) {
    const cx = (posA.x + posB.x + posC.x) / 3;
    const cy = (posA.y + posB.y + posC.y) / 3;

    const norm = (v) => {
        const l = Math.sqrt(v.x * v.x + v.y * v.y) || 1;
        return { x: v.x / l, y: v.y / l };
    };

    const dirA = norm({ x: posA.x - cx, y: posA.y - cy });
    const dirB = norm({ x: posB.x - cx, y: posB.y - cy });
    const dirC = norm({ x: posC.x - cx, y: posC.y - cy });

    const push = 0.42;

    return {
        onlyA: { x: posA.x + dirA.x * rA * push, y: posA.y + dirA.y * rA * push },
        onlyB: { x: posB.x + dirB.x * rB * push, y: posB.y + dirB.y * rB * push },
        onlyC: { x: posC.x + dirC.x * rC * push, y: posC.y + dirC.y * rC * push },
        AB_only: { x: (posA.x + posB.x) / 2, y: (posA.y + posB.y) / 2 - 8 },
        AC_only: { x: (posA.x + posC.x) / 2 - 8, y: (posA.y + posC.y) / 2 + 8 },
        BC_only: { x: (posB.x + posC.x) / 2 + 8, y: (posB.y + posC.y) / 2 + 8 },
        ABC: { x: cx, y: cy },
    };
}

/** Render a cluster of element labels around a centroid */
function ElementCluster({ elements, cx, cy, color }) {
    const arr = [...elements].slice(0, 8);
    if (!arr.length) return null;

    const count = arr.length;
    const cols = count > 4 ? 3 : count > 1 ? 2 : 1;
    const cellW = 22;
    const cellH = 16;
    const totalW = cols * cellW;
    const rows = Math.ceil(count / cols);
    const totalH = rows * cellH;

    return arr.map((el, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = cx - totalW / 2 + col * cellW + cellW / 2;
        const y = cy - totalH / 2 + row * cellH + cellH / 2;

        return (
            <motion.g key={`${el}-${i}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
            >
                <rect
                    x={x - 9} y={y - 7}
                    width={18} height={14}
                    rx={4}
                    fill={`${color}15`}
                    stroke={`${color}40`}
                    strokeWidth={0.7}
                />
                <text
                    x={x} y={y + 3.5}
                    textAnchor="middle"
                    fontSize={el.length > 2 ? 7 : 8.5}
                    fill={color}
                    fontFamily="'Inter', sans-serif"
                    fontWeight="600"
                    opacity="0.85"
                >
                    {el.length > 5 ? el.slice(0, 4) + '…' : el}
                </text>
            </motion.g>
        );
    });
}

/** Outside-universe elements */
function OutsideElements({ elements }) {
    const arr = [...elements].slice(0, 12);
    if (!arr.length) return null;

    const positions = [
        { x: 28, y: 24 }, { x: 60, y: 24 }, { x: 28, y: 48 }, { x: 60, y: 48 },
        { x: 480, y: 24 }, { x: 455, y: 24 }, { x: 480, y: 50 }, { x: 455, y: 50 },
        { x: 28, y: 360 }, { x: 60, y: 360 }, { x: 480, y: 360 }, { x: 455, y: 360 },
    ];

    return arr.map((el, i) => {
        const pos = positions[i] || { x: 30 + (i * 28) % 460, y: 370 };
        return (
            <motion.g key={`out-${el}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
            >
                <rect x={pos.x - 10} y={pos.y - 8} width={20} height={15} rx={4}
                    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.6} strokeDasharray="3 2" />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.3)"
                    fontFamily="'Inter', sans-serif" fontWeight="500">
                    {el.length > 4 ? el.slice(0, 3) + '…' : el}
                </text>
            </motion.g>
        );
    });
}

const springCircle = { type: 'spring', stiffness: 220, damping: 28, mass: 0.9 };

export default function VennDiagram({ probs, highlight, elementRegions }) {
    const { rA, rB, rC, centres } = useDerivedGeo(probs);
    const [posA, posB, posC] = centres;

    const isZeroA = probs.pA < 0.01;
    const isZeroB = probs.pB < 0.01;
    const isZeroC = probs.pC < 0.01;

    const regionCentroids = useMemo(
        () => computeRegionCentroids(posA, rA, posB, rB, posC, rC),
        [posA.x, posA.y, rA, posB.x, posB.y, rB, posC.x, posC.y, rC]
    );

    function glowA() {
        if (!highlight) return 0;
        return ['A', 'AB', 'AC', 'ABC', 'AuB', 'AuBuC', 'AGB', 'AGC'].includes(highlight) ? 1 : 0;
    }
    function glowB() {
        if (!highlight) return 0;
        return ['B', 'AB', 'BC', 'ABC', 'AuB', 'AuBuC', 'BGB', 'BGC'].includes(highlight) ? 1 : 0;
    }
    function glowC() {
        if (!highlight) return 0;
        return ['C', 'AC', 'BC', 'ABC', 'AuBuC', 'CGC'].includes(highlight) ? 1 : 0;
    }

    return (
        <div className="relative w-full">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{
                    borderRadius: 'var(--radius-lg)',
                    background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.02) 0%, var(--surface-1) 70%)',
                    border: '1px solid var(--border-subtle)',
                }}
            >
                <defs>
                    {/* Radial gradient fills for circles */}
                    <radialGradient id="grad-a" cx="40%" cy="40%">
                        <stop offset="0%" stopColor={COL_A} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={COL_A} stopOpacity="0.06" />
                    </radialGradient>
                    <radialGradient id="grad-b" cx="60%" cy="40%">
                        <stop offset="0%" stopColor={COL_B} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={COL_B} stopOpacity="0.06" />
                    </radialGradient>
                    <radialGradient id="grad-c" cx="50%" cy="60%">
                        <stop offset="0%" stopColor={COL_C} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={COL_C} stopOpacity="0.06" />
                    </radialGradient>

                    <filter id="glow-soft" x="-40%" y="-40%" width="180%" height="180%">
                        <feGaussianBlur stdDeviation="10" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="14" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Universe boundary */}
                <rect x="12" y="12" width={W - 24} height={H - 24} rx="18"
                    fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Ω label */}
                <text x="24" y="32" fontSize="11" fill="rgba(255,255,255,0.15)"
                    fontFamily="'Inter', sans-serif" fontWeight="500">
                    Ω
                </text>

                {/* Outside elements */}
                {elementRegions && <OutsideElements elements={elementRegions.outside} />}

                {/* ── Circle A ── */}
                <motion.circle
                    cx={posA.x} cy={posA.y} r={rA}
                    fill={isZeroA ? 'transparent' : 'url(#grad-a)'}
                    stroke={COL_A}
                    strokeWidth={isZeroA ? 0.8 : 1.5}
                    strokeDasharray={isZeroA ? '6 4' : 'none'}
                    filter={glowA() > 0 ? 'url(#glow-soft)' : undefined}
                    style={{ mixBlendMode: 'screen' }}
                    animate={{
                        cx: posA.x, cy: posA.y, r: rA,
                        opacity: isZeroA ? 0.25 : 1,
                        strokeOpacity: isZeroA ? 0.3 : (0.5 + glowA() * 0.5)
                    }}
                    transition={springCircle}
                />

                {/* ── Circle B ── */}
                <motion.circle
                    cx={posB.x} cy={posB.y} r={rB}
                    fill={isZeroB ? 'transparent' : 'url(#grad-b)'}
                    stroke={COL_B}
                    strokeWidth={isZeroB ? 0.8 : 1.5}
                    strokeDasharray={isZeroB ? '6 4' : 'none'}
                    filter={glowB() > 0 ? 'url(#glow-soft)' : undefined}
                    style={{ mixBlendMode: 'screen' }}
                    animate={{
                        cx: posB.x, cy: posB.y, r: rB,
                        opacity: isZeroB ? 0.25 : 1,
                        strokeOpacity: isZeroB ? 0.3 : (0.5 + glowB() * 0.5)
                    }}
                    transition={springCircle}
                />

                {/* ── Circle C ── */}
                <motion.circle
                    cx={posC.x} cy={posC.y} r={rC}
                    fill={isZeroC ? 'transparent' : 'url(#grad-c)'}
                    stroke={COL_C}
                    strokeWidth={isZeroC ? 0.8 : 1.5}
                    strokeDasharray={isZeroC ? '6 4' : 'none'}
                    filter={glowC() > 0 ? 'url(#glow-soft)' : undefined}
                    style={{ mixBlendMode: 'screen' }}
                    animate={{
                        cx: posC.x, cy: posC.y, r: rC,
                        opacity: isZeroC ? 0.25 : 1,
                        strokeOpacity: isZeroC ? 0.3 : (0.5 + glowC() * 0.5)
                    }}
                    transition={springCircle}
                />

                {/* ── Intersection highlight overlays ── */}
                {(highlight === 'AB' || highlight === 'BA') && !isZeroA && !isZeroB && (
                    <circle cx={(posA.x + posB.x) / 2} cy={(posA.y + posB.y) / 2}
                        r={Math.min(rA, rB) * 0.55} fill="rgba(142,140,230,0.25)"
                        filter="url(#glow-strong)" className="venn-highlight" />
                )}
                {(highlight === 'AC' || highlight === 'CA') && !isZeroA && !isZeroC && (
                    <circle cx={(posA.x + posC.x) / 2} cy={(posA.y + posC.y) / 2}
                        r={Math.min(rA, rC) * 0.55} fill="rgba(126,200,160,0.25)"
                        filter="url(#glow-strong)" className="venn-highlight" />
                )}
                {(highlight === 'BC' || highlight === 'CB') && !isZeroB && !isZeroC && (
                    <circle cx={(posB.x + posC.x) / 2} cy={(posB.y + posC.y) / 2}
                        r={Math.min(rB, rC) * 0.55} fill="rgba(232,144,64,0.25)"
                        filter="url(#glow-strong)" className="venn-highlight" />
                )}
                {highlight === 'ABC' && !isZeroA && !isZeroB && !isZeroC && (
                    <circle cx={(posA.x + posB.x + posC.x) / 3} cy={(posA.y + posB.y + posC.y) / 3}
                        r={Math.min(rA, rB, rC) * 0.4} fill="rgba(255,255,255,0.15)"
                        filter="url(#glow-strong)" className="venn-highlight" />
                )}

                {/* ── Discrete-mode element clusters ── */}
                {elementRegions && (
                    <>
                        {!isZeroA && (
                            <ElementCluster elements={elementRegions.onlyA}
                                cx={regionCentroids.onlyA.x} cy={regionCentroids.onlyA.y} color={COL_A} />
                        )}
                        {!isZeroB && (
                            <ElementCluster elements={elementRegions.onlyB}
                                cx={regionCentroids.onlyB.x} cy={regionCentroids.onlyB.y} color={COL_B} />
                        )}
                        {!isZeroC && (
                            <ElementCluster elements={elementRegions.onlyC}
                                cx={regionCentroids.onlyC.x} cy={regionCentroids.onlyC.y} color={COL_C} />
                        )}
                        {!isZeroA && !isZeroB && (
                            <ElementCluster elements={elementRegions.AB_only}
                                cx={regionCentroids.AB_only.x} cy={regionCentroids.AB_only.y} color="#8e8ce6" />
                        )}
                        {!isZeroA && !isZeroC && (
                            <ElementCluster elements={elementRegions.AC_only}
                                cx={regionCentroids.AC_only.x} cy={regionCentroids.AC_only.y} color="#7ec8a0" />
                        )}
                        {!isZeroB && !isZeroC && (
                            <ElementCluster elements={elementRegions.BC_only}
                                cx={regionCentroids.BC_only.x} cy={regionCentroids.BC_only.y} color="#e89040" />
                        )}
                        {!isZeroA && !isZeroB && !isZeroC && (
                            <ElementCluster elements={elementRegions.ABC}
                                cx={regionCentroids.ABC.x} cy={regionCentroids.ABC.y} color="#ffffff" />
                        )}
                    </>
                )}

                {/* ── Labels ── */}
                {!isZeroA && (
                    <motion.text x={posA.x - rA * 0.55} y={posA.y - rA * 0.6}
                        fill={COL_A} fontSize="14" fontWeight="700" fontFamily="'Inter', sans-serif"
                        opacity="0.8"
                        animate={{ x: posA.x - rA * 0.55, y: posA.y - rA * 0.6 }}
                        transition={springCircle}>
                        A
                    </motion.text>
                )}
                {!isZeroB && (
                    <motion.text x={posB.x + rB * 0.45} y={posB.y - rB * 0.6}
                        fill={COL_B} fontSize="14" fontWeight="700" fontFamily="'Inter', sans-serif"
                        opacity="0.8"
                        animate={{ x: posB.x + rB * 0.45, y: posB.y - rB * 0.6 }}
                        transition={springCircle}>
                        B
                    </motion.text>
                )}
                {!isZeroC && (
                    <motion.text x={posC.x - 6} y={posC.y + rC * 0.75}
                        fill={COL_C} fontSize="14" fontWeight="700" fontFamily="'Inter', sans-serif"
                        opacity="0.8"
                        animate={{ x: posC.x - 6, y: posC.y + rC * 0.75 }}
                        transition={springCircle}>
                        C
                    </motion.text>
                )}

                {/* ── Probability labels (slider mode only) ── */}
                {!elementRegions && (
                    <>
                        {!isZeroA && (
                            <motion.text x={posA.x - rA * 0.52} y={posA.y + 5}
                                fill={`${COL_A}99`} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="500"
                                animate={{ x: posA.x - rA * 0.52, y: posA.y + 5 }}
                                transition={springCircle}>
                                {probs.pA.toFixed(2)}
                            </motion.text>
                        )}
                        {!isZeroB && (
                            <motion.text x={posB.x + rB * 0.28} y={posB.y + 5}
                                fill={`${COL_B}99`} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="500"
                                animate={{ x: posB.x + rB * 0.28, y: posB.y + 5 }}
                                transition={springCircle}>
                                {probs.pB.toFixed(2)}
                            </motion.text>
                        )}
                        {!isZeroC && (
                            <motion.text x={posC.x - 14} y={posC.y + rC * 0.48}
                                fill={`${COL_C}99`} fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="500"
                                animate={{ x: posC.x - 14, y: posC.y + rC * 0.48 }}
                                transition={springCircle}>
                                {probs.pC.toFixed(2)}
                            </motion.text>
                        )}
                    </>
                )}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-5 mt-4 justify-center text-xs">
                {[
                    { col: COL_A, label: 'Event A', zero: isZeroA },
                    { col: COL_B, label: 'Event B', zero: isZeroB },
                    { col: COL_C, label: 'Event C', zero: isZeroC },
                ].map(({ col, label, zero }) => (
                    <div key={label} className="flex items-center gap-2" style={{ opacity: zero ? 0.3 : 0.7 }}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: col }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
