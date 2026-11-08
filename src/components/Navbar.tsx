import { useEffect, useState } from "react";
import { GithubMark } from "./BrandIcons";
import { site } from "../data/site";

const LINKS = [
  { href: "#hakkimda", label: "Hakkımda" },
  { href: "#projeler", label: "Projeler" },
  { href: "#iletisim", label: "İletişim" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-void/75 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#giris"
          className="font-display text-[20px] font-semibold italic leading-none tracking-tight text-chalk"
        >
          arch<span className="not-italic text-hi">.</span>
        </a>
        <div className="flex items-center gap-6 sm:gap-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-chalk sm:block"
            >
              {l.label}
            </a>
          ))}
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profili"
            className="group/gh relative text-neutral-400 transition-colors hover:text-hi"
          >
            <GithubMark className="h-[18px] w-[18px]" />
            {/* uiverse tarzı tooltip */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-panel px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-neutral-300 opacity-0 transition-opacity duration-200 group-hover/gh:opacity-100"
            >
              GitHub
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
