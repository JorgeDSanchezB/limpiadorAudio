const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold uppercase tracking-[0.14em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50';

const sizes = {
  md: 'px-5 py-3 text-sm',
  sm: 'px-3 py-1.5 text-xs',
};

const variants = {
  primary: 'bg-amber text-ink hover:bg-amber-deep',
  ghost: 'border border-ink-line bg-ink-panel text-paper hover:border-amber/60 hover:text-amber',
  danger: 'border border-danger/50 bg-ink-panel text-danger hover:bg-danger/10 hover:border-danger',
};

export const Button = ({ variant = 'primary', size = 'md', className = '', href, ...props }) => {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  if (href) return <a href={href} className={classes} {...props} />;
  return <button className={classes} {...props} />;
};
