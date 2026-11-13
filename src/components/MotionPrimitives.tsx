import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface HighlightTextProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'amber' | 'coral' | 'teal';
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  children,
  variant = 'cyan',
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const colorMap = {
    cyan: 'from-sky-400/35 to-cyan-300/20 border-sky-400 text-sky-300',
    amber: 'from-amber-400/35 to-yellow-300/20 border-amber-400 text-amber-300',
    coral: 'from-[#D94E34]/30 to-orange-400/20 border-[#D94E34] text-[#B8321A]',
    teal: 'from-[#0F766E]/25 to-emerald-500/15 border-[#0F766E] text-[#0F5E57]',
  };

  return (
    <span ref={ref} className={`relative inline-block px-1.5 font-bold ${className}`}>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ originX: 0 }}
        className={`absolute inset-x-0 bottom-0.5 h-[38%] -z-0 rounded-sm bg-gradient-to-r ${colorMap[variant]}`}
      />
      <motion.span
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        style={{ originX: 0 }}
        className={`absolute inset-x-0 bottom-0 h-[2.5px] border-b-2 ${
          variant === 'cyan'
            ? 'border-sky-400'
            : variant === 'amber'
            ? 'border-amber-400'
            : variant === 'coral'
            ? 'border-[#D94E34]'
            : 'border-[#0F766E]'
        }`}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
};

interface AnimatedNumberProps {
  target: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  target,
  suffix = '',
  prefix = '',
  durationMs = 1200,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start: number | null = null;
    let rafId = 0;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, target, durationMs]);

  return (
    <span ref={ref} className="tabular-nums font-display font-extrabold">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

interface RevealBlockProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const RevealBlock: React.FC<RevealBlockProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  darkSurface?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  darkSurface = true,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 text-center ${
          darkSurface
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300'
            : 'bg-gradient-to-br from-[#DED5C0] to-[#CFC3AA] text-[#123738]'
        } ${className}`}
      >
        <ShieldCheck className="w-8 h-8 mb-2 opacity-60" />
        <span className="text-sm font-semibold">{fallbackTitle || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
