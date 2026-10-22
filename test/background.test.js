const { test } = require('node:test');
const assert = require('node:assert/strict');
const { COUPONS_URL, isCouponsUrl, planIconClick, handleIconClick } = require('../src/background');

function fakeTabs(tabs) {
  const calls = [];
  return {
    calls,
    query: async (q) => { calls.push(['query', q]); return tabs; },
    update: async (id, props) => { calls.push(['update', id, props]); },
    reload: async (id) => { calls.push(['reload', id]); },
    create: async (props) => { calls.push(['create', props]); },
  };
}

test('isCouponsUrl matches the coupons page with or without trailing path/query', () => {
  assert.ok(isCouponsUrl('https://www.kroger.com/savings/cl/coupons/'));
  assert.ok(isCouponsUrl('https://www.kroger.com/savings/cl/coupons?filter=x'));
  assert.ok(!isCouponsUrl('https://www.kroger.com/savings/'));
  assert.ok(!isCouponsUrl(undefined));
});

test('opens a new tab when no coupons tab is in the window', () => {
  const plan = planIconClick([{ id: 1, active: true, url: 'https://example.com/' }, { id: 2 }]);
  assert.deepEqual(plan, { action: 'create', url: COUPONS_URL });
  assert.deepEqual(planIconClick([]), { action: 'create', url: COUPONS_URL });
});

test('prefers reloading the active coupons tab', () => {
  const plan = planIconClick([
    { id: 1, active: false, url: COUPONS_URL },
    { id: 2, active: true, url: COUPONS_URL },
  ]);
  assert.deepEqual(plan, { action: 'reload', tabId: 2 });
});

test('falls back to the first coupons tab when the active tab is elsewhere', () => {
  const plan = planIconClick([
    { id: 1, active: true, url: 'https://example.com/' },
    { id: 3, active: false, url: COUPONS_URL },
  ]);
  assert.deepEqual(plan, { action: 'reload', tabId: 3 });
});

test('handleIconClick activates and reloads an existing coupons tab', async () => {
  const tabs = fakeTabs([{ id: 7, active: false, url: COUPONS_URL }]);
  await handleIconClick(tabs);
  assert.deepEqual(tabs.calls, [
    ['query', { currentWindow: true }],
    ['update', 7, { active: true }],
    ['reload', 7],
  ]);
});

test('handleIconClick creates a coupons tab when none exists', async () => {
  const tabs = fakeTabs([{ id: 1, active: true, url: 'https://example.com/' }]);
  await handleIconClick(tabs);
  assert.deepEqual(tabs.calls, [
    ['query', { currentWindow: true }],
    ['create', { url: COUPONS_URL, active: true }],
  ]);
});
