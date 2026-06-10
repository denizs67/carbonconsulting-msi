# Kullanıcı Tipleri ve Use Case Tasarımı
*(Rapor — System Analysis bölümüne eklenecek. CarbonConsulting / CBAM Uyum Platformu)*

---

## LIST OF USERS / OWNERS OF THE SYSTEM AND THE DATA
*(Sistemin ve Verinin Kullanıcıları / Sahipleri)*

Sistem **iki kullanıcı tipi** üzerine tasarlanmıştır. Kapsam bilinçli olarak dar tutulmuştur: birincil son kullanıcı (ihracatçı firma) ve sistemi ayakta tutan operatör (yönetici).

### Kullanıcılar (Users)

| # | Kullanıcı Tipi | Kim | Temel Amaç |
|---|----------------|-----|------------|
| 1 | **İhracatçı Firma Kullanıcısı** | Türk ihracatçı sanayi firmasının sürdürülebilirlik / CBAM sorumlusu (demir-çelik, çimento, alüminyum, gübre, elektrik) | Üretimine gömülü karbon emisyonunu hesaplamak, CBAM sertifika ihtiyacını ve yıllık maliyetini öğrenmek |
| 2 | **Sistem Yöneticisi (Admin)** | CarbonConsulting platform operatörü | Referans verisini (emisyon faktörleri, sertifika fiyatları) güncel tutmak, içerik ve kullanıcıları yönetmek |

### Sahipler ve Veri Sahipliği (Owners & Data Ownership)

| Varlık | Sahibi | Açıklama |
|--------|--------|----------|
| Sistem (platform) | CarbonConsulting | Platformun işletme ve bakım sorumluluğu |
| Emisyon faktörleri, sertifika fiyatları, sektör/tahvil referans verisi | Sistem Yöneticisi | Kaynaklardan (Worldsteel, IEA, Ember, ICAP vb.) gelen, tüm hesaplamaları besleyen referans veri |
| Firma üretim verisi ve hesap sonuçları | İhracatçı Firma | Firmanın kendi girdiği gizli üretim verisi; veri sahibi firmadır |

---

## USE CASE DIAGRAM

### Aktör 1 — İhracatçı Firma Kullanıcısı

| Use Case | Açıklama |
|----------|----------|
| Sektör seç | 5 CBAM sektöründen birini seçer |
| Üretim verisi gir | Rota/tip, yıllık üretim, AB ihracat oranı gibi sektöre özel verileri girer |
| Karbon emisyonu hesapla | Scope 1+2 toplam emisyonu (tCO₂e) hesaplatır |
| CBAM sertifika ihtiyacını görüntüle | AB ihracat oranına göre gerekli sertifika adedini görür |
| Maliyet senaryolarını karşılaştır | Zorunlu CBAM (EUA) ve CBAM + gönüllü net-zero senaryolarını karşılaştırır |
| Rapor / çıktı al | Hesap sonucunu raporlama şablonuna döker (CBAM Quarterly vb.) |
| Sektör / sertifika / finansman bilgisini görüntüle | Bilgilendirici sayfaları okur |

**İlişkiler:**
- `Karbon emisyonu hesapla` **«include»** → `Sektör seç`, `Üretim verisi gir`
- `Rapor / çıktı al` **«extend»** → `CBAM sertifika ihtiyacını görüntüle`

### Aktör 2 — Sistem Yöneticisi (Admin)

| Use Case | Açıklama |
|----------|----------|
| Emisyon faktörlerini güncelle | Sektör bazlı emisyon faktörlerini günceller |
| Sertifika fiyatlarını yönet | EUA / VCM fiyatlarını veya veri kaynağı (API) bağlantısını yönetir |
| Referans içeriğini güncelle | Sektör profilleri, yeşil tahvil tabloları gibi içerikleri günceller |
| Kullanıcı hesaplarını yönet | İhracatçı firma kullanıcı erişimini yönetir |

**Not:** Sistem Yöneticisi'nin güncellediği referans veri, İhracatçı Firma'nın `Karbon emisyonu hesapla` use case'ini doğrudan besler — iki aktör veri üzerinden dolaylı olarak bağlıdır.

---

## Notlar
- Bu tasarım **analiz/tasarım dokümantasyonudur**; canlı sitede login/rol implementasyonu kapsam dışıdır (ders analiz + tasarım odaklıdır).
- Use case diyagramının görsel hâli `kullanici-tipleri-usecase.svg` olarak ayrıca üretildi — rapora görsel olarak eklenebilir.
