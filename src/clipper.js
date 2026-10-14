(function (root) {
  const CARD_SELECTOR = '[data-testid="coupon-grid-card"]';
  const BUTTON_SELECTOR = '[data-testid^="CouponActionButton-"]';
  const CLIPPED_CELL_SELECTOR =
    `li:has(> ${CARD_SELECTOR} ${BUTTON_SELECTOR}[aria-label^="Unclip"])`;
  const HIDE_CLIPPED_CSS = `${CLIPPED_CELL_SELECTOR} { display: none !important; }`;

  // Boost coupons route through an "Enroll in Boost" flow that hijacks the session.
  // Only an exact "Clip" button on a card with no Boost markers is ever clicked.
  function classifyCard(card) {
    const button = card.querySelector(BUTTON_SELECTOR);
    if (!button) return 'unknown';
    const text = button.textContent.trim();
    const label = button.getAttribute('aria-label') || '';
    const boostTag = Array.from(card.querySelectorAll('[data-testid="savings-tag"]'))
      .some((tag) => tag.classList.contains('SavingsTag--BME') || /boost exclusive/i.test(tag.textContent));
    if (boostTag || card.querySelector('.SavingsTag--BME') || /enroll|boost to clip/i.test(text + ' ' + label)) {
      return 'boost';
    }
    if (text === 'Clip') return 'clippable';
    if (text === 'Unclip') return 'clipped';
    return 'unknown';
  }

  const DEFAULT_DELAY_SECONDS = 1;
  const MIN_DELAY_SECONDS = 0.5;
  const MAX_DELAY_SECONDS = 10;
  const JITTER = 0.3;

  function clampDelaySeconds(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return DEFAULT_DELAY_SECONDS;
    return Math.min(MAX_DELAY_SECONDS, Math.max(MIN_DELAY_SECONDS, n));
  }

  function jitteredDelayMs(seconds, random = Math.random) {
    const base = clampDelaySeconds(seconds) * 1000;
    return base * (1 - JITTER + random() * 2 * JITTER);
  }

  function clampPanelPosition(left, top, width, height, viewportWidth, viewportHeight) {
    const clamp = (v, max) => Math.min(Math.max(0, max), Math.max(0, Number.isFinite(v) ? v : 0));
    return { left: clamp(left, viewportWidth - width), top: clamp(top, viewportHeight - height) };
  }

  const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function waitFor(predicate, timeoutMs, intervalMs, sleep) {
    for (let i = 0; i < Math.ceil(timeoutMs / intervalMs); i++) {
      if (predicate()) return true;
      await sleep(intervalMs);
    }
    return predicate();
  }

  // Kroger's infinite scroll only loads the next batch when the window is scrolled
  // near the bottom and a scroll event fires.
  function requestMoreCards(doc, win) {
    win.scrollTo(0, doc.documentElement.scrollHeight);
    if (typeof win.dispatchEvent === 'function') win.dispatchEvent(new Event('scroll'));
  }

  async function loadAllCards(options) {
    const {
      doc,
      win,
      sleep = defaultSleep,
      shouldStop = () => false,
      scrollWait = 2500,
      maxEmptyScrolls = 2,
      maxScrolls = 50,
    } = options;
    const count = () => doc.querySelectorAll(CARD_SELECTOR).length;
    let emptyScrolls = 0;
    for (let i = 0; i < maxScrolls && emptyScrolls < maxEmptyScrolls && !shouldStop(); i++) {
      const before = count();
      requestMoreCards(doc, win);
      await sleep(scrollWait);
      emptyScrolls = count() > before ? 0 : emptyScrolls + 1;
    }
    return count();
  }

  async function run(options) {
    const {
      doc,
      win,
      sleep = defaultSleep,
      random = Math.random,
      shouldStop = () => false,
      onProgress = () => {},
      getDelaySeconds = () => DEFAULT_DELAY_SECONDS,
      clipTimeout = 5000,
      pollInterval = 100,
      scrollWait = 2000,
      maxEmptyScrolls = 2,
      maxConsecutiveFailures = 3,
    } = options;

    const stats = { clipped: 0, boost: 0, clipped_already: 0, unknown: 0, failed: 0, stoppedReason: 'done' };
    const startUrl = win.location.href;
    const seen = new WeakSet();
    const cards = () => Array.from(doc.querySelectorAll(CARD_SELECTOR));
    let emptyScrolls = 0;
    let consecutiveFailures = 0;

    while (true) {
      if (shouldStop()) { stats.stoppedReason = 'stopped'; break; }
      if (win.location.href !== startUrl) { stats.stoppedReason = 'navigated'; break; }

      const card = cards().find((c) => !seen.has(c));
      if (!card) {
        const before = cards().length;
        requestMoreCards(doc, win);
        await sleep(scrollWait);
        if (cards().length > before) {
          emptyScrolls = 0;
        } else if (++emptyScrolls >= maxEmptyScrolls) {
          break;
        }
        continue;
      }

      seen.add(card);
      const kind = classifyCard(card);
      if (kind !== 'clippable') {
        stats[kind === 'clipped' ? 'clipped_already' : kind]++;
        onProgress(stats);
        continue;
      }

      if (typeof card.scrollIntoView === 'function') card.scrollIntoView({ block: 'center' });
      const button = card.querySelector(BUTTON_SELECTOR);
      if (classifyCard(card) !== 'clippable' || button.textContent.trim() !== 'Clip') continue;
      button.click();

      const ok = await waitFor(() => classifyCard(card) === 'clipped', clipTimeout, pollInterval, sleep);
      if (ok) {
        stats.clipped++;
        consecutiveFailures = 0;
      } else {
        stats.failed++;
        if (++consecutiveFailures >= maxConsecutiveFailures) {
          stats.stoppedReason = 'failures';
          onProgress(stats);
          break;
        }
      }
      onProgress(stats);
      await sleep(jitteredDelayMs(getDelaySeconds(), random));
    }

    onProgress(stats);
    return stats;
  }

  const api = {
    classifyCard,
    run,
    loadAllCards,
    clampDelaySeconds,
    jitteredDelayMs,
    clampPanelPosition,
    CARD_SELECTOR,
    BUTTON_SELECTOR,
    CLIPPED_CELL_SELECTOR,
    HIDE_CLIPPED_CSS,
    DEFAULT_DELAY_SECONDS,
    MIN_DELAY_SECONDS,
    MAX_DELAY_SECONDS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CouponClipper = api;
})(typeof window !== 'undefined' ? window : globalThis);
