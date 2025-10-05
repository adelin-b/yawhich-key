import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow, currentMonitor } from '@tauri-apps/api/window';
import { AnimatePresence } from 'framer-motion';
import WhichKeyMenu from './components/WhichKeyMenu';
import './App.css';

interface Keymap {
  [key: string]: string | Keymap;
}

interface AppSettings {
  animations: boolean;
}

function App() {
  const [visible, setVisible] = useState(false);
  const [keymaps, setKeymaps] = useState<Keymap>({});
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [configError, setConfigError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({ animations: true });
  const visibleRef = useRef(false);
  const isShowingRef = useRef(false);
  const keymapsRef = useRef<Keymap>({});
  const ignoreBlurRef = useRef(false);
  const sequenceCounterRef = useRef(0);

  useEffect(() => {
    const window = getCurrentWindow();

    // Hide window on startup
    window.hide();

    // Load keymaps and settings FIRST before setting up listeners
    const loadConfig = async () => {
      try {
        const [loadedKeymaps, loadedSettings] = await Promise.all([
          invoke<Keymap>('load_keymaps'),
          invoke<AppSettings>('load_settings')
        ]);
        setKeymaps(loadedKeymaps);
        keymapsRef.current = loadedKeymaps;
        setSettings(loadedSettings);
        console.log('[CONFIG] Loaded keymaps and settings, items:', Object.keys(loadedKeymaps).length);
      } catch (error) {
        console.error('Failed to load config:', error);
        setConfigError(error as string);
      }
    };

    loadConfig();

    // Listen for window blur (lose focus)
    const unlistenBlur = window.onFocusChanged(({ payload: focused }) => {
      // Ignore focus events during show sequence
      if (ignoreBlurRef.current) {
        console.log('[BLUR] Ignoring (during show sequence)');
        return;
      }

      console.log(`[BLUR] Focus changed: focused=${focused}, visible=${visibleRef.current}`);

      // Close if we lose focus while visible
      if (!focused && visibleRef.current) {
        console.log('[BLUR] Lost focus while visible → closing');
        handleClose();
      }
    });

    // Listen for global shortcut trigger
    const unlisten = listen('show-which-key', async () => {
      const seq = ++sequenceCounterRef.current;
      console.log(`[SHOW-01:${seq}] Event received`);

      // Prevent duplicate calls
      if (isShowingRef.current) {
        console.log(`[SHOW-XX:${seq}] Already showing → ignoring`);
        return;
      }

      console.log(`[SHOW-02:${seq}] Debounce passed`);
      isShowingRef.current = true;
      ignoreBlurRef.current = true;
      setCurrentPath([]);

      try {
        // Calculate window size
        const monitor = await currentMonitor();
        if (!monitor) {
          console.log(`[SHOW-ERR:${seq}] No monitor found`);
          return;
        }

        const screenWidth = monitor.size.width / monitor.scaleFactor;
        const rootKeymap = keymapsRef.current;
        const itemCount = rootKeymap ? Object.keys(rootKeymap).length : 0;

        // Use exact same calculation as resize effect
        const contentWidth = 1400;
        const minItemWidth = 280;
        const gap = 10;
        const padding = 48;
        const headerHeight = 88;
        const availableWidth = contentWidth - padding;
        const columns = Math.max(1, Math.floor((availableWidth + gap) / (minItemWidth + gap)));
        const rows = Math.ceil(itemCount / columns);
        const itemHeight = 48;
        const totalGaps = Math.max(0, (rows - 1) * gap);
        const calculatedHeight = headerHeight + padding + (rows * itemHeight) + totalGaps;
        const extraPadding = 10;
        const initialHeight = Math.max(150, Math.min(500, calculatedHeight + extraPadding));

        console.log(`[SHOW-03:${seq}] Window sizing: ${screenWidth}x${initialHeight} (${itemCount} items, ${rows} rows)`);

        await window.setSize({
          type: 'Logical',
          width: screenWidth,
          height: initialHeight
        });
        await invoke('reposition_window');
        console.log(`[SHOW-04:${seq}] Window sized and positioned`);

        // Set visible FIRST (while window hidden) so React renders initial state
        console.log(`[SHOW-05:${seq}] Setting visible=true (window still hidden)`);
        setVisible(true);
        visibleRef.current = true;

        // Wait for React + Framer Motion to render initial animation state
        console.log(`[SHOW-06:${seq}] Waiting 32ms for React render`);
        await new Promise(resolve => setTimeout(resolve, 32));

        // Show window - content already rendered at initial position
        console.log(`[SHOW-07:${seq}] Showing window`);
        await window.show();

        // Steal focus
        console.log(`[SHOW-08:${seq}] Setting focus`);
        await window.setFocus();

        // Verify focus after short delay
        await new Promise(resolve => setTimeout(resolve, 50));
        const stillFocused = await window.isFocused();
        if (!stillFocused) {
          console.log(`[SHOW-08b:${seq}] Re-stealing focus`);
          await window.setFocus();
        }

        // Done
        console.log(`[SHOW-09:${seq}] Complete`);
      } catch (error) {
        console.error(`[SHOW-ERR:${seq}]`, error);
      } finally {
        isShowingRef.current = false;
        ignoreBlurRef.current = false;
      }
    });

    return () => {
      unlisten.then(fn => fn());
      unlistenBlur.then(fn => fn());
    };
  }, []); // Run once on mount - never recreate listeners

  const handleKeyPress = (key: string) => {
    const newPath = [...currentPath, key];
    const current = getCurrentKeymap(newPath);

    if (typeof current === 'string') {
      // Execute command
      invoke('execute_command', { command: current });
      handleClose();
    } else if (current) {
      // Navigate deeper
      setCurrentPath(newPath);
    }
  };

  const getCurrentKeymap = (path: string[]): Keymap | string | undefined => {
    let current: any = keymaps;
    for (const key of path) {
      current = current?.[key];
    }
    return current;
  };

  const handleClose = () => {
    setVisible(false);
    visibleRef.current = false;
    // Wait for exit animation to complete before hiding window
    setTimeout(() => {
      getCurrentWindow().hide();
      // Reset flags after window is hidden
      isShowingRef.current = false;
      ignoreBlurRef.current = false;
    }, 200);
  };

  const handleBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    } else {
      handleClose();
    }
  };

  // Reset path when component becomes invisible
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        setCurrentPath([]);
      }, 200); // Wait for exit animation to complete
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Auto-resize window based on content (only when path changes, not on initial mount)
  useEffect(() => {
    if (!visible || currentPath.length === 0) return;

    const updateWindowSize = async () => {
      try {
        const window = getCurrentWindow();
        const currentKeymap = getCurrentKeymap(currentPath) as Keymap;
        const itemCount = currentKeymap ? Object.keys(currentKeymap).length : 0;

        // Get current window size before any changes
        const currentSize = await window.outerSize();
        console.log('[RESIZE] START - Current window size:', JSON.stringify({
          width: currentSize.width,
          height: currentSize.height,
          itemCount,
          pathDepth: currentPath.length
        }, null, 2));

        if (itemCount === 0) return;

        // Get screen width
        const monitor = await currentMonitor();
        if (!monitor) return;

        const screenWidth = monitor.size.width / monitor.scaleFactor;

        // Calculate columns based on content width (1400px max)
        const contentWidth = 1400;
        const minItemWidth = 280;
        const gap = 10;
        const padding = 48; // 24px on each side
        const headerHeight = 88; // Header space always reserved: 24px margin-top + 48px fixed height + 16px margin-bottom

        const availableWidth = contentWidth - padding;
        const columns = Math.max(1, Math.floor((availableWidth + gap) / (minItemWidth + gap)));
        const rows = Math.ceil(itemCount / columns);

        // Height calculation: header + padding + (rows * item height) + gaps between rows
        const itemHeight = 48; // padding (12*2) + content (~24)
        const totalGaps = Math.max(0, (rows - 1) * gap);
        const calculatedHeight = headerHeight + padding + (rows * itemHeight) + totalGaps;

        // Add extra padding to prevent scrollbar
        const extraPadding = 10;

        // Min 150px, max 500px
        const height = Math.max(150, Math.min(500, calculatedHeight + extraPadding));

        console.log('[RESIZE] Calculation breakdown:', JSON.stringify({
          itemCount,
          columns,
          rows,
          headerHeight,
          padding,
          itemHeight,
          totalGaps,
          calculatedHeight,
          extraPadding,
          finalHeight: height,
          formula: `${headerHeight} + ${padding} + (${rows} * ${itemHeight}) + ${totalGaps} + ${extraPadding} = ${calculatedHeight + extraPadding}`,
          clamped: calculatedHeight + extraPadding !== height ? 'YES (min 150, max 500)' : 'NO'
        }, null, 2));

        // Set window size using screen width
        await window.setSize({
          type: 'Logical',
          width: screenWidth,
          height: height
        });
        console.log('[RESIZE] Window size set:', JSON.stringify({ width: screenWidth, height }, null, 2));

        // Reposition window to keep it at bottom
        await invoke('reposition_window');

        // Get final window size to confirm
        const finalSize = await window.outerSize();
        console.log('[RESIZE] COMPLETE - Final window size:', JSON.stringify({
          width: finalSize.width,
          height: finalSize.height,
          changed: currentSize.height !== finalSize.height,
          heightDiff: finalSize.height - currentSize.height
        }, null, 2));
      } catch (error) {
        console.error('[RESIZE ERROR]', error);
      }
    };

    // Update immediately to prevent flickering
    updateWindowSize();
  }, [currentPath, visible, keymaps]);

  const handleEditConfig = () => {
    invoke('execute_command', { command: 'open ~/.config/yawhich-key/layers/core.yaml' });
    handleClose();
  };

  return (
    <AnimatePresence>
      {visible && configError ? (
        <div className="which-key-overlay" onClick={handleClose}>
          <div className="which-key-menu" onClick={(e) => e.stopPropagation()}>
            <div className="error-container">
              <h2 className="error-title">Configuration Error</h2>
              <p className="error-message">{configError}</p>
              <div className="error-actions">
                <button className="error-button" onClick={handleEditConfig}>
                  Edit Config
                </button>
                <button className="error-button secondary" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : visible && (
        <WhichKeyMenu
          keymap={getCurrentKeymap(currentPath) as Keymap}
          path={currentPath}
          onKeyPress={handleKeyPress}
          onClose={handleClose}
          onBack={handleBack}
          enableAnimations={settings.animations}
        />
      )}
    </AnimatePresence>
  );
}

export default App;
