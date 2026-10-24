# matvenko.github.io

The website of **Maze Boo**, a cute top-down maze game for iPhone, iPad and
Android: https://matvenko.github.io

It is a static page for GitHub Pages, with no build step:

| Path | What it is |
|---|---|
| `index.html` | The page: hero, how to play, powers, evolution, worlds, hunters, modes, social accounts, FAQ, download |
| `assets/css/site.css` | All styles |
| `assets/js/stores.js` | Store links: the right store for the device and the visitor's UTM campaign passed on |
| `assets/js/site.js` | The page's behaviour: menu, Boo, the hidden-coin hunt, the hero film, reveals |
| `get/` | One link for bios and ads: a phone goes straight to its store, anything else to the page |
| `404.html` | The page for a wrong address |
| `app-ads.txt` | AdMob's authorised sellers; it must stay at the root |

Every picture is the game's own: stills from the films the game stages and
shoots itself, its UI icons, its app icon and its 3D logo. They are made by a
script in the developer's workspace, not by hand.

## Campaigns

Links to the page can carry `utm_source`, `utm_medium` and `utm_campaign`.
The store buttons pass them on: Google Play through `referrer` (Play Console →
Acquisition reports), the App Store through `ct`, which needs the provider
token `pt` from App Store Connect in `APPLE_PROVIDER_TOKEN` in
`assets/js/stores.js`. Without it the App Store link carries no campaign.

The badges are Apple's and Google's official artwork, used as provided.
