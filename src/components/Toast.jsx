import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function Toast({ message }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    key={message}
                    className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl"
                    style={{
                        background: 'rgba(30, 30, 30, 0.85)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,159,10,0.2)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                        x: '-50%',
                    }}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <AlertTriangle size={15} style={{ color: '#ff9f0a', flexShrink: 0 }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
