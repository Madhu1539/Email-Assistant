// Reusable Button component with variants and loading state
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f14] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20',
    secondary:
      'bg-[#22222e] hover:bg-[#2a2a38] active:bg-[#1a1a24] text-[#f0f0f8] border border-[#2a2a38]',
    danger:
      'bg-red-600/10 hover:bg-red-600/20 active:bg-red-600/30 text-red-400 border border-red-600/20',
    ghost:
      'bg-transparent hover:bg-[#22222e] active:bg-[#2a2a38] text-[#9898b0] hover:text-[#f0f0f8]',
    outline:
      'bg-transparent border border-indigo-500/50 text-indigo-400 hover:bg-indigo-600/10 hover:border-indigo-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

function Spinner({ size = 'sm' }) {
  const s = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <svg
      className={`${s} animate-spin text-current`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
