import { useEffect, useCallback, useState, useRef } from 'react';
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
  majorModeApp?: string | null;
  hydraMode?: boolean;
  onToggleHydra?: () => void;
}

interface CategoryStyle {
  icon: string;
  color: string;
}

const getCategoryStyle = (key: string, value: string | Keymap): CategoryStyle => {
  const keyLower = key.toLowerCase();
  const valueLower = typeof value === 'string' ? value.toLowerCase() : '';

  // Apps
  if (keyLower.includes('app') || keyLower.includes('terminal') || keyLower.includes('browser') ||
      keyLower.includes('editor') || keyLower.includes('finder')) {
    return { icon: '🚀', color: 'rgba(100, 200, 255, 0.25)' };
  }

  // Files
  if (keyLower.includes('file') || keyLower.includes('save') || keyLower.includes('open') ||
      keyLower.includes('download') || keyLower.includes('document') || keyLower.includes('home') ||
      keyLower.includes('desktop')) {
    return { icon: '📁', color: 'rgba(100, 180, 255, 0.25)' };
  }

  // Git
  if (keyLower.includes('git') || valueLower.includes('git')) {
    return { icon: '🔀', color: 'rgba(255, 150, 50, 0.25)' };
  }

  // System
  if (keyLower.includes('system') || keyLower.includes('lock') || keyLower.includes('sleep') ||
      keyLower.includes('restart') || keyLower.includes('shutdown')) {
    return { icon: '⚙️', color: 'rgba(150, 150, 150, 0.25)' };
  }

  // Window
  if (keyLower.includes('window') || keyLower.includes('focus') || keyLower.includes('swap') ||
      keyLower.includes('float') || keyLower.includes('fullscreen') || keyLower.includes('minimize') ||
      keyLower.includes('close') || keyLower.includes('new')) {
    return { icon: '🪟', color: 'rgba(180, 100, 255, 0.25)' };
  }

  // Media
  if (keyLower.includes('media') || keyLower.includes('music') || keyLower.includes('volume') ||
      keyLower.includes('mute') || keyLower.includes('screenshot') || keyLower.includes('record')) {
    return { icon: '🎵', color: 'rgba(255, 100, 180, 0.25)' };
  }

  // Space (workspace)
  if (keyLower.includes('space') || keyLower.includes('layout') || keyLower.includes('balance')) {
    return { icon: '🗂️', color: 'rgba(100, 255, 150, 0.25)' };
  }

  // Nested/group indicator
  if (typeof value === 'object') {
    return { icon: '📂', color: 'rgba(255, 200, 100, 0.25)' };
  }

  // Default
  return { icon: '⚡', color: 'rgba(255, 0, 68, 0.25)' };
};

const WhichKeyMenu = ({
  keymap,
  path,
  onKeyPress,
  onClose,
  onBack,
  enableAnimations = true,
  majorModeApp = null,
  hydraMode = false,
  onToggleHydra = () => {}
}: WhichKeyMenuProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const flattenKeymap = (km: Keymap, prefix: string[] = []): Array<{key: string, value: string | Keymap, path: string[]}> => {
    const result: Array<{key: string, value: string | Keymap, path: string[]}> = [];

    Object.entries(km).forEach(([key, value]) => {
      const currentPath = [...prefix, key];
      result.push({ key, value, path: currentPath });

      if (typeof value === 'object') {
        result.push(...flattenKeymap(value, currentPath));
      }
    });

    return result;
  };

  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;

    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Fast path: exact substring match
    if (textLower.includes(queryLower)) return true;

    // Split query by spaces for multi-word search
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

    // Each word must match (fuzzy)
    for (const word of queryWords) {
      let textIndex = 0;
      let matched = true;

      // Check if all characters in word appear in order in text
      for (const char of word) {
        const foundIndex = textLower.indexOf(char, textIndex);
        if (foundIndex === -1) {
          matched = false;
          break;
        }
        textIndex = foundIndex + 1;
      }

      if (!matched) return false;
    }

    return true;
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Enter search mode
      if (e.key === '/' && !isSearchMode) {
        e.preventDefault();
        setIsSearchMode(true);
        setSearchQuery('');
        setTimeout(() => searchInputRef.current?.focus(), 10);
        return;
      }

      // Exit search mode
      if (e.key === 'Escape') {
        if (isSearchMode) {
          setIsSearchMode(false);
          setSearchQuery('');
          return;
        }
        onClose();
        return;
      }

      // Don't process keys in search mode (let input handle them)
      if (isSearchMode) {
        return;
      }

      // Toggle hydra mode with 'H' key
      if (e.key === 'H' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onToggleHydra();
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
    [keymap, onKeyPress, onClose, onBack, isSearchMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderKeymap = () => {
    if (!keymap) return null;

    // Search mode: show all keys (flattened) that match the query
    if (isSearchMode) {
      const allKeys = flattenKeymap(keymap);
      const filtered = searchQuery
        ? allKeys.filter(item => {
            const displayKey = item.key.replace(/^\+/, '');
            const fullPath = item.path.map(k => k.replace(/^\+/, '')).join(' → ');
            return fuzzyMatch(displayKey, searchQuery) || fuzzyMatch(fullPath, searchQuery);
          })
        : allKeys; // Show all keys when query is empty

      return filtered.map((item) => {
        const displayKey = item.key.replace(/^\+/, '');
        const isNested = typeof item.value !== 'string';
        const keyChar = displayKey.charAt(0);
        const style = getCategoryStyle(item.key, item.value);
        const pathDisplay = item.path.slice(0, -1).map(k => k.replace(/^\+/, '')).join(' → ');

        return (
          <motion.div
            key={item.path.join('/')}
            className="keymap-item"
            onClick={() => {
              // Navigate to this item by clicking through the path
              item.path.forEach(p => onKeyPress(p));
            }}
            style={{
              background: `linear-gradient(135deg, ${style.color}, rgba(26, 26, 26, 0.95))`
            }}
            initial={enableAnimations ? { opacity: 0, y: 20 } : undefined}
            animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
            exit={enableAnimations ? { opacity: 0, y: -20 } : undefined}
            transition={enableAnimations ? {
              duration: 0.12,
              ease: "easeOut"
            } : { duration: 0 }}
          >
            <span className="key-icon">{style.icon}</span>
            <span className="key-char">{keyChar}</span>
            <div className="key-description-container">
              <span className="key-description">{displayKey}</span>
              {pathDisplay && <span className="key-path">{pathDisplay}</span>}
            </div>
            {isNested && <span className="nested-indicator">›</span>}
          </motion.div>
        );
      });
    }

    // Normal mode: show current level only
    return Object.entries(keymap).map(([key, value]) => {
      const displayKey = key.replace(/^\+/, '');
      const isNested = typeof value !== 'string';
      const keyChar = displayKey.charAt(0);
      const style = getCategoryStyle(key, value);

      return (
        <motion.div
          key={key}
          className="keymap-item"
          onClick={() => onKeyPress(key)}
          style={{
            background: `linear-gradient(135deg, ${style.color}, rgba(26, 26, 26, 0.95))`
          }}
          initial={enableAnimations ? { opacity: 0, y: 20 } : undefined}
          animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
          exit={enableAnimations ? { opacity: 0, y: -20 } : undefined}
          transition={enableAnimations ? {
            duration: 0.12,
            ease: "easeOut"
          } : { duration: 0 }}
        >
          <span className="key-icon">{style.icon}</span>
          <span className="key-char">{keyChar}</span>
          <span className="key-description">{displayKey}</span>
          {isNested && <span className="nested-indicator">›</span>}
        </motion.div>
      );
    });
  };

  const renderBreadcrumb = () => {
    // Format major mode app name
    const formatAppName = (bundleId: string) => {
      const parts = bundleId.split('.');
      const name = parts[parts.length - 1];
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    return (
      <>
        {path.length > 0 && (
          <button className="back-button" onClick={onBack}>
            ←
          </button>
        )}
        <div className="breadcrumb">
          {majorModeApp && path.length === 0 && (
            <span className="breadcrumb-item major-mode-indicator">
              Major Mode: {formatAppName(majorModeApp)}
            </span>
          )}
          {path.map((pathKey, index) => {
            const part = pathKey.replace(/^\+/, '');
            return (
              <span
                key={pathKey}
                className="breadcrumb-item"
              >
                {(index > 0 || (majorModeApp && path.length > 0)) && <span className="breadcrumb-separator">/</span>}
                {part}
              </span>
            );
          })}
        </div>
      </>
    );
  };

  const renderKeySequence = () => {
    if (path.length === 0) return null;

    return (
      <motion.div
        className="key-sequence"
        initial={enableAnimations ? { opacity: 0, y: -5 } : undefined}
        animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
        exit={enableAnimations ? { opacity: 0, y: -5 } : undefined}
        transition={enableAnimations ? { duration: 0.1 } : { duration: 0 }}
      >
        {path.map((key, index) => (
          <span key={index} className="key-sequence-part">
            <span className="key-sequence-key">{key.replace(/^\+/, '')}</span>
            {index < path.length - 1 && <span className="key-sequence-arrow">→</span>}
          </span>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div
      className="which-key-overlay"
      onClick={onClose}
      initial={enableAnimations ? { opacity: 0 } : undefined}
      animate={enableAnimations ? { opacity: 1 } : undefined}
      exit={enableAnimations ? { opacity: 0 } : undefined}
      transition={enableAnimations ? { duration: 0.15 } : { duration: 0 }}
    >
      <motion.div
        className="which-key-menu"
        onClick={(e) => e.stopPropagation()}
        initial={enableAnimations ? { y: 100 } : undefined}
        animate={enableAnimations ? { y: 0 } : undefined}
        exit={enableAnimations ? { y: 100 } : undefined}
        transition={enableAnimations ? { duration: 0.15, ease: "easeOut" } : { duration: 0 }}
      >
        <div className="header-spacer">
          {majorModeApp && path.length === 0 && (
            <motion.div
              className="menu-header"
              initial={enableAnimations ? { opacity: 0, y: -10 } : undefined}
              animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
              exit={enableAnimations ? { opacity: 0, y: -10 } : undefined}
              transition={enableAnimations ? { duration: 0.12, delay: 0.12 } : { duration: 0 }}
            >
              {renderBreadcrumb()}
            </motion.div>
          )}
          {renderKeySequence()}
          {!isSearchMode && (
            <div className="help-hint">
              <span className="help-text">
                Press <kbd>/</kbd> to search • <kbd>H</kbd> to toggle Hydra mode
                {hydraMode && <span className="hydra-indicator"> 🔒 HYDRA</span>}
              </span>
            </div>
          )}
        </div>
        {isSearchMode && (
          <motion.div
            className="search-container"
            initial={enableAnimations ? { opacity: 0, y: -10 } : undefined}
            animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
            exit={enableAnimations ? { opacity: 0, y: -10 } : undefined}
            transition={enableAnimations ? { duration: 0.1 } : { duration: 0 }}
          >
            <span className="search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search keymaps... (Esc to exit)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                // Don't stop Escape propagation so it can exit search mode
                if (e.key !== 'Escape') {
                  e.stopPropagation();
                }
              }}
            />
            {searchQuery && (
              <span className="search-clear" onClick={() => setSearchQuery('')}>✕</span>
            )}
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={path.join('/') + searchQuery} className="menu-items">
            {renderKeymap()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default WhichKeyMenu;
