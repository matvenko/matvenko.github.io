(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stores = window.MazeBooStores;

  // Store links: the campaign passed on, and "Get the game" straight to this
  // device's store.
  document.querySelectorAll("[data-store]").forEach(function (link) {
    link.href = link.getAttribute("data-store") === "apple" ? stores.apple : stores.play;
  });
  var direct = stores.forDevice();
  if (direct) {
    document.querySelectorAll("[data-store-smart]").forEach(function (link) { link.href = direct; });
  }

  // The small-screen menu.
  var menu = document.querySelector("[data-menu]");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    menu.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  }
  menu.addEventListener("click", function () { setMenu(menu.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  var topbar = document.querySelector("[data-topbar]");
  function onScroll() { topbar.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // A night sky like the game's menu: dots and four-point sparkles.
  document.querySelectorAll("[data-sky]").forEach(function (sky) {
    var seed = 7;
    function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var html = "";
    for (var i = 0; i < 70; i++) {
      html += '<i class="star" style="left:' + (rand() * 100).toFixed(2) + "%;top:" + (rand() * 100).toFixed(2) +
        "%;--s:" + (1 + rand() * 2.2).toFixed(1) + "px;--d:" + (rand() * 4).toFixed(2) + 's"></i>';
    }
    for (var j = 0; j < 9; j++) {
      html += '<svg class="spark" style="left:' + (rand() * 100).toFixed(2) + "%;top:" + (rand() * 90).toFixed(2) +
        "%;--s:" + (10 + rand() * 16).toFixed(0) + "px;--d:" + (rand() * 3).toFixed(2) + 's"><use href="#sparkle"/></svg>';
    }
    sky.innerHTML = html;
  });

  // The hero film: still for visitors who ask for less motion, and paused
  // while it is off screen.
  var video = document.querySelector("[data-hero-video]");
  if (video) {
    if (reduceMotion) {
      video.removeAttribute("autoplay");
      video.pause();
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
          else video.pause();
        });
      }).observe(video);
    }
  }

  // Boo watches the pointer, blinks, and answers a poke.
  var boo = document.querySelector("[data-boo]");
  if (boo) {
    var eyes = boo.querySelector("[data-boo-eyes]");
    var bubble = boo.querySelector("[data-boo-bubble]");
    var lines = ["Boo!", "Catch me if you can!", "One more coin…", "Freeze!", "Shield up!", "Hee hee!", "Where's the exit?"];
    var line = 0;
    window.addEventListener("pointermove", function (e) {
      var r = boo.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height * 0.4);
      var d = Math.max(1, Math.hypot(dx, dy));
      var pull = Math.min(1, d / 260);
      eyes.style.setProperty("--ex", (dx / d * 7 * pull).toFixed(2) + "px");
      eyes.style.setProperty("--ey", (dy / d * 5 * pull).toFixed(2) + "px");
    }, { passive: true });
    function blink() {
      boo.classList.add("blink");
      setTimeout(function () { boo.classList.remove("blink"); }, 140);
      setTimeout(blink, 2200 + Math.random() * 3200);
    }
    if (!reduceMotion) setTimeout(blink, 1800);
    // Boo greets the visitor, as on the game's menu.
    boo.classList.add("talk");
    var hideBubble = setTimeout(function () { boo.classList.remove("talk"); }, 3600);
    boo.addEventListener("click", function () {
      bubble.textContent = lines[line++ % lines.length];
      boo.classList.remove("hop");
      void boo.offsetWidth;
      boo.classList.add("hop", "talk");
      clearTimeout(hideBubble);
      hideBubble = setTimeout(function () { boo.classList.remove("talk"); }, 1800);
    });
  }

  // Toasts.
  var toast = document.querySelector("[data-toast]");
  var toastTimer;
  function say(html, ms) {
    toast.innerHTML = html;
    toast.hidden = false;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.hidden = true; }, 300);
    }, ms || 3200);
  }

  // Coins hidden around the page, as on a board: find them all.
  var coins = Array.prototype.slice.call(document.querySelectorAll("[data-coin]"));
  var counter = document.querySelector("[data-coin-count]");
  var found = 0;
  if (coins.length && counter) {
    counter.hidden = false;
    counter.querySelector("[data-coin-total]").textContent = coins.length;
    var shown = counter.querySelector("[data-coin-found]");
    counter.addEventListener("click", function () {
      say(found === coins.length
        ? "Every coin collected. You're a natural!"
        : "<b>" + coins.length + " coins</b> are hidden on this page. Can you find them all?");
    });
    coins.forEach(function (coin) {
      coin.addEventListener("click", function () {
        if (coin.classList.contains("taken")) return;
        coin.classList.add("taken");
        coin.disabled = true;
        found++;
        shown.textContent = found;
        counter.classList.remove("bump");
        void counter.offsetWidth;
        counter.classList.add("bump");
        if (found === coins.length) {
          document.body.classList.add("all-coins");
          say('<b>LEVEL COMPLETE!</b> You found every coin. Ready for the real maze? ' +
            '<a href="' + (stores.forDevice() || "#download") + '">Get Maze Boo</a>', 7000);
        } else if (found === coins.length - 1) {
          say("One coin left! Look around…");
        } else {
          say("+1 coin! " + (coins.length - found) + " still hidden.", 1800);
        }
      });
    });
  }

  // Sections ease in as they arrive.
  if (!reduceMotion && "IntersectionObserver" in window) {
    var items = document.querySelectorAll(".section-head, .step, .power, .form, .world, .hunter, .friend, .mode, .extras li, .web-play, .follow, .faq details");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.setProperty("--delay", (i % 4) * 70 + "ms");
      io.observe(el);
    });
  }
})();
