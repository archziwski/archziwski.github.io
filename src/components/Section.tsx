import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({
  index,
  eyebrow,
  title,
  sub,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <Reveal className="mb-12 sm:mb-16">
      <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-hi">
        <span className="text-neutral-600">{index}</span>
        <span className="h-px w-7 bg-hi/40" aria-hidden />
        {eyebrow}
      </p>
      <h2 className="font-display text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.015em] text-chalk sm:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-neutral-400">{sub}</p>
      )}
    </Reveal>
  );
}
