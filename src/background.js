(function (root) {
  const COUPONS_URL = 'https://www.kroger.com/savings/cl/coupons/';
  const COUPONS_PREFIX = 'https://www.kroger.com/savings/cl/coupons';

  function isCouponsUrl(url) {
    return typeof url === 'string' && url.startsWith(COUPONS_PREFIX);
  }

  // Prefer the active tab, then any other coupons tab in the window; otherwise open a new one.
  function planIconClick(tabs) {
    const matches = (tabs || []).filter((t) => isCouponsUrl(t.url));
    const target = matches.find((t) => t.active) || matches[0];
    return target ? { action: 'reload', tabId: target.id } : { action: 'create', url: COUPONS_URL };
  }

  async function handleIconClick(tabsApi) {
    const plan = planIconClick(await tabsApi.query({ currentWindow: true }));
    if (plan.action === 'reload') {
      await tabsApi.update(plan.tabId, { active: true });
      await tabsApi.reload(plan.tabId);
    } else {
      await tabsApi.create({ url: plan.url, active: true });
    }
    return plan;
  }

  const api = { COUPONS_URL, isCouponsUrl, planIconClick, handleIconClick };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof chrome !== 'undefined' && chrome.action) {
    chrome.action.onClicked.addListener(() => handleIconClick(chrome.tabs));
  }
})(globalThis);
