export default function Button({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) {
  const base = 'font-bold rounded transition-all duration-100 cursor-pointer border select-none';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-sm',
  };
  const variants = {
    primary: 'bg-zelda-ink text-white border-zelda-ink hover:bg-zelda-green active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
    secondary: 'bg-white text-zelda-ink border-zelda-border hover:border-zelda-ink active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
    danger: 'bg-zelda-red text-white border-zelda-red hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-zelda-ink border-zelda-border hover:border-zelda-ink active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
