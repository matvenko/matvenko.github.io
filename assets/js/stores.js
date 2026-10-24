// Store links for Maze Boo: which store fits this device, and the campaign
// (UTM) a visitor came with, passed on so each store can count installs by
// source. Google Play reads it from `referrer`; the App Store from `ct`, but
// only together with the provider token `pt` from App Store Connect, so the
// App Store link carries a campaign only once APPLE_PROVIDER_TOKEN is set.
(function () {
  var PLAY_ID = "com.mate_zakariadze.mazeboo";
  var APPLE_ID = "6819451632";
  var APPLE_PROVIDER_TOKEN = ""; // App Store Connect → Campaigns: the pt=… number.
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var DEFAULTS = { utm_source: "website", utm_medium: "referral", utm_campaign: "site" };
  var STORE_KEY = "mazeboo-utm";

  function readStorage() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || "null"); } catch (e) { return null; }
  }

  function writeStorage(value) {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  // The campaign in the address wins; otherwise the one this visit came with.
  function campaign() {
    var params = new URLSearchParams(window.location.search);
    var found = {};
    var any = false;
    KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) { found[key] = value.slice(0, 100); any = true; }
    });
    if (any) { writeStorage(found); return found; }
    return readStorage() || DEFAULTS;
  }

  function platform() {
    var ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    // iPadOS asks for desktop pages and calls itself a Mac.
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "desktop";
  }

  function playUrl(utm) {
    var referrer = KEYS.filter(function (k) { return utm[k]; })
      .map(function (k) { return k + "=" + encodeURIComponent(utm[k]); }).join("&");
    return "https://play.google.com/store/apps/details?id=" + PLAY_ID +
      (referrer ? "&referrer=" + encodeURIComponent(referrer) : "");
  }

  function appleUrl(utm) {
    if (!APPLE_PROVIDER_TOKEN) return "https://apps.apple.com/app/id" + APPLE_ID;
    // A campaign token is at most 40 characters.
    var ct = [utm.utm_source, utm.utm_campaign].filter(Boolean).join("-").slice(0, 40);
    return "https://apps.apple.com/app/apple-store/id" + APPLE_ID +
      "?pt=" + encodeURIComponent(APPLE_PROVIDER_TOKEN) + "&ct=" + encodeURIComponent(ct) + "&mt=8";
  }

  var utm = campaign();
  var device = platform();

  window.MazeBooStores = {
    platform: device,
    play: playUrl(utm),
    apple: appleUrl(utm),
    // The store for this device, or null on a computer.
    forDevice: function () {
      if (device === "ios") return this.apple;
      if (device === "android") return this.play;
      return null;
    }
  };
  document.documentElement.setAttribute("data-platform", device);
})();
