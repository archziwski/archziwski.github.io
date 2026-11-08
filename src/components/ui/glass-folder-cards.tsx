import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowUpRight, ChevronDown, type LucideIcon } from "lucide-react";

// ————————————————————————————————————————————————
// Cam Klasör Kartları — 21st.dev "glass-folder-cards"
// konseptinin arch uyarlaması: kaydırmayla yerine toplanan,
// işaretçiye doğru eğilen, tıklanınca dosyalarını tıklanabilir
// kartlar halinde masaya döken buzlu cam klasörler.
// Sadece React + Tailwind; harici görsel/font yok.
// ————————————————————————————————————————————————

export type FolderArt = "aurora" | "verdant" | "dusk" | "none";

export interface FolderFile {
  name: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  meta?: string;
}

export interface GlassFolderProps {
  label: string;
  meta?: string;
  files: FolderFile[];
  art?: FolderArt;
  seed?: number;
  appearDelay?: number;
  className?: string;
}

/** Deterministik pseudo-rastgele; seed aynıysa sanat da aynı kalır. */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ART_PALETTES: Record<Exclude<FolderArt, "none">, string[]> = {
  aurora: ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.06)", "rgba(185,185,195,0.08)"],
  verdant: ["rgba(255,255,255,0.08)", "rgba(150,150,160,0.09)", "rgba(255,255,255,0.05)"],
  dusk: ["rgba(215,215,225,0.09)", "rgba(95,95,105,0.12)", "rgba(255,255,255,0.04)"],
};

function ArtLayer({ art, seed }: { art: FolderArt; seed: number }) {
  if (art === "none") return null;
  const rnd = mulberry32(seed);
  const blobs = ART_PALETTES[art].map((color) => ({
    left: 6 + rnd() * 62,
    top: 2 + rnd() * 52,
    size: 90 + rnd() * 130,
    color,
  }));
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            opacity: 0.9,
            transform: "translate(-32%, -32%)",
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
    </div>
  );
}

export default function GlassFolder({
  label,
  meta,
  files,
  art = "aurora",
  seed = 3,
  appearDelay = 0,
  className = "",
}: GlassFolderProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // İşaretçiye eğilme (yalnızca hassas işaretçide, klasör kapalıyken)
  const rawPX = useMotionValue(0.5);
  const rawPY = useMotionValue(0.5);
  const leanY = useSpring(useTransform(rawPX, [0, 1], [-8, 8]), {
    stiffness: 160,
    damping: 18,
  });
  const leanX = useSpring(useTransform(rawPY, [0, 1], [6, -6]), {
    stiffness: 160,
    damping: 18,
  });

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (open) return;
    if (e.pointerType !== "mouse") return;
    const b = e.currentTarget.getBoundingClientRect();
    rawPX.set(Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)));
    rawPY.set(Math.min(1, Math.max(0, (e.clientY - b.top) / b.height)));
  };
  const resetLean = () => {
    rawPX.set(0.5);
    rawPY.set(0.5);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) setOpen(false);
  };

  return (
    <div ref={rootRef} className={className} onKeyDown={onKeyDown}>
      <div className="relative" style={{ perspective: 1200 }}>
        {/* Klasör kulağı — önce o iner */}
        <motion.div
          aria-hidden
          initial={{ y: -22, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 240, damping: 22, delay: appearDelay / 1000 }}
          className="absolute -top-[13px] left-5 z-0 h-[26px] w-24 rounded-t-lg border-x border-t border-white/10 bg-white/[0.05]"
        />

        {/* Klasör gövdesi — alttan katlanarak toplanır */}
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`${label} klasörünü ${open ? "kapat" : "aç"}`}
          initial={{ rotateX: -55, opacity: 0, y: 26 }}
          whileInView={{ rotateX: 0, opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 17,
            delay: (appearDelay + 140) / 1000,
          }}
          onPointerMove={onPointerMove}
          onPointerLeave={resetLean}
          className="conic-host relative z-10 block w-full cursor-pointer text-left"
        >
          <motion.div
            style={{ rotateX: leanX, rotateY: leanY, transformStyle: "preserve-3d" }}
            className="conic-ring relative h-40 overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_60px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:h-44"
          >
            <ArtLayer art={art} seed={seed} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />

            <div className="absolute right-4 top-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              {open ? "kapat" : "aç"}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/40 to-transparent p-4 sm:p-5">
              <div className="min-w-0">
                <span className="block truncate font-mono text-sm font-semibold tracking-[0.08em] text-chalk">
                  {label}
                </span>
                {meta && (
                  <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                    {meta}
                  </span>
                )}
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-neutral-400">
                {files.length} öğe
              </span>
            </div>
          </motion.div>
        </motion.button>
      </div>

      {/* Dosyalar masaya dökülür */}
      <AnimatePresence initial={false}>
        {open &&
          files.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: -20, rotate: i % 2 ? 2.2 : -2.2, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: -14,
                  rotate: i % 2 ? -2 : 2,
                  scale: 0.97,
                  transition: { duration: 0.16 },
                }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 + i * 0.07 }}
                className="relative z-20"
              >
                <a
                  href={f.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative mt-2.5 flex items-center gap-3.5 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.07]"
                >
                  {/* uiverse tarzı parlama süpürmesi */}
                  <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                    <span className="absolute inset-y-0 w-1/4 -translate-x-[220%] skew-x-[-16deg] bg-white/[0.08] transition-transform duration-700 ease-out group-hover:translate-x-[520%]" />
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-chalk">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[13px] font-semibold text-chalk">
                      {f.name}
                    </span>
                    <span className="mt-1 block text-[14px] leading-snug text-neutral-400">
                      {f.desc}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    {f.meta && (
                      <span className="whitespace-nowrap font-mono text-[10px] tracking-[0.12em] text-neutral-500">
                        {f.meta}
                      </span>
                    )}
                    <ArrowUpRight className="h-4 w-4 text-neutral-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-hi" />
                  </span>
                </a>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
