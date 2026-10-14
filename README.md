# Coupon Clip All

A Chrome extension that clips every digital coupon on the Kroger website's coupons page, from the top down, while **skipping "Boost Member Exclusive" coupons** (their button starts a Boost enrollment flow that takes over the page).

If you find this useful, [buy me a coffee](https://buymeacoffee.com/xanderphillips) ☕

## Compatibility and trademarks

Built to be compatible with the coupons page at <https://www.kroger.com/savings/cl/coupons/>.

This is an independent, unofficial project. It is **not affiliated with, endorsed by, or sponsored by The Kroger Co.** "Kroger" and "Boost" are trademarks of The Kroger Co. and are used here only to describe compatibility. This project does not use Kroger logos or branding.

## Install

The extension isn't on the Chrome Web Store, so it's loaded manually. Chrome may show a "developer mode extensions" notice on startup; that's expected.

1. Go to the [latest release](https://github.com/SixAcreApiary/coupon-clip-all/releases/latest) and download `coupon-clip-all-vX.Y.Z.zip` (under **Assets**).
2. Unzip it somewhere you'll keep it (Chrome loads the extension from this folder, so don't delete it). You'll get a `coupon-clip-all` folder.
3. In Chrome, go to `chrome://extensions`.
4. Turn on **Developer mode** (top-right toggle).
5. Click **Load unpacked** and choose the `coupon-clip-all` folder (the one containing `manifest.json`).
6. Open <https://www.kroger.com/savings/cl/coupons/> while signed in.

Works in other Chromium browsers (Edge, Brave) the same way.

### Updates

The extension doesn't update itself. To be notified of new versions, click **Watch > Custom > Releases** at the top of this repo on GitHub.

To update: download the new release zip, replace the contents of your `coupon-clip-all` folder with the new one, then click the reload icon on the extension's card in `chrome://extensions`. Your settings are kept.

Prefer the latest unreleased code? Use **Code > Download ZIP** (or `git clone`) instead and load that folder.

## Use

A small panel appears in the bottom-right corner of the coupons page.

- **Move it** - drag the panel by its "Coupon Clip All" title bar. Double-click the title bar to send it back to the corner. The position is remembered.
- **Delay** - pause between clips, 0.5-10 seconds (each pause varies by +/-30% so clicks aren't evenly spaced). The setting is remembered and can be changed mid-run.
- **Hide clipped coupons** - hides coupons you've already clipped, including ones clipped during a run, so only unclipped coupons remain. When turned on, it scrolls through the page once to load every coupon (Kroger only loads more as you scroll), then returns to the top. Kroger's coupon count at the top doesn't change. Turn it off (or use Kroger's "Clipped Coupons" tab) to unclip something. The setting is remembered.
- **Clip All** - starts clipping. While running, the button becomes **Stop** and shows a running tally.
- **Buy me a coffee** - optional support link; opens in a new tab.

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

## Releasing

1. Bump the version (patch by default) in both `manifest.json` and `package.json`, and merge to `master`.
2. Tag and push: `git tag v1.2.3 && git push origin v1.2.3`.

The [Release workflow](.github/workflows/release.yml) runs the tests, builds the zip with `scripts/package.py` (which refuses a tag that doesn't match the manifest version), and publishes a GitHub Release with auto-generated notes. Run `python3 scripts/package.py` locally to build the same zip into `dist/`.

## License

MIT - see [LICENSE](LICENSE).
