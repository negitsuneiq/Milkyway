# Milkyway — tasarım, işlev ve performans doğrulaması

Tarih: 11 Ekim 2026. Başlangıç: `ea9f099` (`main`).

## Neyi, neden değiştirdik?

1. **Görsel kimlik ve okuma sırası:** Apollo 17 Dünya fotoğrafı, editoryal serif başlıklar, sakin koyu zemin, sıcak vurgu rengi ve altı bölümlü bir keşif akışı. Açılış bekleme ekranı kaldırıldı. Ziyaretçi içeriğe hemen erişiyor. Awwwards’ın tasarım (%40), kullanılabilirlik (%30), yaratıcılık (%20), içerik (%10) çerçevesi referans alındı; ödül garantisi yok.
2. **Yörünge atlası:** Beş cüce gezegen ve 12 seçili uydu eklendi. Uydu sistemleri ayrı görünümde; Triton ters yönde, Plüton ve Charon ortak kütle merkezi çevresinde dolanıyor. Zaman birimi, şematik ölçek ve temsili başlangıç konumları açıkça belirtiliyor. Veriler arayüz kodundan ayrıldı.
3. **Animasyon maliyeti:** Sürekli çalışan bağımsız çizim döngüleri tek döngüye indirildi. Görünmeyen canvas ve arka plan sekmesi duruyor. Çizimler en fazla 30 kare/sn; DPR en fazla 1,5. Yörünge yolları ve küre izdüşümü önbellekte, küre dokuları ihtiyaç anında hazırlanıyor. Sürekli yıldız alanı, imleç takibi, metin karıştırma ve kart eğme efektleri kaldırıldı.
4. **Yükleme:** Görseller ekran boyutuna göre WebP olarak sunuluyor. Galeri tembel yükleniyor; büyütmede özgün JPEG kullanılıyor. Google Fonts kökenli fontlar, Türkçe karakterler ve lisanslar korunarak yerelleştirildi. Kritik serif fontlar önden yükleniyor; üçüncü taraf açılış isteği yok.
5. **Mobil ve erişilebilirlik:** Dikey kaydırma canvas üzerinde korunuyor; yatay hareket ve klavye cisim seçiyor. Dokunma hedefleri en az 44 px. Azaltılmış hareket hem sistem ayarına hem kullanıcı düğmesine bağlı. Duraklatma küreyi de durduruyor. Görsel penceresi odak hapsi, Escape ve açan düğmeye odak dönüşü sağlıyor. Safari/WebKit’te dekoratif yörünge taşması giderildi.

## Mobil Lighthouse: üç ölçümün medyanı

Aynı Linux çalışma alanı, Chromium 154, Lighthouse 13.5.0; varsayılan mobil benzetimi / simüle yavaş ağ ve CPU. Başlangıç dosyaları ayrı bir dizinde, `python3 -m http.server` ile `8001` portunda; güncel sürüm `8000` portunda sunuldu. Önce/sonra koşuları **ardışık** çalıştırıldı. Yerel sunucu sıkıştırma veya uzun süreli önbellek başlıkları sağlamıyor. Bu sonuçlar gerçek kullanıcı saha verisi değildir.

| Ölçüt | Önce | Sonra |
| --- | ---: | ---: |
| Performans | 71 | **95** |
| Erişilebilirlik | 100 | **100** |
| İyi uygulamalar | 96 | **100** |
| SEO | 91 | **100** |
| İlk içerik (FCP) | 3,37 sn | **1,68 sn** |
| En büyük içerik (LCP) | 4,81 sn | **2,26 sn** |
| Görsel hız indeksi | 6,07 sn | **1,68 sn** |
| Toplam engelleme süresi (TBT) | 0 ms | **183 ms** |
| Düzen kayması (CLS) | 0 | **0,00022** |

Performans puanları: önce **74, 70, 71**; sonra **98, 95, 95**. Medyanın kullanılması en iyi koşunun seçilmesini önler. Yeni düzenin ilk hesaplanması ve yazı tipleri TBT’yi artırdı; medyan 200 ms’nin altında kaldı. Açılış ve LCP belirgin biçimde iyileşti. Test ortamı ve koşu ayarları: [lighthouse-summary.json](lighthouse-summary.json).

## Mobil görünümde animasyon maliyeti

Playwright 1.64.0, iPhone 13 görünümü (390 × 664 CSS px, DPR 3), `prefers-reduced-motion: no-preference`. Her senaryoda kaydırmadan sonra 600 ms beklenip yaklaşık 3 saniye örnek alındı. Ölçüt, **saniye başına JavaScript `requestAnimationFrame` callback süresi**; tüm cihaz CPU’su, çizim/GPU maliyeti, pil tüketimi veya ekran FPS’si değildir. Önce ve sonra callback sayısı farklıdır; uygulamanın üç döngüsü tek döngüye indirilmiştir. WebKit zamanlayıcısı milisaniye hassasiyetindedir. Kısa örnekler yaklaşık laboratuvar değerleridir.

| Motor / görünüm | Önce, ms/sn | Sonra, ms/sn |
| --- | ---: | ---: |
| Chromium — yörünge | 60,32 | **7,26** |
| Chromium — küre | 334,75 | **45,41** |
| Chromium — ekran dışında | 132,38 | **0** |
| WebKit 27.2 — yörünge | 7,97 | **7,32** |
| WebKit 27.2 — küre | 65,47 | **38,46** |
| WebKit 27.2 — ekran dışında | 19,54 | **0** |

Chromium’da yörünge callback süresi yaklaşık %88, küre callback süresi %86 azaldı. WebKit’te küre callback süresi yaklaşık %41 azaldı; küre için callback p95 değeri 11 ms’den 2 ms’ye indi. Her iki motorda da ekran dışındaki sürekli callback sayısı **sıfır** oldu.

Ham ölçümler: [önce Chromium](before-chromium.json), [sonra Chromium](after-chromium.json), [önce WebKit](before-webkit.json), [sonra WebKit](after-webkit.json). Yeniden üretme komutları README’de ve `tests/measure.cjs` içinde.

## İşlev ve erişilebilirlik

`tests/smoke.cjs` hem Chromium hem WebKit’te çalıştırıldı:

- 8 gezegen, 5 cüce gezegen, 12 uydu sayıları; 25 cismin dokunmayla seçilmesi ve doğru merkez sisteme geçişi.
- 320, 390, 768, 1024 ve 1440 px genişliklerde yatay taşma kontrolü. Mobil zoom yanılsamasını önlemek için ölçüt `documentElement.clientWidth` ile karşılaştırılır.
- Duraklatıldığında hem yörünge hem küre piksel çıktısının değişmemesi; yeniden oynatıldığında saatin ilerlemesi.
- Sol/sağ ok, yatay pointer hareketi, dikey hareketin seçim yapmaması, iptal edilen hareket ve `touch-action: pan-y`.
- Hikâye kartından ilgili uydu sistemine geçiş.
- Görsel penceresinde Tab odağı, Escape ile kapanış ve odağın açan düğmeye dönmesi.
- İlk yüklemede ve oturum sırasında `prefers-reduced-motion`; görünür durağan modelde ve ekran dışında devam eden rAF olmaması.
- Azaltılmış hareketle ışık deneyinin anında ve anlaşılır biçimde tamamlanması.
- axe-core 4.13.0 WCAG 2 A/AA ve 2.1 AA taraması: **0 otomatik ihlal**.
- JavaScript çalışma hatası: **0**. JavaScript kapalıyken yazılı içerik ve açıklama görünür.

Otomatik erişilebilirlik taraması tüm erişilebilirlik gereksinimlerini kanıtlamaz. Klavye davranışları ayrıca işlev testleriyle doğrulandı.

## Safari ölçümünün sınırı ve gerçek cihaz kontrolü

**Fiziksel iPhone/iPad veya macOS Safari’ye erişim yoktu.** Safari ile aynı motor ailesindeki **Linux Playwright WebKit 27.2** kullanıldı. iOS Safari, gerçek GPU, 60/120 Hz ekran, bellek baskısı, termal kısıt, pil ve VoiceOver sonuçları ölçülmüş gibi sunulmuyor. Sentetik pointer testleri gerçek parmak kaydırmasının yerine geçmez.

Yayın öncesi gerçek cihazda yapılacaklar:

1. En az bir güncel iPhone ve iPad Safari’de soğuk açılışı Safari Web Inspector Timelines ile kaydet; aynı ağda üç kez FCP/LCP ve ana iş parçacığı kullanımını karşılaştır.
2. Model görünürken ve ekran dışındayken 30 saniyelik CPU/kare süresi kaydı al; arka plana geçiş, geri dönüş ve cihaz ısınması sonrasında tekrar kontrol et.
3. Canvas üzerinde tek parmakla dikey kaydır, yatay sürükle, yakınlaştırma ve yön değişimini dene. Safari adres çubuğunun açılıp kapanmasını ve güvenli alanları kontrol et.
4. Ayarlar → Erişilebilirlik → Hareketi Azalt açıkken modelin durmasını; VoiceOver ile kategori, cisim seçimi ve görsel penceresini kontrol et.
5. Uzun süre kullanımda belleği, resim büyütme/kapatmayı ve arka plan sekmesinden dönüşü gözle.

Çalışan uygulamaya yeni üçüncü taraf JavaScript kütüphanesi eklenmedi. Test araçları yalnızca geliştirme ortamında kullanılıyor.

## 12 Ekim: son mobil kullanım düzenlemesi

Cisim seçici çizimin üstüne, duraklatma ve hız kontrolleri çizimin hemen altına taşındı. Mobilde uzun bilgi kartını geçmeden model kullanılabiliyor; DOM ve klavye sırası da görsel sırayla aynı. Görünüm düğmeleri 44 px yüksekliğe çıkarıldı. Testlere kontrol sırası ve görünür düğmelerin minimum dokunma yüksekliği kontrolleri eklendi.

Plüton–Charon görünümünde küre çapları, ortak kütle merkezi işaretinin tüm yörünge açıları ve ekran genişliklerinde Plüton’un dışında kalacağı biçimde ayarlandı; iki cismin çap oranı bu görünümde korunuyor. Başlangıç konumu ve mesafe şematik olmaya devam ediyor. Önizlemeler son düzeni gösteriyor; modül görüntülerinde üst gezinme çubuğu kırpma dışı bırakılmıştır.

Bu son düzenlemeden sonra Chromium ve WebKit testlerinin tamamı tekrar geçti. Üç yeni mobil Lighthouse koşusu **95, 94, 96** verdi; medyan **95** kaldı. Erişilebilirlik, iyi uygulamalar ve SEO her koşuda **100**. Son medyanlar: FCP **1,73 sn**, LCP **2,25 sn**, TBT **190 ms**, CLS **0.00022**. Son kontrol kayıtları: [final-lighthouse-summary.json](final-lighthouse-summary.json).
