# Güneş Sistemi sitesi

Türkçe, tek sayfalık, derleme gerektirmeyen bir statik site. Güneş Sistemi'ni canlı yörünge modeli, 3D gezegenler ve derin uzay görselleriyle anlatır.

## Dosyalar
- `index.html`: sayfa yapısı ve içerik (tüm metinler Türkçe)
- `style.css`: tüm stiller
- `script.js`: yörünge modeli (canvas, JPL ortalama yörünge elemanları + Kepler denklemiyle bugünkü gerçek konumlar), 3D gezegen (canvas, elle yazılmış), hero'daki canlı Dünya telemetrisi, gerçek ölçekli kaydırma yolculuğu (#yolculuk), ışık yarışı, lightbox, kaydırma efektleri
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
- Ceres ve uydular için yörünge modeli (Plüton eklendi; Ceres için güvenilir J2000 elemanları gerekli)
- Gezegenlerin gerçek dokuları (şu an kodla üretiliyor)
- Performans: Lighthouse skorunu ölç ve iyileştir
- İngilizce dil seçeneği
