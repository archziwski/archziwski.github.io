import {
  motion,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Blocks,
  Boxes,
  Braces,
  Coffee,
  Cpu,
  FlaskConical,
  FolderGit2,
  Network,
  Puzzle,
  type LucideIcon,
} from "lucide-react";

// ————————————————————————————————————————————————
// Perspektif Tüneli — girişte kartlar altın açıyla
// yerleştirilmiş 3B bir koridorda akar. Orijinal bileşen
// (21st.dev "perspective-tunnel-hero") arch temasına uyarlandı:
// siyah zemin, mor derinlik, nane yeşili vurgu; görsel kartlar
// yerine stack kartları; wheel-hijack yerine sticky scroll.
// ————————————————————————————————————————————————

interface TechCard {
  icon: LucideIcon;
  title: string;
  sub: string;
}

const CARDS: TechCard[] = [
  { icon: Coffee, title: "JAVA", sub: "ana dil" },
  { icon: Cpu, title: "JVM", sub: "profil & ayarlama" },
  { icon: Blocks, title: "FOLIA", sub: "bölgesel threading" },
  { icon: Puzzle, title: "PAPER", sub: "eklenti çatısı" },
  { icon: Boxes, title: "GRADLE", sub: "yapı & derleme" },
  { icon: Network, title: "PACKETS", sub: "PacketEvents" },
  { icon: Braces, title: "API", sub: "arayüz tasarımı" },
  { icon: FlaskConical, title: "TEST", sub: "testkit & CI" },
  { icon: FolderGit2, title: "AÇIK KAYNAK", sub: "MIT lisanslı" },
];

interface TunnelCardData {
  item: TechCard;
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
}

const TUNNEL_CARDS: TunnelCardData[] = CARDS.map((item, i) => {
  const goldenAngle = i * 137.5 * (Math.PI / 180);
  const radiusFactorX = 0.28 + (i % 3) * 0.08;
  const radiusFactorY = 0.26 + (i % 2) * 0.09;

  return {
    item,
    angleCos: Math.cos(goldenAngle),
    angleSin: Math.sin(goldenAngle),
    radiusFactorX,
    radiusFactorY,
    rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
    index: i,
  };
});

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

interface TunnelCardProps {
  card: TunnelCardData;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: StageDimensions;
}

function TunnelCard({ card, progress, pointer, total, stage }: TunnelCardProps) {
  const staggerSpan = 0.55;
  const start = (card.index / total) * (1 - staggerSpan);
  const end = start + staggerSpan;

  const localProgress = useTransform(progress, [start, end], [0, 1]);

  const farZ = stage.isMobile ? -1200 : -1700;
  const nearZ = stage.isMobile ? 350 : 500;
  const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const cardWidth = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(270, stage.width * 0.18));

  const baseX = card.angleCos * (stage.width * card.radiusFactorX);
  const baseY = card.angleSin * (stage.height * card.radiusFactorY);
  const panStrength = stage.isMobile ? 20 : 45;

  const transform = useTransform(
    [z, pointer.x, pointer.y],
    ([currZ, px, py]: number[]) => {
      const offsetX = baseX - px * panStrength;
      const offsetY = baseY - py * panStrength;
      return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
    },
  );

  const Icon = card.item.icon;

  return (
    <motion.div
      style={{
        width: cardWidth,
        transform,
        opacity,
        zIndex: card.index + 1,
      }}
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none"
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/80"
        style={{ background: "linear-gradient(160deg, #17171a 0%, #0c0c0e 55%, #08080a 100%)" }}
      >
        {/* ince ızgara */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {/* iç parlama */}
        <div className="absolute -top-1/4 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full bg-white opacity-[0.12] blur-3xl" />
        {/* simge */}
        <div className="relative flex h-full w-full items-center justify-center p-4 pb-16">
          <Icon className="h-10 w-10 text-chalk" strokeWidth={1.5} />
        </div>
        {/* etiket */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 sm:p-5">
          <span className="block font-mono text-[11px] font-semibold tracking-[0.22em] text-white/95 sm:text-xs">
            {card.item.title}
          </span>
          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.18em] text-white/45 sm:text-[10px]">
            {card.item.sub}
          </span>
        </div>
        <span className="absolute right-3 top-3 font-mono text-[9px] tracking-widest text-white/30">
          {String(card.index + 1).padStart(2, "0")}
        </span>
      </div>
    </motion.div>
  );
}

export default function PerspectiveTunnelHero() {
  const targetRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  const [stage, setStage] = useState<StageDimensions>({
    width: 1440,
    height: 900,
    isMobile: false,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Tünel, yapışkan sahne boyunca kaydırmayla ilerler: tekerlek, dokunmatik
  // ve klavye doğal çalışır; geri kaydırınca koridor tersten akar.
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.0001,
  });

  const pointer = useCameraParallax(!reduce);

  const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.18, 1.6]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.72, 0.95, 1], [1, 1, 0.2, 0]);
  const promptOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);
  const skipOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const skipPointer = useTransform(smoothProgress, [0, 0.25], ["auto", "none"] as const);

  const skip = () => {
    const el = document.getElementById("icerik");
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section ref={targetRef} id="giris" className="relative h-[280svh]">
      <div
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-transparent text-chalk select-none"
        style={{
          perspective: stage.isMobile ? "900px" : "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Okunabilirlik zulası — grille üstünde sol bölge karartması */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_30%_50%,rgba(6,6,7,0.45),transparent_72%)]" />

        {/* Tipografi — sola yaslı, kenar boyunca */}
        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20"
        >
          <div className="max-w-[900px]">
            <h1 className="font-display text-[clamp(4.75rem,14vw,10.5rem)] font-semibold leading-[0.9] tracking-[-0.025em] text-chalk">
              arch<span className="text-void">.</span>
            </h1>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-neutral-400">
              Kaydır — <em className="text-chalk">tünelin içinden geç.</em>
            </p>
          </div>
        </motion.div>

        {/* Kaydırma işareti */}
        <motion.div
          style={{ opacity: promptOpacity }}
          className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400"
        >
          <span>Keşfetmek için kaydır</span>
          <div className="h-6 w-px bg-gradient-to-b from-hi to-transparent" />
        </motion.div>

        {/* Geç butonu — uiverse tarzı hap */}
        <motion.button
          type="button"
          onClick={skip}
          style={{ opacity: skipOpacity, pointerEvents: skipPointer }}
          className="group/skip absolute bottom-8 right-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400 backdrop-blur-md transition-colors duration-300 hover:border-hi/50 hover:text-hi sm:right-12"
        >
          geç
          <ArrowDown
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover/skip:translate-y-0.5"
            strokeWidth={2}
          />
        </motion.button>

        {/* 3B z-düzlemi */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {TUNNEL_CARDS.map((card, i) => (
            <TunnelCard
              key={i}
              card={card}
              progress={smoothProgress}
              pointer={pointer}
              total={TUNNEL_CARDS.length}
              stage={stage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
