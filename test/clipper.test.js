const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { classifyCard, run, CARD_SELECTOR, BUTTON_SELECTOR } = require('../src/clipper');

const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixtures', 'cards.html'), 'utf8');
const KINDS = ['clippable', 'clipped', 'boost', 'boostBrand'];

function makePage({ clipWorks = true } = {}) {
  const dom = new JSDOM(`<body>${FIXTURE}</body>`);
  const doc = dom.window.document;
  const log = { clicks: [], boostClicks: 0 };
  const cards = Array.from(doc.querySelectorAll(CARD_SELECTOR));
  cards.forEach((card, i) => wire(card, KINDS[i]));

  function wire(card, kind) {
    card.dataset.kind = kind;
    const btn = card.querySelector(BUTTON_SELECTOR);
    btn.addEventListener('click', () => {
      log.clicks.push(kind);
      if (kind === 'boost') {
        log.boostClicks++;
        win.location.href = 'https://www.kroger.com/boost/enroll';
        return;
      }
      if (clipWorks && btn.textContent.trim() === 'Clip') {
        btn.textContent = 'Unclip';
        btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^Clip/, 'Unclip'));
      }
    });
  }

  const win = {
    location: { href: 'https://www.kroger.com/savings/cl/coupons/' },
    scrolls: 0,
    scrollEvents: 0,
    onScroll: null,
    scrollTo() {
      this.scrolls++;
    },
    dispatchEvent(ev) {
      if (ev.type !== 'scroll') return;
      this.scrollEvents++;
      if (this.onScroll) this.onScroll();
    },
  };

  function appendClone(kind) {
    const src = cards[KINDS.indexOf(kind)].closest('li');
    const clone = src.cloneNode(true);
    const card = clone.querySelector(CARD_SELECTOR);
    const btn = card.querySelector(BUTTON_SELECTOR);
    btn.textContent = kind === 'boost' ? 'Enroll in Boost to Clip' : kind === 'clipped' ? 'Unclip' : 'Clip';
    doc.querySelector('ul').appendChild(clone);
    wire(card, kind);
  }

  return { doc, win, log, appendClone };
}

const fast = { sleep: async () => {}, random: () => 0 };

test('fixtures cover all four card types', () => {
  const { doc } = makePage();
  assert.equal(doc.querySelectorAll(CARD_SELECTOR).length, 4);
});

test('classifyCard identifies each card type', () => {
  const { doc } = makePage();
  const got = Array.from(doc.querySelectorAll(CARD_SELECTOR)).map(classifyCard);
  assert.deepEqual(got, ['clippable', 'clipped', 'boost', 'clippable']);
});

test('BOOST brand product coupon is not treated as Boost Member Exclusive', () => {
  const { doc } = makePage();
  const card = doc.querySelector('[data-kind="boostBrand"]');
  assert.match(card.querySelector('[data-brand]').getAttribute('data-brand'), /BOOST/);
  assert.equal(classifyCard(card), 'clippable');
});

test('Boost tag alone marks a card as boost even with a plain Clip button', () => {
  const { doc } = makePage();
  const card = doc.querySelector('[data-kind="boost"]');
  card.querySelector(BUTTON_SELECTOR).textContent = 'Clip';
  card.querySelector(BUTTON_SELECTOR).setAttribute('aria-label', 'Clip for coupon: x');
  assert.equal(classifyCard(card), 'boost');
});

test('Boost button text alone marks a card as boost', () => {
  const { doc } = makePage();
  const card = doc.querySelector('[data-kind="clippable"]');
  card.querySelector(BUTTON_SELECTOR).textContent = 'Enroll in Boost to Clip';
  assert.equal(classifyCard(card), 'boost');
});

test('unrecognized button text is unknown and never clicked', async () => {
  const page = makePage();
  page.doc.querySelector('[data-kind="clippable"]').querySelector(BUTTON_SELECTOR).textContent = 'Load to Card';
  const stats = await run({ doc: page.doc, win: page.win, ...fast });
  assert.equal(stats.unknown, 1);
  assert.deepEqual(page.log.clicks, ['boostBrand']);
});

test('run clips top-down and never clicks Boost', async () => {
  const page = makePage();
  const stats = await run({ doc: page.doc, win: page.win, ...fast });
  assert.deepEqual(page.log.clicks, ['clippable', 'boostBrand']);
  assert.equal(page.log.boostClicks, 0);
  assert.equal(stats.clipped, 2);
  assert.equal(stats.boost, 1);
  assert.equal(stats.clipped_already, 1);
  assert.equal(stats.failed, 0);
  assert.equal(stats.stoppedReason, 'done');
});

test('run scrolls to load more cards and processes them', async () => {
  const page = makePage();
  let loads = 0;
  page.win.onScroll = () => {
    if (loads++ === 0) {
      page.appendClone('clippable');
      page.appendClone('boost');
    }
  };
  const stats = await run({ doc: page.doc, win: page.win, ...fast });
  assert.equal(stats.clipped, 3);
  assert.equal(stats.boost, 2);
  assert.equal(page.log.boostClicks, 0);
  assert.equal(page.win.scrolls, 3);
});

test('run stops after consecutive clip failures', async () => {
  const page = makePage({ clipWorks: false });
  for (let i = 0; i < 5; i++) page.appendClone('clippable');
  const stats = await run({ doc: page.doc, win: page.win, ...fast, maxConsecutiveFailures: 3 });
  assert.equal(stats.failed, 3);
  assert.equal(stats.stoppedReason, 'failures');
});

test('run aborts if the page navigates away', async () => {
  const page = makePage();
  const stats = await run({
    doc: page.doc,
    win: page.win,
    ...fast,
    onProgress: () => { page.win.location.href = 'https://www.kroger.com/elsewhere'; },
  });
  assert.equal(stats.stoppedReason, 'navigated');
  assert.ok(page.log.clicks.length <= 1);
});

test('run honors stop requests', async () => {
  const page = makePage();
  let stop = false;
  const stats = await run({ doc: page.doc, win: page.win, ...fast, shouldStop: () => stop, onProgress: () => { stop = true; } });
  assert.equal(stats.stoppedReason, 'stopped');
  assert.equal(page.log.clicks.length, 1);
});

test('clampDelaySeconds bounds and defaults the delay', () => {
  const { clampDelaySeconds, DEFAULT_DELAY_SECONDS, MIN_DELAY_SECONDS, MAX_DELAY_SECONDS } = require('../src/clipper');
  assert.equal(clampDelaySeconds(3), 3);
  assert.equal(clampDelaySeconds('2.5'), 2.5);
  assert.equal(clampDelaySeconds(0), MIN_DELAY_SECONDS);
  assert.equal(clampDelaySeconds(999), MAX_DELAY_SECONDS);
  assert.equal(clampDelaySeconds('abc'), DEFAULT_DELAY_SECONDS);
  assert.equal(clampDelaySeconds(undefined), DEFAULT_DELAY_SECONDS);
});

test('jitteredDelayMs stays within +/-30% of the chosen delay', () => {
  const { jitteredDelayMs } = require('../src/clipper');
  assert.equal(jitteredDelayMs(2, () => 0), 1400);
  assert.equal(jitteredDelayMs(2, () => 0.5), 2000);
  assert.ok(Math.abs(jitteredDelayMs(2, () => 0.999999) - 2600) < 0.01);
});

test('run waits the user-selected delay between clips and picks up live changes', async () => {
  const page = makePage();
  const waits = [];
  let delay = 4;
  await run({
    doc: page.doc,
    win: page.win,
    sleep: async (ms) => { waits.push(ms); },
    random: () => 0.5,
    scrollWait: 1,
    getDelaySeconds: () => delay,
    onProgress: (s) => { if (s.clipped === 1) delay = 6; },
  });
  const clipWaits = waits.filter((ms) => ms >= 1000);
  assert.deepEqual(clipWaits, [6000, 6000]);
});

test('clampPanelPosition keeps the dragged panel inside the viewport', () => {
  const { clampPanelPosition } = require('../src/clipper');
  assert.deepEqual(clampPanelPosition(100, 200, 300, 120, 1280, 800), { left: 100, top: 200 });
  assert.deepEqual(clampPanelPosition(-50, -10, 300, 120, 1280, 800), { left: 0, top: 0 });
  assert.deepEqual(clampPanelPosition(5000, 5000, 300, 120, 1280, 800), { left: 980, top: 680 });
  assert.deepEqual(clampPanelPosition(100, 100, 2000, 1000, 1280, 800), { left: 0, top: 0 });
  assert.deepEqual(clampPanelPosition(NaN, undefined, 300, 120, 1280, 800), { left: 0, top: 0 });
});

test('hide-clipped selector matches only cells holding an Unclip button', () => {
  const { CLIPPED_CELL_SELECTOR, HIDE_CLIPPED_CSS } = require('../src/clipper');
  const page = makePage();
  const matched = Array.from(page.doc.querySelectorAll(CLIPPED_CELL_SELECTOR))
    .map((li) => li.querySelector(CARD_SELECTOR).dataset.kind);
  assert.deepEqual(matched, ['clipped']);
  assert.ok(HIDE_CLIPPED_CSS.includes('display: none'));
});

test('hide-clipped selector picks up coupons clipped during a run', async () => {
  const { CLIPPED_CELL_SELECTOR } = require('../src/clipper');
  const page = makePage();
  await run({ doc: page.doc, win: page.win, ...fast });
  const matched = Array.from(page.doc.querySelectorAll(CLIPPED_CELL_SELECTOR))
    .map((li) => li.querySelector(CARD_SELECTOR).dataset.kind);
  assert.deepEqual(matched, ['clippable', 'clipped', 'boostBrand']);
});

test('loadAllCards scrolls to the bottom and fires scroll events until no more cards load', async () => {
  const { loadAllCards } = require('../src/clipper');
  const page = makePage();
  let loads = 0;
  page.win.onScroll = () => {
    if (loads++ < 2) page.appendClone('clippable');
  };
  const total = await loadAllCards({ doc: page.doc, win: page.win, sleep: async () => {} });
  assert.equal(total, 6);
  assert.equal(page.win.scrolls, 4);
  assert.equal(page.win.scrollEvents, 4);
});

test('loadAllCards honors stop requests', async () => {
  const { loadAllCards } = require('../src/clipper');
  const page = makePage();
  page.win.onScroll = () => page.appendClone('clippable');
  let calls = 0;
  await loadAllCards({ doc: page.doc, win: page.win, sleep: async () => {}, shouldStop: () => calls++ >= 3 });
  assert.equal(page.win.scrolls, 3);
});

test('support link points to the Buy Me a Coffee page over https', () => {
  const { SUPPORT_URL } = require('../src/clipper');
  assert.equal(SUPPORT_URL, 'https://buymeacoffee.com/xanderphillips');
});

test('manifest and package.json versions match (release tags rely on it)', () => {
  const manifest = require('../manifest.json');
  const pkg = require('../package.json');
  assert.equal(manifest.version, pkg.version);
});

test('default delay is human-paced (1-2s per clip including jitter)', () => {
  const { DEFAULT_DELAY_SECONDS, jitteredDelayMs } = require('../src/clipper');
  assert.equal(DEFAULT_DELAY_SECONDS, 1.5);
  assert.ok(jitteredDelayMs(DEFAULT_DELAY_SECONDS, () => 0) >= 1000);
  assert.ok(jitteredDelayMs(DEFAULT_DELAY_SECONDS, () => 0.999999) <= 2000);
});

test('run uses the human-paced default delay when none is chosen', async () => {
  const page = makePage();
  const waits = [];
  await run({ doc: page.doc, win: page.win, sleep: async (ms) => { waits.push(ms); }, random: () => 0.5, scrollWait: 1 });
  assert.deepEqual(waits.filter((ms) => ms >= 1000), [1500, 1500]);
});

test('manifest icons exist as PNGs of the declared sizes', () => {
  const manifest = require('../manifest.json');
  for (const [size, file] of Object.entries(manifest.icons)) {
    const buf = fs.readFileSync(path.join(__dirname, '..', file));
    assert.equal(buf.toString('latin1', 1, 4), 'PNG', file);
    assert.equal(buf.readUInt32BE(16), Number(size), `${file} width`);
    assert.equal(buf.readUInt32BE(20), Number(size), `${file} height`);
  }
});

test('manifest description fits the 132-character store limit and states non-affiliation', () => {
  const manifest = require('../manifest.json');
  assert.ok(manifest.description.length <= 132);
  assert.match(manifest.description, /not affiliated with kroger/i);
});
