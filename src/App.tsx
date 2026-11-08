import Navbar from "./components/Navbar";
import { Reveal, SectionHead } from "./components/Section";
import PerspectiveTunnelHero from "./components/ui/perspective-tunnel-hero";
import GlassFolder, { type FolderFile } from "./components/ui/glass-folder-cards";
import HalftoneWordmarkFooter from "./components/ui/halftone-wordmark-footer";
import BassRippleBackground from "./components/ui/bass-ripple-background";
import { projects, site } from "./data/site";
import { useGithubMeta } from "./hooks/useGithubMeta";

function fileMeta(
  fallback: string,
  live?: { stars: number | null; tag: string | null },
): string {
  if (!live) return fallback;
  const parts: string[] = [];
  if (live.stars !== null) parts.push(`★ ${live.stars}`);
  if (live.tag) parts.push(live.tag);
  return parts.length > 0 ? parts.join(" · ") : fallback;
}

export default function App() {
  const live = useGithubMeta(projects.map((p) => p.repo));

  const files: FolderFile[] = projects.map((p) => ({
    name: p.name,
    desc: p.desc,
    href: p.url,
    icon: p.icon,
    meta: fileMeta(p.fallbackMeta, live[p.repo]),
  }));

  return (
    <div className="min-h-screen bg-void font-body text-chalk">
      <BassRippleBackground />
      <Navbar />

      <div className="relative z-10">
        <PerspectiveTunnelHero />

        {/* İçerik zulası: üstte arka plan görünür, aşağıda metin okunur */}
        <main
          id="icerik"
          className="bg-gradient-to-b from-void/60 via-void/82 to-void/95"
        >
          {/* ——— 01 · HAKKIMDA ——— */}
          <section id="hakkimda" className="scroll-mt-24">
            <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
              <SectionHead
                index="01"
                eyebrow="Hakkımda"
                title={
                  <>
                    Merhaba, ben <em>Arch</em>.
                  </>
                }
              />

              <Reveal>
                <p className="max-w-2xl font-display text-[1.75rem] font-medium leading-[1.3] tracking-[-0.01em] text-chalk sm:text-[2rem]">
                  Deneyimli bir Java developerıyım —{" "}
                  <em className="text-neutral-300">Fabric, Paper, Spigot</em>{" "}
                  vb. API'ler hakkında bilgim var.
                </p>
              </Reveal>
            </div>
          </section>

          {/* ——— 02 · PROJELER ——— */}
          <section id="projeler" className="relative scroll-mt-24">
            {/* noktalı masa */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 text-chalk opacity-[0.10]"
              style={{
                backgroundImage:
                  "radial-gradient(currentColor 1.1px, transparent 1.4px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
              <SectionHead
                index="02"
                eyebrow="Projeler"
                title="projelerim"
                sub="tıkla"
              />

              <div className="grid items-start gap-10 md:grid-cols-2 md:gap-12">
                <GlassFolder
                  label="minecraft"
                  meta="3 proje · Paper & Folia"
                  art="verdant"
                  seed={7}
                  appearDelay={0}
                  files={files}
                />
                <GlassFolder
                  label="github"
                  meta="aynı işler · @archziwski"
                  art="aurora"
                  seed={11}
                  appearDelay={160}
                  files={files}
                />
              </div>

              <Reveal delay={0.1}>
                <p className="mt-14 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-600">
                  Üzerine gel · tıkla ve aç
                </p>
              </Reveal>
            </div>
          </section>

          {/* ——— 03 · İLETİŞİM ——— */}
          <section id="iletisim" className="scroll-mt-24">
            <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
              <SectionHead
                index="03"
                eyebrow="İletişim"
                title="Aklında bir proje mi var?"
                sub="Bir sunucu, bir eklenti ya da sadece teknik bir sohbet — kapı açık."
              />

              <Reveal>
                <div>
                  <a
                    href={site.github}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-baseline justify-between gap-4 border-t border-white/10 py-7 transition-colors hover:border-hi/40 sm:py-9"
                  >
                    <span className="font-display text-4xl font-medium tracking-[-0.015em] text-chalk transition-all duration-300 group-hover:translate-x-2 group-hover:italic group-hover:text-hi sm:text-6xl">
                      GitHub
                    </span>
                    <span className="font-mono text-xs tracking-[0.16em] text-neutral-500 transition-colors group-hover:text-hi sm:text-sm">
                      {site.githubHandle} ↗
                    </span>
                  </a>
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-baseline justify-between gap-4 border-y border-white/10 py-7 transition-colors hover:border-hi/40 sm:py-9"
                  >
                    <span className="font-display text-4xl font-medium tracking-[-0.015em] text-chalk transition-all duration-300 group-hover:translate-x-2 group-hover:italic group-hover:text-hi sm:text-6xl">
                      Instagram
                    </span>
                    <span className="font-mono text-xs tracking-[0.16em] text-neutral-500 transition-colors group-hover:text-hi sm:text-sm">
                      {site.instagramHandle} ↗
                    </span>
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-9 font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-600">
                  Cevap genelde hızlıdır.
                </p>
              </Reveal>
            </div>
          </section>
        </main>

        <HalftoneWordmarkFooter
          wordmark="arch"
          label="ARCH"
          meta="© 2026"
          palette={{ background: "#060607", ink: "#dcdce0", warm: "#ffffff" }}
          fontFamily={'"Fraunces Variable", "Iowan Old Style", Georgia, serif'}
          fontWeight={600}
          columns={[
            {
              title: "Projeler",
              links: [
                { label: "WestFolia", href: "https://github.com/archziwski/WestFolia" },
                { label: "TabelaAPI", href: "https://github.com/archziwski/TabelaAPI" },
                { label: "CaptchaPlus", href: "https://github.com/archziwski/CaptchaPlus" },
              ],
            },
            {
              title: "Bağlantılar",
              links: [
                { label: "GitHub", href: site.github },
                { label: "Instagram", href: site.instagram },
              ],
            },
            {
              title: "Site",
              links: [
                { label: "Hakkımda", href: "#hakkimda" },
                { label: "Projeler", href: "#projeler" },
                { label: "İletişim", href: "#iletisim" },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
