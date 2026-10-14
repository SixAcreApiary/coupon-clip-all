# Chrome Web Store listing - Coupon Clip All

Copy-paste source for the Chrome Web Store Developer Dashboard.

## Store listing tab

**Name** (from manifest): Coupon Clip All

**Summary** (from manifest, max 132 chars):
Unofficial helper that clips kroger.com digital coupons, skipping Boost Member Exclusive ones. Not affiliated with Kroger.

**Category:** Shopping

**Language:** English

**Description:**

```
Coupon Clip All is an unofficial helper for the digital coupons page on kroger.com. One click works through the coupons page from top to bottom and clips every available digital coupon for you.

IMPORTANT - PLEASE READ
- This extension is NOT made by, affiliated with, endorsed by, or sponsored by The Kroger Co. "Kroger" is a trademark of The Kroger Co. and is used only to describe which website this extension works with.
- Automated clipping may violate Kroger's terms of use. Kroger may restrict, suspend, or close accounts it believes are using automation. You use this extension entirely at your own risk; the developer is not responsible for any action taken on your account.

FEATURES
- Clips coupons in order, top-down, and loads more as it goes.
- Skips "Boost Member Exclusive" coupons, whose button starts a membership sign-up flow instead of clipping.
- Human-paced by default: about 1.5 seconds between clips, with natural variation. Adjustable from 0.5 to 10 seconds.
- "Hide clipped coupons" option to see only what's left.
- Draggable on-page panel with a live tally and a Stop button.
- Stops automatically if the page navigates away or clips repeatedly fail (for example when Kroger's clipped-coupon limit is reached).

PRIVACY
No data is collected or transmitted. Only your settings (delay, panel position, hide-clipped choice) are stored, locally in your browser.

HOW TO USE
1. Sign in at kroger.com and open the digital coupons page.
2. Use the panel in the bottom-right corner: set the delay if you like, then click "Clip All".

Open source: https://github.com/SixAcreApiary/coupon-clip-all
```

**Graphic assets:**
- Store icon 128x128: `icons/icon-128.png`
- Small promo tile 440x280: `store/promo-small-440x280.png`
- Screenshots (1280x800 or 640x400, PNG/JPEG, 1-5): take manually, see checklist below.

**Official URL:** none. **Homepage URL:** https://github.com/SixAcreApiary/coupon-clip-all. **Support URL:** https://github.com/SixAcreApiary/coupon-clip-all/issues

## Privacy practices tab

**Single purpose:**
Clips the available digital coupons on the kroger.com coupons page on the user's behalf, skipping coupons that require a paid membership.

**Permission justification - storage:**
Saves the user's own settings (delay between clips, panel position, hide-clipped toggle) locally so they persist between visits.

**Host permission justification (content script on https://www.kroger.com/savings/cl/coupons*):**
The extension's only function is to operate on the kroger.com digital coupons page: it reads coupon cards to identify clippable ones and clicks their Clip buttons when the user presses "Clip All". It runs on no other pages.

**Remote code:** No, I am not using remote code. All JavaScript is packaged in the extension.

**Data usage:** Check none of the data categories. Certify:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** https://github.com/SixAcreApiary/coupon-clip-all/blob/master/PRIVACY.md

## Distribution tab

- Visibility: Public (or Unlisted to soft-launch with a direct link only)
- Regions: United States (Kroger operates only in the US)
- Pricing: Free

## Screenshot checklist

Take at 1280x800 (set the browser window to that size, or capture and crop). Avoid showing your name, address, loyalty number or any account details; crop or blur the header if needed.

1. Coupons page with the panel visible, before clicking Clip All.
2. Mid-run: panel showing "Stop - N clipped, ..." with coupons flipping to Unclip.
3. "Hide clipped coupons" turned on, showing only remaining coupons and skipped Boost coupons.
4. Finished state with the summary tally.

## Upload

Build the zip with `python3 scripts/package.py` (or download it from the GitHub release) and upload `dist/coupon-clip-all-vX.Y.Z.zip` on the Package tab.
