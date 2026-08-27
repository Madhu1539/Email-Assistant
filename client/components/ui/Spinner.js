export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizes[size]} rounded-full border-[#2a2a38] border-t-indigo-500 animate-spin ${className}`}
    />
  );
}
