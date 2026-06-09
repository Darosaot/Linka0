export default function Button({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) {
  const base = 'font-bold rounded transition-all duration-150 cursor-pointer border-2 select-none';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };
  const variants = {
    primary: 'bg-zelda-gold text-zelda-darkgreen border-yellow-600 hover:bg-yellow-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-yellow-400/30',
    secondary: 'bg-zelda-green text-zelda-gold border-zelda-gold hover:bg-green-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
    danger: 'bg-zelda-red text-white border-red-700 hover:bg-red-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-zelda-gold border-zelda-gold hover:bg-zelda-green active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
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
