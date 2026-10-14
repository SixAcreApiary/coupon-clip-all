# Coupon Clip All

A Chrome extension that clips every digital coupon on the Kroger website's coupons page, from the top down, while **skipping "Boost Member Exclusive" coupons** (their button starts a Boost enrollment flow that takes over the page).

## Compatibility and trademarks

Built to be compatible with the coupons page at <https://www.kroger.com/savings/cl/coupons/>.

This is an independent, unofficial project. It is **not affiliated with, endorsed by, or sponsored by The Kroger Co.** "Kroger" and "Boost" are trademarks of The Kroger Co. and are used here only to describe compatibility. This project does not use Kroger logos or branding.

## Install

The extension isn't on the Chrome Web Store, so it's loaded manually. Chrome may show a "developer mode extensions" notice on startup; that's expected.

1. Download this repo: **Code > Download ZIP** on GitHub, then unzip it. (Or `git clone` it.)
2. In Chrome, go to `chrome://extensions`.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and choose the unzipped folder (the one containing `manifest.json`).
5. Open <https://www.kroger.com/savings/cl/coupons/> while signed in.

Works in other Chromium browsers (Edge, Brave) the same way.

To update: download the new version, replace the folder, and click the reload icon on the extension's card in `chrome://extensions`.

## Use

A small panel appears in the bottom-right corner of the coupons page.

- **Move it** - drag the panel by its "Coupon Clip All" title bar. Double-click the title bar to send it back to the corner. The position is remembered.
- **Delay** - pause between clips, 0.5-10 seconds (each pause varies by +/-30% so clicks aren't evenly spaced). The setting is remembered and can be changed mid-run.
- **Hide clipped coupons** - hides coupons you've already clipped, including ones clipped during a run, so only unclipped coupons remain. When turned on, it scrolls through the page once to load every coupon (Kroger only loads more as you scroll), then returns to the top. Kroger's coupon count at the top doesn't change. Turn it off (or use Kroger's "Clipped Coupons" tab) to unclip something. The setting is remembered.
- **Clip All** - starts clipping. While running, the button becomes **Stop** and shows a running tally.

It scrolls down to load more coupons as it goes and finishes when no more load. A run also stops if:

- the page navigates away (safety stop), or
- 3 clips in a row fail, which usually means Kroger's clipped-coupon limit was reached.

## How Boost coupons are avoided

A coupon is only clicked when its button reads exactly **Clip** and the card has no "Boost Exclusive" tag. Boost coupons have an "Enroll in Boost to Clip" button and are always skipped. Anything unrecognized is left alone. Coupons for the BOOST nutrition-drink brand are normal coupons and are clipped.

## Caveats

- Automated clicking may conflict with Kroger's terms of use. Use at your own risk; the authors aren't responsible for any action taken on your account.
- If Kroger changes its page layout the extension may stop finding coupons until it's updated.
- Only `www.kroger.com` is supported; other Kroger-family banners (Ralphs, Fred Meyer, etc.) are not.
- The extension collects no data and makes no network requests of its own. It stores only your delay, panel position and hide-clipped setting, locally in your browser.

## Development

```
npm install
npm test
```

Tests run with Node's built-in test runner and jsdom against real coupon-card markup in `test/fixtures/`. The `node_modules` folder is only for tests and must not be inside the folder you load into Chrome (Chrome rejects files whose names start with `_`). If you've run `npm install` in your copy, load a copy without `node_modules`.

## License

MIT - see [LICENSE](LICENSE).
