import { useEffect, useRef } from 'react';

const AMP = { idle: 0.14, processing: 0.52, clean: 0.22 };
const FREQ = { idle: 2.1, processing: 3.2, clean: 4.5 };
const COLOR = { idle: '#E8A33D', processing: '#E8A33D', clean: '#58B08C' };
const ALPHA = { idle: 0.55, processing: 1, clean: 1 };

export const Waveform = ({ mode = 'idle', height = 88, label, className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;

    const draw = (t = 0) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0) return;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const bars = Math.max(24, Math.floor(w / 9));
      const bw = w / bars;
      const mid = h / 2;
      const color = COLOR[mode];
      const amp = AMP[mode];
      const freq = FREQ[mode];
      ctx.fillStyle = color;
      ctx.globalAlpha = ALPHA[mode];

      for (let i = 0; i < bars; i++) {
        const x = i / bars;
        const noise =
          Math.sin(i * freq + t) * 0.5 + Math.sin(i * 7.7 + t * 0.55) * 0.5;
        let env;
        if (mode === 'processing') {
          const pulse = Math.sin(t * 0.9) * 0.35 + 0.65;
          env = (0.45 + 0.55 * Math.abs(noise)) * pulse;
        } else {
          env = amp * (0.5 + 0.5 * Math.abs(noise));
          if (mode === 'clean') env *= Math.sin(Math.PI * x);
        }
        const bh = Math.max(2, env * (h - 6));
        const r = Math.min(2, bw / 2);
        const cx = x * w + bw * 0.5;
        ctx.beginPath();
        ctx.roundRect(cx - r, mid - bh / 2, r * 2, bh, r);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(() => draw(performance.now() / 1000));
    };

    draw();
    if (!reduced) raf = requestAnimationFrame(() => draw(performance.now() / 1000));

    return () => cancelAnimationFrame(raf);
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      style={{ height }}
      className={`w-full ${className}`}
    />
  );
};
