import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WhichKeyMenu.css';

interface Keymap {
  [key: string]: string | Keymap;
}

interface WhichKeyMenuProps {
  keymap: Keymap;
  path: string[];
  onKeyPress: (key: string) => void;
  onClose: () => void;
  onBack: () => void;
  enableAnimations?: boolean;
}

const WhichKeyMenu = ({ keymap, path, onKeyPress, onClose, onBack, enableAnimations = true }: WhichKeyMenuProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        onBack();
        return;
      }

      if (e.key.length === 1 && keymap) {
        const key = e.key.toLowerCase();
        // Find a keymap entry that starts with this key
        const matchingKey = Object.keys(keymap).find(k => {
          const displayKey = k.replace(/^\+/, '');
          return displayKey.charAt(0).toLowerCase() === key;
        });

        if (matchingKey) {
          onKeyPress(matchingKey);
        }
      }
    },
    [keymap, onKeyPress, onClose, onBack]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderKeymap = () => {
    if (!keymap) return null;

    return Object.entries(keymap).map(([key, value], index) => {
      const displayKey = key.replace(/^\+/, '');
      const isNested = typeof value !== 'string';
      const keyChar = displayKey.charAt(0);

      return (
        <motion.div
          key={key}
          className="keymap-item"
          onClick={() => onKeyPress(key)}
          initial={enableAnimations ? { opacity: 0, y: 20 } : false}
          animate={enableAnimations ? { opacity: 1, y: 0 } : false}
          exit={enableAnimations ? { opacity: 0, y: -20 } : false}
          transition={enableAnimations ? {
            duration: 0.12,
            ease: "easeOut"
          } : { duration: 0 }}
        >
          <span className="key-char">{keyChar}</span>
          <span className="key-description">{displayKey}</span>
          {isNested && <span className="nested-indicator">›</span>}
        </motion.div>
      );
    });
  };

  const renderBreadcrumb = () => {
    return (
      <>
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <div className="breadcrumb">
          {path.map((pathKey, index) => {
            const part = pathKey.replace(/^\+/, '');
            return (
              <span
                key={pathKey}
                className="breadcrumb-item"
              >
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                {part}
              </span>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <motion.div
      className="which-key-overlay"
      onClick={onClose}
      initial={enableAnimations ? { opacity: 0 } : false}
      animate={enableAnimations ? { opacity: 1 } : false}
      exit={enableAnimations ? { opacity: 0 } : false}
      transition={enableAnimations ? { duration: 0.15 } : { duration: 0 }}
    >
      <motion.div
        className="which-key-menu"
        onClick={(e) => e.stopPropagation()}
        initial={enableAnimations ? { y: 100 } : false}
        animate={enableAnimations ? { y: 0 } : false}
        exit={enableAnimations ? { y: 100 } : false}
        transition={enableAnimations ? { duration: 0.15, ease: "easeOut" } : { duration: 0 }}
      >
        <div className="header-spacer">
          {path.length > 0 && (
            <motion.div
              className="menu-header"
              initial={enableAnimations ? { opacity: 0, y: -10 } : false}
              animate={enableAnimations ? { opacity: 1, y: 0 } : false}
              exit={enableAnimations ? { opacity: 0, y: -10 } : false}
              transition={enableAnimations ? { duration: 0.12, delay: 0.12 } : { duration: 0 }}
            >
              {renderBreadcrumb()}
            </motion.div>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={path.join('/')} className="menu-items">
            {renderKeymap()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default WhichKeyMenu;
