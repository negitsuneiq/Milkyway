# Güneş Sistemi sitesi

Türkçe, tek sayfalık, derleme gerektirmeyen bir statik site. Güneş Sistemi'ni canlı yörünge modeli, 3D gezegenler ve derin uzay görselleriyle anlatır.

## Dosyalar
- `index.html`: sayfa yapısı ve içerik (tüm metinler Türkçe)
- `style.css`: tüm stiller
- `script.js`: görünürlük kontrollü tek çizim döngüsü, yörünge modeli, sanatsal küre, ışık yarışı ve erişilebilir görsel penceresi
- `solar-data.js`: Güneş, 8 gezegen, 5 cüce gezegen ve 12 seçili uydu; dolanım süreleri Dünya günü cinsinden
- `images/`: duyarlı WebP türevleri; kökteki JPEG’ler görsel büyütmede kullanılır
- `fonts/`: yerel Google Fonts alt kümeleri ve OFL lisansları
- `tests/`: isteğe bağlı Playwright/WebKit ve axe-core geliştirme testleri (çalışma zamanı bağımlılığı değildir)
- `reports/performance.md`: ölçüm yöntemi, sonuçlar ve gerçek cihaz kontrol listesi
- `webb.jpg`, `hubble.jpg`, `andromeda.jpg`, `hero.jpg`: Webb, Hubble ve GALEX görüntüleri (kök dizinde, klasör yok. Uygun görürsen bir `images/` klasörüne taşıyıp yolları güncelleyebilirsin)

## Çalıştırma
`python3 -m http.server 8000` ile aç, tarayıcıda `http://localhost:8000`. Derleme aracı yok, bağımlılık yok.

## Kurallar
- Mobil öncelikli. Ana kullanıcı telefonda/tabletde Safari kullanıyor, dokunmatik hareketler (kaydırma, sürükleme) çalışmalı.
- `prefers-reduced-motion` desteği korunmalı. Yeni animasyonlar bu ayara uymalı.
- Erişilebilirlik: klavye odağı, alt metinler, `aria-` nitelikleri korunmalı.
- Metin dili Türkçe kalmalı. Bilimsel verileri değiştirirken güvenilir kaynak kullan.
- Dış bağımlılık: yalnızca Google Fonts. Yeni kütüphane eklenecekse gerekçesini belirt.
- Görsellerin telif/kaynak notu footer'da tutulmalı.

## Geliştirme fikirleri
- Modeldeki 12 seçili uyduyu daha geniş bir katalogla zenginleştirme
- Gezegenlerin gerçek dokuları (şu an kodla üretiliyor)
- Performans: Lighthouse ve WebKit ölçümlerini koru; fiziksel iPhone Safari’de ayrıca doğrula
- İngilizce dil seçeneği
