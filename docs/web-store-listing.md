# Chrome Web Store listing - Coupon Clip All

Copy-paste source for the Chrome Web Store Developer Dashboard.

Published: <https://chromewebstore.google.com/detail/fpkngfagkjpkohdiakfmejghdnkggccc> (item ID `fpkngfagkjpkohdiakfmejghdnkggccc`).

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
- "Hide Boost Exclusive coupons" option to hide the membership-only coupons it skips.
- Draggable on-page panel with a live tally and a Stop button.
- Stops automatically if the page navigates away or clips repeatedly fail (for example when Kroger's clipped-coupon limit is reached).

PRIVACY
No data is collected or transmitted. Only your settings (delay, panel position, hide options) are stored, locally in your browser.

HOW TO USE
1. Sign in at kroger.com and open the digital coupons page.
2. If the Coupon Clip All panel doesn't appear in the bottom-right corner, refresh the page.
3. Use the panel: set the delay if you like, then click "Clip All".

Open source: https://github.com/SixAcreApiary/coupon-clip-all
```

**Graphic assets:**
- Store icon 128x128: `icons/icon-128.png`
- Small promo tile 440x280: `store/promo-small-440x280.png`
- Screenshots (1280x800 or 640x400, JPEG or 24-bit PNG with no alpha, 1-5): `store/screenshot-1-1280x800.png` (product images, brand names and personal savings blurred). See checklist below for more.

**Official URL:** none. **Homepage URL:** https://github.com/SixAcreApiary/coupon-clip-all. **Support URL:** https://github.com/SixAcreApiary/coupon-clip-all/issues

## Privacy practices tab

**Single purpose:**
Clips the available digital coupons on the kroger.com coupons page on the user's behalf, skipping coupons that require a paid membership.

**Permission justification - storage:**
Saves the user's own settings (delay between clips, panel position, hide-clipped and hide-Boost toggles) locally so they persist between visits.

**Host permission justification (content script on https://www.kroger.com/savings/cl/coupons*):**
The extension's only function is to operate on the kroger.com digital coupons page: it reads coupon cards to identify clippable ones and clicks their Clip buttons when the user presses "Clip All". It runs on no other pages.

**Remote code:** No, I am not using remote code. All JavaScript is packaged in the extension.

**Data usage:** Check none of the data categories. Certify:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** https://github.com/SixAcreApiary/coupon-clip-all/blob/master/PRIVACY.md

## Test instructions tab

Username/password: leave blank (don't create or share a kroger.com account).

Additional instructions (max 500 chars; this is 464):

```
No test account: clipping needs the reviewer's own free kroger.com account; we can't create or share accounts on a third-party site.
1. Open https://www.kroger.com/savings/cl/coupons/ and sign in.
2. A "Coupon Clip All" panel appears bottom-right (refresh if not).
3. Click Clip All: coupons clip top-down ~1.5s apart; "Boost Exclusive" coupons are skipped.
4. "Hide clipped" / "Hide Boost Exclusive" hide those coupons.
Only local storage used; no data collected.
```

## Distribution tab

- Visibility: Public (or Unlisted to soft-launch with a direct link only)
- Regions: United States (Kroger operates only in the US)
- Pricing: Free

## Screenshot checklist

Take at 1280x800 (set the browser window to that size, or capture and crop). Avoid showing your name, address, loyalty number or any account details; crop or blur the header if needed.

1. Coupons page with the panel visible, before clicking Clip All.
2. Mid-run: panel showing "Stop - N clipped, ..." with coupons flipping to Unclip.
3. "Hide clipped coupons" turned on, showing only remaining coupons and skipped Boost coupons.
4. "Hide clipped coupons" and "Hide Boost Exclusive coupons" both on, showing only coupons left to clip.
5. Finished state with the summary tally.

## Upload

Build the zip with `python3 scripts/package.py` (or download it from the GitHub release) and upload `dist/coupon-clip-all-vX.Y.Z.zip` on the Package tab.
