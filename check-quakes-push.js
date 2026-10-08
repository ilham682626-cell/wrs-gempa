/**
 * Scheduled function (jalan tiap 1 menit via Netlify Scheduled Functions).
 * Ini yang membuat alarm tetap bekerja walau HP terkunci / tab ditutup:
 * pengecekan & pengiriman notifikasi dilakukan di server, bukan di browser.
 */
const { schedule } = require("@netlify/functions");
const webpush = require("web-push");
const { getStore } = require("@netlify/blobs");
const { fetchAll } = require("./_shared/fetchQuakes");

// Kunci VAPID publik/privat untuk Web Push. Bisa dioverride lewat env var
// VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY di Netlify (Site settings > Environment
// variables) kalau mau pakai kunci sendiri — kalau tidak, pakai default ini.
const VAPID_PUBLIC =
  process.env.VAPID_PUBLIC_KEY ||
  "BMMLWEJGdS_HeyHwUWt9z6iswzec3RzLIXGWIrLmLa7xptYq4oLYFLiYlR-g0XE7rZJ4PFieSK9NRf-tOtKRmAA";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PRIVATE) {
  throw new Error("VAPID_PRIVATE_KEY belum dikonfigurasi di Netlify Environment Variables");
}

webpush.setVapidDetails("mailto:gempa-monitor@example.com", VAPID_PUBLIC, VAPID_PRIVATE);

async function handler() {
  try {
    const state = getStore("push-state");
    const subsStore = getStore("push-subscriptions");
    const adminStore = getStore("wrs-admin");
    const settings = (await adminStore.get("settings", { type: "json" })) || { minMag: 4, notifyAll: false, tsunamiPriority: true };

    const data = await fetchAll();
    const latest = data.latest;
    if (!latest) return { statusCode: 200, body: "no data" };

    const lastKey = (await state.get("lastKey")) || "";
    if (latest.key === lastKey) {
      return { statusCode: 200, body: "no new quake" };
    }
    await state.set("lastKey", latest.key);

    const { blobs } = await subsStore.list();
    if (!blobs.length) return { statusCode: 200, body: "no subscribers" };

    const globalMin = Number(settings.minMag) || 4;
    const payload = JSON.stringify({
      title: `Gempa M${latest.magnitude.toFixed(1)}`,
      body: `${latest.place} · kedalaman ${latest.depth} km`,
      magnitude: latest.magnitude,
      place: latest.place,
      time: latest.time,
      url: "/",
    });

    await Promise.all(
      blobs.map(async ({ key }) => {
        const item = await subsStore.get(key, { type: "json" });
        if (!item) return;
        const sub = item.subscription?.endpoint ? item.subscription : item;
        const prefs = item.subscription?.endpoint ? (item.preferences || {}) : {};
        const minMag = Number(prefs.minMag) || globalMin;
        const tsunami = /tsunami|berpotensi/i.test(String(latest.potential || ""));
        if (Number(latest.magnitude) < minMag && !(settings.tsunamiPriority && tsunami)) return;
        try {
          await webpush.sendNotification(sub, payload);
        } catch (err) {
          // subscription sudah tidak valid (browser uninstall, dsb) — bersihkan
          if (err.statusCode === 404 || err.statusCode === 410) {
            await subsStore.delete(key);
          }
        }
      })
    );

    return { statusCode: 200, body: "sent" };
  } catch (e) {
    console.error("check-quakes-push error", e);
    return { statusCode: 500, body: String(e) };
  }
}

exports.handler = schedule("*/1 * * * *", handler);
