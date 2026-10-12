# Milkyway

Türkçe, mobil öncelikli bir Güneş Sistemi atlası. Derleme, paket yöneticisi veya uygulama sunucusu gerektirmez.

```sh
python3 -m http.server 8000
```

Tarayıcıda `http://localhost:8000` adresini açın.

## Keşif deneyimi

- Güneş, sekiz gezegen ve beş cüce gezegen: Ceres, Plüton, Haumea, Makemake, Eris.
- Yedi merkez cisim çevresinde 12 seçili uydu: Ay, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Enceladus, Titan, Titania, Triton ve Charon.
- Triton’un ters yönlü hareketi; Plüton–Charon ortak kütle merkezi.
- Güneş sistemi ve uydu sistemi görünümleri, hız seçimi ve duraklatma.
- Sanatsal, döndürülebilir küreler; çap karşılaştırması; ışık yolculuğu deneyi.
- NASA görselleri, keşif günlüğü ve klavyeyle kullanılabilen görsel penceresi.

Yörüngeler dairesel bir şemaya indirgenmiş, mesafeler ve boyutlar okunabilirlik için sıkıştırılmıştır. Konumlar canlı astronomik efemeris değildir. Dolanım süreleri Dünya günü cinsinden gerçek oranları korur; uydu görünümüne geçildiğinde zaman ölçeği yavaşlar. Uydu listesi tam bir katalog değildir. Küre dokuları sanatsaldır; fiziksel harita olarak kullanılmamalıdır.

## Dosyalar

- `index.html`: Türkçe içerik ve anlamsal sayfa yapısı.
- `style.css`: duyarlı tasarım, yerel font tanımları ve azaltılmış hareket desteği.
- `solar-data.js`: gök cisimleri, merkez ilişkileri ve yaklaşık bilimsel değerler.
- `script.js`: tek çizim döngüsü, görünürlük yönetimi, canvas modelleri ve etkileşimler.
- `images/`: boyutlandırılmış WebP görselleri; kökteki JPEG’ler büyütülmüş görünümde kullanılır.
- `fonts/`: Türkçe karakterleri içeren, yerel WOFF2 fontlar ve SIL Open Font License metinleri.
- `tests/smoke.cjs`: Chromium/WebKit işlev ve erişilebilirlik kontrolleri.
- `tests/measure.cjs`: görünür model, küre ve ekran dışı animasyon maliyeti ölçümü.
- `reports/performance.md`: ölçüm koşulları, önce/sonra sonuçları ve fiziksel Safari kontrol listesi.

## Performans yaklaşımı

Yörünge yolları önbelleğe çizilir. Küre dokuları ihtiyaç anında oluşturulur; küre izdüşümü ve ışık katsayıları yeniden kullanılır. Canvas çözünürlük oranı en fazla 1,5; çizim hedefi en fazla 30 kare/sn’dir. `IntersectionObserver`, `ResizeObserver` ve Page Visibility API ile görünmeyen animasyonlar durur. `prefers-reduced-motion` değişiklikleri oturum sırasında da izlenir. Yeni çalışma zamanı kütüphanesi eklenmemiştir. Google Fonts kökenli fontlar yereldir; sayfa açılışında üçüncü taraf isteği yapılmaz.

Statik sunucu üretimde Brotli/gzip ve sürümlenmiş statik dosyalar için uygun önbellek başlıkları sağlamalıdır. Yerel Python sunucusu bu optimizasyonları sağlamaz. Yayınlama öncesi gerçek iPhone/iPad Safari testi ayrıca yapılmalıdır.

## İsteğe bağlı geliştirme testleri

Playwright ve axe-core yalnızca geliştirme testlerinde kullanılır; Safari motoru, dokunmatik görünüm, klavye ve erişilebilirlik regresyonlarını yakalamak için eklenmiştir. Siteye yüklenmezler.

```sh
npm install --prefix /tmp/milkyway-audit playwright@1.64.0 @axe-core/playwright@4.13.0 lighthouse@13.5.0
/tmp/milkyway-audit/node_modules/.bin/playwright install --with-deps chromium webkit
NODE_PATH=/tmp/milkyway-audit/node_modules node tests/smoke.cjs
```

`TEST_URL`, `TEST_ENGINE`, `CHROMIUM_EXECUTABLE` ve `WEBKIT_EXECUTABLE` ortam değişkenleriyle sunucu veya tarayıcı yolu seçilebilir. Linux WebKit, fiziksel iPhone Safari ile aynı ürün değildir; bu test iOS donanımı, termal davranış veya pil tüketimini ölçmez.

```sh
NODE_PATH=/tmp/milkyway-audit/node_modules node tests/measure.cjs http://localhost:8000 webkit reports/current-webkit.json
/tmp/milkyway-audit/node_modules/.bin/lighthouse http://localhost:8000 \
  --chrome-flags='--headless --no-sandbox' --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=reports/current-lighthouse.json
```

## Kaynaklar ve lisanslar

- [NASA Science — Güneş Sistemi](https://science.nasa.gov/solar-system/)
- [NASA — Cüce gezegenler](https://science.nasa.gov/dwarf-planets/), [Ceres](https://science.nasa.gov/dwarf-planets/ceres/facts/), [Plüton](https://science.nasa.gov/dwarf-planets/pluto/facts/)
- [NASA JPL — Uydu yörünge elemanları](https://ssd.jpl.nasa.gov/sats/elem/). Tablodaki dönem türleri farklı olabilir; modelde eğitim amaçlı yuvarlanmış dolanım süreleri kullanılır.
- [IAU — Gezegen tanımı](https://www.iau.org/public/themes/pluto/)
- [Apollo 17 / AS17-148-22727](https://images.nasa.gov/details/as17-148-22727): NASA. Yerel WebP türevleri yalnızca boyut ve sıkıştırma bakımından düzenlenmiştir.
- Kozmik Uçurumlar: NASA, ESA, CSA, STScI. Gizemli Dağ: NASA, ESA, M. Livio ve Hubble 20. Yıl Ekibi (STScI). Andromeda: NASA/JPL-Caltech (GALEX). Özgün projedeki görüntüler korunmuştur; kaynak notları sayfanın altındadır.
- DM Sans ve Instrument Serif: [Google Fonts](https://fonts.google.com/), SIL OFL 1.1. Font dosyaları Latin/Türkçe ve temel noktalama karakterleri için alt kümelenmiştir; lisanslar `fonts/` içinde korunur.

Görsel yön, [Awwwards değerlendirme ölçütlerini](https://www.awwwards.com/about-evaluation/) (tasarım %40, kullanılabilirlik %30, yaratıcılık %20, içerik %10) referans alır. Bir ödül veya jüri sonucu iddiası değildir.
