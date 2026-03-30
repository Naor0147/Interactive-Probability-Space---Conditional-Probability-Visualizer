import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ content }) {
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef(null);

    return (
        <span className="relative inline-flex items-center" ref={triggerRef}>
            <button
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onFocus={() => setVisible(true)}
                onBlur={() => setVisible(false)}
                className="transition-colors duration-200 focus:outline-none ml-1"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                aria-label="More information"
                tabIndex={0}
            >
                <HelpCircle size={13} />
            </button>

            <AnimatePresence>
                {visible && (
                    <motion.div
                        className="tooltip-content p-3.5 text-xs leading-relaxed"
                        style={{
                            left: '24px',
                            top: '-8px',
                            background: 'rgba(30, 30, 30, 0.92)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}
                        initial={{ opacity: 0, scale: 0.92, x: -4 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.92, x: -4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.5 }}
                    >
                        <div
                            className="absolute -left-1.5 top-3 w-2.5 h-2.5 rotate-45"
                            style={{
                                background: 'rgba(30, 30, 30, 0.92)',
                                borderLeft: '1px solid var(--border-medium)',
                                borderBottom: '1px solid var(--border-medium)',
                            }}
                        />
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}
