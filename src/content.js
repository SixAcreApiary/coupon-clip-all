(function () {
  if (document.getElementById('coupon-clip-all')) return;

  const {
    run,
    clampDelaySeconds,
    clampPanelPosition,
    DEFAULT_DELAY_SECONDS,
    MIN_DELAY_SECONDS,
    MAX_DELAY_SECONDS,
  } = window.CouponClipper;
  const STORAGE_KEY = 'delaySeconds';
  const POSITION_KEY = 'panelPosition';
  const IDLE_COLOR = '#0f5ead';

  const panel = document.createElement('div');
  panel.id = 'coupon-clip-all';
  Object.assign(panel.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    zIndex: '2147483647',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '16px',
    background: '#fff',
    color: '#222',
    font: '13px/1.3 system-ui, sans-serif',
    boxShadow: '0 2px 10px rgba(0,0,0,.3)',
    maxWidth: '360px',
  });

  const handle = document.createElement('div');
  handle.textContent = '\u2807 Coupon Clip All';
  handle.title = 'Drag to move. Double-click to reset position.';
  Object.assign(handle.style, {
    cursor: 'move',
    userSelect: 'none',
    touchAction: 'none',
    font: '600 12px/1.2 system-ui, sans-serif',
    color: '#666',
  });

  const delayRow = document.createElement('label');
  Object.assign(delayRow.style, { display: 'flex', alignItems: 'center', gap: '8px' });
  const delayText = document.createElement('span');
  delayText.textContent = 'Delay';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = String(MIN_DELAY_SECONDS);
  slider.max = String(MAX_DELAY_SECONDS);
  slider.step = '0.5';
  slider.value = String(DEFAULT_DELAY_SECONDS);
  slider.style.flex = '1';
  const delayValue = document.createElement('span');
  delayValue.style.minWidth = '3.5em';
  delayRow.append(delayText, slider, delayValue);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Clip All';
  Object.assign(button.style, {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '20px',
    background: IDLE_COLOR,
    color: '#fff',
    font: '600 14px/1.2 system-ui, sans-serif',
    cursor: 'pointer',
    textAlign: 'left',
  });

  panel.append(handle, delayRow, button);
  document.body.appendChild(panel);

  let delaySeconds = DEFAULT_DELAY_SECONDS;
  const showDelay = () => {
    slider.value = String(delaySeconds);
    delayValue.textContent = `${delaySeconds.toFixed(1)}s`;
  };
  showDelay();

  let position = null;
  const placePanel = () => {
    if (!position) {
      Object.assign(panel.style, { left: 'auto', top: 'auto', right: '20px', bottom: '20px' });
      return;
    }
    const rect = panel.getBoundingClientRect();
    position = clampPanelPosition(position.left, position.top, rect.width, rect.height, window.innerWidth, window.innerHeight);
    Object.assign(panel.style, { left: `${position.left}px`, top: `${position.top}px`, right: 'auto', bottom: 'auto' });
  };

  const storage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const save = (items) => {
    if (storage) storage.set(items).catch(() => {});
  };
  if (storage) {
    storage.get([STORAGE_KEY, POSITION_KEY]).then((items) => {
      if (items && items[STORAGE_KEY] !== undefined) {
        delaySeconds = clampDelaySeconds(items[STORAGE_KEY]);
        showDelay();
      }
      const saved = items && items[POSITION_KEY];
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
        position = { left: saved.left, top: saved.top };
        placePanel();
      }
    }).catch(() => {});
  }

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    const rect = panel.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const onMove = (ev) => {
      position = { left: ev.clientX - offsetX, top: ev.clientY - offsetY };
      placePanel();
    };
    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      if (position) save({ [POSITION_KEY]: position });
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  });

  handle.addEventListener('dblclick', () => {
    position = null;
    placePanel();
    if (storage) storage.remove(POSITION_KEY).catch(() => {});
  });

  window.addEventListener('resize', placePanel);

  slider.addEventListener('input', () => {
    delaySeconds = clampDelaySeconds(slider.value);
    showDelay();
    save({ [STORAGE_KEY]: delaySeconds });
  });

  let running = false;
  let stopRequested = false;

  const summary = (s) =>
    `${s.clipped} clipped, ${s.boost} Boost skipped, ${s.clipped_already} already clipped, ${s.failed} failed`;

  const endMessages = {
    done: 'Done',
    stopped: 'Stopped',
    navigated: 'Aborted (page changed)',
    failures: 'Stopped after repeated failures (clip limit?)',
  };

  button.addEventListener('click', async () => {
    if (running) {
      stopRequested = true;
      button.textContent = 'Stopping...';
      return;
    }
    running = true;
    stopRequested = false;
    button.style.background = '#b3261e';
    button.textContent = 'Stop';
    try {
      const stats = await run({
        doc: document,
        win: window,
        getDelaySeconds: () => delaySeconds,
        shouldStop: () => stopRequested,
        onProgress: (s) => {
          if (!stopRequested) button.textContent = `Stop - ${summary(s)}`;
          placePanel();
        },
      });
      button.textContent = `${endMessages[stats.stoppedReason]}: ${summary(stats)}. Click to run again.`;
      placePanel();
    } catch (err) {
      console.error('[Coupon Clip All]', err);
      button.textContent = `Error: ${err.message}. Click to retry.`;
    } finally {
      running = false;
      button.style.background = IDLE_COLOR;
    }
  });
})();
