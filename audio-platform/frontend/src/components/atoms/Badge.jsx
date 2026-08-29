const tones = {
  amber: 'text-amber',
  signal: 'text-signal',
  danger: 'text-danger',
};

const dots = {
  amber: 'bg-amber',
  signal: 'bg-signal',
  danger: 'bg-danger',
};

export const Badge = ({ tone = 'amber', children }) => (
  <span
    className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] ${tones[tone]}`}
  >
    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
    {children}
  </span>
);
