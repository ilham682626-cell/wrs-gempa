(() => {
  const $ = (s) => document.querySelector(s);
  const prefKey = "wrsPrefsFinal";
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(prefKey) || "{}"); } catch {}
  const defaults = { theme:"system", minMag:4, vibrate:true, sound:true, voice:true, autoRefresh:true, reducedMotion:false };
  prefs = {...defaults, ...prefs};
  const applyTheme = (theme) => {
    const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.body.classList.toggle("light", !dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.querySelectorAll("[data-theme-choice]").forEach(b => b.classList.toggle("active", b.dataset.themeChoice === theme));
  };
  const save = () => localStorage.setItem(prefKey, JSON.stringify(prefs));
  const sync = () => {
    $("#prefMinMag") && ($("#prefMinMag").value = String(prefs.minMag));
    $("#prefVibrate") && ($("#prefVibrate").checked = !!prefs.vibrate);
    $("#prefSound") && ($("#prefSound").checked = !!prefs.sound);
    $("#prefVoice") && ($("#prefVoice").checked = !!prefs.voice);
    $("#prefAutoRefresh") && ($("#prefAutoRefresh").checked = !!prefs.autoRefresh);
    $("#prefReducedMotion") && ($("#prefReducedMotion").checked = !!prefs.reducedMotion);
    applyTheme(prefs.theme);
    document.body.classList.toggle("reduced-motion", !!prefs.reducedMotion);
  };
  const closeDrawer = () => { $("#appDrawer")?.classList.remove("open"); $("#appDrawerBackdrop")?.classList.add("hidden"); };
  const openDrawer = () => { $("#appDrawer")?.classList.add("open"); $("#appDrawerBackdrop")?.classList.remove("hidden"); };
  const openSettings = () => $("#settingsOverlay")?.classList.remove("hidden");
  const closeSettings = () => $("#settingsOverlay")?.classList.add("hidden");
  const action = (name) => {
    closeDrawer();
    if (name === "settings") return openSettings();
    if (name === "home") { window.scrollTo?.(0,0); try { window.map?.invalidateSize?.({animate:false}); } catch {} return; }
    if (typeof window.openHistory === "function") window.openHistory(name === "history" ? "all" : name);
  };
  $("#appMenu")?.addEventListener("click", openDrawer);
  $("#drawerClose")?.addEventListener("click", closeDrawer);
  $("#appDrawerBackdrop")?.addEventListener("click", closeDrawer);
  $("#appTheme")?.addEventListener("click", openSettings);
  $("#settingsClose")?.addEventListener("click", closeSettings);
  $("#settingsOverlay")?.addEventListener("click", e => { if (e.target.id === "settingsOverlay") closeSettings(); });
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => action(el.dataset.action)));
  document.querySelectorAll("[data-theme-choice]").forEach(btn => btn.addEventListener("click", () => { prefs.theme = btn.dataset.themeChoice; save(); sync(); }));
  ["prefMinMag","prefVibrate","prefSound","prefVoice","prefAutoRefresh","prefReducedMotion"].forEach(id => {
    $("#"+id)?.addEventListener("change", e => {
      const map = {prefMinMag:"minMag",prefVibrate:"vibrate",prefSound:"sound",prefVoice:"voice",prefAutoRefresh:"autoRefresh",prefReducedMotion:"reducedMotion"};
      prefs[map[id]] = e.target.type === "checkbox" ? e.target.checked : Number(e.target.value);
      save(); sync();
    });
  });
  window.WRS_PREFS = () => ({...prefs});
  window.WRS_SET_THEME = (t) => { prefs.theme=t; save(); sync(); };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => { if (prefs.theme === "system") applyTheme("system"); });
  sync();
  // Android/TWA dan beberapa browser hanya mengizinkan permission notification setelah gesture pengguna.
  let pushGestureDone = false;
  document.addEventListener("pointerup", () => {
    if (pushGestureDone) return;
    pushGestureDone = true;
    const enabled = localStorage.getItem("wrsPushEnabled") === "1";
    if (!enabled && window.setupWrsPush) window.setupWrsPush().catch(() => {});
  }, {once:true, passive:true});
})();
