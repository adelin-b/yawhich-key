import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow, currentMonitor, LogicalSize } from '@tauri-apps/api/window';
import { AnimatePresence } from 'framer-motion';
import WhichKeyMenu from './components/WhichKeyMenu';
import './App.css';

interface Keymap {
  [key: string]: string | Keymap;
}

interface AppSettings {
  animations: boolean;
  theme?: string;
}

interface WindowInfo {
  bundle_id: string;
  window_id: number;
  window_title?: string;
}

function App() {
  const [visible, setVisible] = useState(false);
  const [keymaps, setKeymaps] = useState<Keymap>({});
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [configError, setConfigError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({ animations: true });
  const [majorModeApp, setMajorModeApp] = useState<string | null>(null);
  const [hydraMode, setHydraMode] = useState(false);
  const visibleRef = useRef(false);
  const isShowingRef = useRef(false);
  const keymapsRef = useRef<Keymap>({});
  const ignoreBlurRef = useRef(false);
  const sequenceCounterRef = useRef(0);
  const previousWindowRef = useRef<WindowInfo | null>(null);

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

        // Load custom theme if specified
        if (loadedSettings.theme) {
          await loadTheme(loadedSettings.theme);
        }
      } catch (error) {
        setConfigError(error as string);
      }
    };

    loadConfig();

    // Listen for window blur (lose focus)
    const unlistenBlur = window.onFocusChanged(({ payload: focused }) => {
      if (ignoreBlurRef.current) return;
      if (!focused && visibleRef.current) {
        handleClose();
      }
    });

    // Listen for major mode shortcut trigger
    const unlistenMajorMode = listen<WindowInfo>('show-major-mode', async (event) => {
      const seq = ++sequenceCounterRef.current;
      const startTime = performance.now();
      const windowInfo = event.payload;

      if (isShowingRef.current) return;

      isShowingRef.current = true;
      ignoreBlurRef.current = true;
      setCurrentPath([]);
      previousWindowRef.current = windowInfo;

      try {
        const t1 = performance.now();
        const majorKeymaps = await invoke<Keymap>('load_major_mode_keymaps', { appBundleId: windowInfo.bundle_id });
        console.log(`[${seq}] load-keymaps: ${(performance.now() - t1).toFixed(2)}ms`);

        setKeymaps(majorKeymaps);
        keymapsRef.current = majorKeymaps;
        setMajorModeApp(windowInfo.bundle_id);

        const t2 = performance.now();
        const monitor = await currentMonitor();
        if (!monitor) return;

        const screenWidth = monitor.size.width / monitor.scaleFactor;
        const itemCount = Object.keys(majorKeymaps).length;

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
        console.log(`[${seq}] calculate-size: ${(performance.now() - t2).toFixed(2)}ms`);

        const t3 = performance.now();
        await window.setSize(new LogicalSize(screenWidth, initialHeight));
        await invoke('reposition_window');
        console.log(`[${seq}] resize-window: ${(performance.now() - t3).toFixed(2)}ms`);

        const t4 = performance.now();
        setVisible(true);
        visibleRef.current = true;
        await new Promise(resolve => setTimeout(resolve, 32));
        console.log(`[${seq}] react-render-wait: ${(performance.now() - t4).toFixed(2)}ms`);

        const t5 = performance.now();
        await window.show();
        window.setFocus(); // Non-blocking
        console.log(`[${seq}] show-and-focus: ${(performance.now() - t5).toFixed(2)}ms`);

        const totalTime = performance.now() - startTime;
        console.log(`[${seq}] MAJOR-MODE TOTAL: ${totalTime.toFixed(2)}ms`);
      } catch (error) {
        console.error('MAJOR-MODE-ERROR:', error);
        // Create template layer file and open in editor
        try {
          const appName = windowInfo.bundle_id.split('.').pop() || 'app';
          await invoke('create_major_mode_template', {
            appBundleId: windowInfo.bundle_id,
            appName
          });
          // Open the template in editor
          await invoke('execute_command', {
            command: `open ~/.config/yawhich-key/layers/${appName}.yaml`
          });
        } catch (createErr) {
          console.error(`[MAJOR-ERR:${seq}] Failed to create template:`, createErr);
        }
        isShowingRef.current = false;
        ignoreBlurRef.current = false;
      }
    });

    // Listen for global shortcut trigger
    const unlisten = listen<WindowInfo>('show-which-key', async (event) => {
      const seq = ++sequenceCounterRef.current;
      const startTime = performance.now();
      const windowInfo = event.payload;

      if (isShowingRef.current) return;

      isShowingRef.current = true;
      ignoreBlurRef.current = true;
      setCurrentPath([]);
      setMajorModeApp(null);

      if (windowInfo) {
        previousWindowRef.current = windowInfo;
      } else {
        previousWindowRef.current = null;
      }

      try {
        const t1 = performance.now();
        const globalKeymaps = await invoke<Keymap>('load_keymaps');
        console.log(`[${seq}] load-keymaps: ${(performance.now() - t1).toFixed(2)}ms`);

        setKeymaps(globalKeymaps);
        keymapsRef.current = globalKeymaps;

        const t2 = performance.now();
        const monitor = await currentMonitor();
        if (!monitor) return;

        const screenWidth = monitor.size.width / monitor.scaleFactor;
        const rootKeymap = globalKeymaps;
        const itemCount = rootKeymap ? Object.keys(rootKeymap).length : 0;

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
        console.log(`[${seq}] calculate-size: ${(performance.now() - t2).toFixed(2)}ms`);

        const t3 = performance.now();
        await window.setSize(new LogicalSize(screenWidth, initialHeight));
        await invoke('reposition_window');
        console.log(`[${seq}] resize-window: ${(performance.now() - t3).toFixed(2)}ms`);

        const t4 = performance.now();
        setVisible(true);
        visibleRef.current = true;
        await new Promise(resolve => setTimeout(resolve, 32));
        console.log(`[${seq}] react-render-wait: ${(performance.now() - t4).toFixed(2)}ms`);

        const t5 = performance.now();
        await window.show();
        window.setFocus(); // Non-blocking
        console.log(`[${seq}] show-and-focus: ${(performance.now() - t5).toFixed(2)}ms`);

        const totalTime = performance.now() - startTime;
        console.log(`[${seq}] GLOBAL-MODE TOTAL: ${totalTime.toFixed(2)}ms`);
      } catch (error) {
        console.error('GLOBAL-MODE-ERROR:', error);
      } finally {
        isShowingRef.current = false;
        ignoreBlurRef.current = false;
      }
    });

    return () => {
      unlisten.then(fn => fn());
      unlistenMajorMode.then(fn => fn());
      unlistenBlur.then(fn => fn());
    };
  }, []); // Run once on mount - never recreate listeners

  const handleKeyPress = (key: string) => {
    const newPath = [...currentPath, key];
    const current = getCurrentKeymap(newPath);

    if (typeof current === 'string') {
      // Execute command
      invoke('execute_command', { command: current });

      // In hydra mode, reset path but keep menu open
      if (hydraMode) {
        setCurrentPath([]);
      } else {
        handleClose();
      }
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
    const startTime = performance.now();

    setVisible(false);
    visibleRef.current = false;
    const t1 = performance.now() - startTime;

    // Restore focus to previous window (non-blocking - fire and forget)
    if (previousWindowRef.current) {
      const windowToRestore = previousWindowRef.current;
      previousWindowRef.current = null;

      invoke('focus_window', {
        bundleId: windowToRestore.bundle_id,
        windowId: windowToRestore.window_id,
        windowTitle: windowToRestore.window_title
      }).catch(() => {});
    }

    // Wait for exit animation to complete before hiding window
    setTimeout(() => {
      const t2 = performance.now();
      getCurrentWindow().hide();
      const t3 = performance.now() - t2;
      isShowingRef.current = false;
      ignoreBlurRef.current = false;

      const totalTime = performance.now() - startTime;
      console.log(`CLOSE: invisible=${t1.toFixed(2)}ms hide=${t3.toFixed(2)}ms TOTAL=${totalTime.toFixed(2)}ms`);
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

  // Auto-resize window based on content whenever path changes
  useEffect(() => {
    if (!visible) return;

    const updateWindowSize = async () => {
      try {
        const window = getCurrentWindow();
        const currentKeymap = getCurrentKeymap(currentPath) as Keymap;
        const itemCount = currentKeymap ? Object.keys(currentKeymap).length : 0;

        if (itemCount === 0) return;

        const monitor = await currentMonitor();
        if (!monitor) return;

        const screenWidth = monitor.size.width / monitor.scaleFactor;

        const contentWidth = 1400;
        const minItemWidth = 280;
        const gap = 10;
        const padding = 48;

        // Calculate header height dynamically
        // Base header-spacer: 88px
        // + key-sequence when path > 0: ~60px
        // + major mode indicator: ~60px
        const baseHeaderHeight = 88;
        const keySequenceHeight = currentPath.length > 0 ? 60 : 0;
        const majorModeHeight = (majorModeApp && currentPath.length === 0) ? 60 : 0;
        const headerHeight = baseHeaderHeight + keySequenceHeight + majorModeHeight;

        const availableWidth = contentWidth - padding;
        const columns = Math.max(1, Math.floor((availableWidth + gap) / (minItemWidth + gap)));
        const rows = Math.ceil(itemCount / columns);

        const itemHeight = 48;
        const totalGaps = Math.max(0, (rows - 1) * gap);
        const calculatedHeight = headerHeight + padding + (rows * itemHeight) + totalGaps;
        const extraPadding = 10;
        const height = Math.max(150, Math.min(500, calculatedHeight + extraPadding));

        console.log(`[RESIZE] path=${currentPath.join('→')}, items=${itemCount}, rows=${rows}, headerHeight=${headerHeight}, finalHeight=${height}`);

        await window.setSize(new LogicalSize(screenWidth, height));

        // Small delay to ensure size has been applied before repositioning
        await new Promise(resolve => setTimeout(resolve, 10));
        await invoke('reposition_window');
      } catch (error) {
        // Silent
      }
    };

    // Update immediately to prevent flickering
    updateWindowSize();
  }, [currentPath, visible, keymaps]);

  const handleEditConfig = () => {
    invoke('execute_command', { command: 'open ~/.config/yawhich-key/layers/core.yaml' });
    handleClose();
  };

  const loadTheme = async (themeName: string) => {
    try {
      // Load custom theme CSS from backend
      const themeCSS = await invoke<string>('load_theme', { themeName });

      // Remove existing custom theme if any
      const existingTheme = document.getElementById('custom-theme');
      if (existingTheme) {
        existingTheme.remove();
      }

      // Inject new theme
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-theme';
      styleElement.textContent = themeCSS;
      document.head.appendChild(styleElement);
    } catch (error) {
      console.error('Failed to load theme:', error);
      // Silently fail - use default theme
    }
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
          majorModeApp={majorModeApp}
          hydraMode={hydraMode}
          onToggleHydra={() => setHydraMode(!hydraMode)}
        />
      )}
    </AnimatePresence>
  );
}

export default App;
