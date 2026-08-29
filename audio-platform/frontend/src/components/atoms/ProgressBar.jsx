const SEGMENTS = 28;

export const ProgressBar = ({ progress = 0 }) => {
  const filled = Math.round((progress / 100) * SEGMENTS);
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-[3px]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className={`h-3 flex-1 rounded-[1px] ${
              i < filled ? 'bg-amber' : 'border border-ink-line bg-ink-raised'
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-xs tabular-nums text-paper-dim">{progress}%</span>
    </div>
  );
};
