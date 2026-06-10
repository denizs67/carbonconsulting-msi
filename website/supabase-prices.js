/*
 * CarbonConsulting — Canlı sertifika fiyatları (Supabase)
 * certificate_prices tablosundan EUA/VCM fiyatlarını çeker ve DOM'u günceller.
 * Fetch başarısız olursa mevcut statik değerlere (FALLBACK) düşer — site asla bozulmaz.
 */
(function () {
  const SUPABASE_URL = 'https://fgihvqcziwlitmbjfhbl.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_YZtmAr0yDFPbz3z3q94kfg_Zq2i3Eqh';

  // Sayfalarda gömülü mevcut sabit değerler — bağlantı olmazsa bunlar gösterilir
  const FALLBACK = {
    EUA: { price: 82.45, currency: 'EUR', change_pct: 0.42 },
    VCM: { price: 14.30, currency: 'USD', change_pct: -0.18 }
  };

  const num2 = (n) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const sym = (cur) => cur === 'EUR' ? '€' : cur === 'USD' ? '$' : '';
  const fmtPrice = (p, cur) => sym(cur) + ' ' + num2(p);
  const fmtChange = (c) => (c > 0 ? '+' : c < 0 ? '−' : '') + num2(Math.abs(c)) + '%';

  function apply(prices) {
    window.CERT_PRICES = prices; // hesaplama.html hesap anında buradan okur

    // Tam fiyat (sembol + sayı): <... data-cert-price="EUA">
    document.querySelectorAll('[data-cert-price]').forEach((el) => {
      const row = prices[el.getAttribute('data-cert-price')];
      if (row && row.price != null) el.textContent = fmtPrice(row.price, row.currency);
    });

    // Sadece sayı (cümle içinde): <... data-cert-price-num="VCM">
    document.querySelectorAll('[data-cert-price-num]').forEach((el) => {
      const row = prices[el.getAttribute('data-cert-price-num')];
      if (row && row.price != null) el.textContent = num2(row.price);
    });

    // Günlük değişim %: <... data-cert-change="EUA" data-change-suffix=" vs dün">
    document.querySelectorAll('[data-cert-change]').forEach((el) => {
      const row = prices[el.getAttribute('data-cert-change')];
      if (row && row.change_pct != null) {
        el.textContent = fmtChange(row.change_pct) + (el.dataset.changeSuffix || '');
        el.classList.remove('text-emerald-600', 'text-red-600');
        el.classList.add(row.change_pct >= 0 ? 'text-emerald-600' : 'text-red-600');
      }
    });

    // Yükleme anının zaman damgası (İstanbul saati) — canlı fetch ile tutarlı, donmuş tarih yok
    const now = new Date();
    const tz = { timeZone: 'Europe/Istanbul' };
    const dateStr = new Intl.DateTimeFormat('tr-TR', Object.assign({ day: '2-digit', month: '2-digit', year: 'numeric' }, tz)).format(now);
    const timeStr = new Intl.DateTimeFormat('tr-TR', Object.assign({ hour: '2-digit', minute: '2-digit', hour12: false }, tz)).format(now) + ' GMT+3';
    document.querySelectorAll('[data-cert-time]').forEach((el) => { el.textContent = dateStr + ' ' + timeStr; });
    document.querySelectorAll('[data-cert-time-d]').forEach((el) => { el.textContent = dateStr; });
    document.querySelectorAll('[data-cert-time-t]').forEach((el) => { el.textContent = timeStr; });

    document.dispatchEvent(new CustomEvent('cert-prices-ready', { detail: prices }));
  }

  async function load() {
    try {
      if (!window.supabase || !window.supabase.createClient) throw new Error('supabase-js yüklenmedi');
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await client
        .from('certificate_prices')
        .select('id, price, currency, change_pct');
      if (error) throw error;
      const map = {};
      data.forEach((r) => { map[r.id] = r; });
      apply(Object.assign({}, FALLBACK, map)); // eksik id olursa fallback tamamlar
      console.log('[prices] Supabase canlı veri yüklendi:', map);
    } catch (e) {
      console.warn('[prices] Supabase başarısız, statik fallback kullanılıyor:', e.message);
      apply(FALLBACK);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
