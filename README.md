# arch — portfolyo

Java odaklı kişisel site. Monokrom palet: siyah zemin, tebeşir beyazı
metin, saf beyaz vurgu; girişte perspektif tüneli, projelerde cam klasörler,
en altta halftone wordmark footer. Türkçe, tek sayfa, GitHub Pages'e hazır.

## Neler var

- **Arka plan** — WebGL "bass ripple" ızgarası: siyah zemin üzerinde gümüş/krom teller, vuruşta saf beyaz parlamalar; fare/dokunmatik dalgacıkları window'dan takip eder (`src/components/ui/bass-ripple-background.tsx`)
- **Giriş** — sticky scroll ile ilerleyen 3B tünel (`src/components/ui/perspective-tunnel-hero.tsx`)
- **Projeler** — tıklayınca dosyaları masaya döken cam klasörler (`src/components/ui/glass-folder-cards.tsx`)
  - `minecraft` ve `github` klasörleri WestFolia, TabelaAPI ve CaptchaPlus'a gider
  - Yıldız ve sürüm bilgisi GitHub API'sinden canlı çekilir (1 saat önbellekli)
- **Footer** — imleçle dağılan halftone noktalardan oluşan dev "arch" yazısı (`src/components/ui/halftone-wordmark-footer.tsx`)
- **Fontlar** — Fraunces + IBM Plex Mono, [@fontsource](https://fontsource.org) ile paket içinde self-host; harici istek yok
- **Etkileşimler** — uiverse.io desenlerinden uyarlanan dönen konik kenar, parlama süpürmesi ve tooltip (`.conic-ring`, `src/index.css`)

## Yerelde çalıştır

```bash
npm install
npm run dev
```

## GitHub Pages'e yayınla

1. Bu klasörü bir repoya push et.
   - Kullanıcı kökü için: `archziwski.github.io` adlı repo (site `https://archziwski.github.io` adresinde açılır)
   - Ya da herhangi bir repo, örn. `portfolio` (`https://archziwski.github.io/portfolio/` adresinde açılır)
2. **Settings → Pages → Source: GitHub Actions** seç.
3. `main` branchine her push, otomatik derleyip yayımlar (`.github/workflows/deploy.yml`).

`vite.config.ts` içinde `base: "./"` olduğu için site her iki adres tipinde de
sorunsuz çalışır — ekstra ayar gerekmez.

## Özelleştir

| Ne | Nerede |
| --- | --- |
| Projeler, bağlantılar, açıklamalar | `src/data/site.ts` |
| Canlı GitHub verisi (yıldız, sürüm) | `src/hooks/useGithubMeta.ts` |
| Renkler ve fontlar | `src/index.css` (`@theme` bloğu) |
| Tünel kartları | `src/components/ui/perspective-tunnel-hero.tsx` (`CARDS` dizisi) |

## Yapı

```
src/
├── App.tsx                        # sayfa: hero → hakkımda → projeler → iletişim → footer
├── data/site.ts                   # site + proje verisi
├── hooks/useGithubMeta.ts         # canlı repo metası
└── components/
    ├── Navbar.tsx / Section.tsx
    └── ui/
        ├── perspective-tunnel-hero.tsx
        ├── glass-folder-cards.tsx
        └── halftone-wordmark-footer.tsx
```
"# Portfolyo" 
