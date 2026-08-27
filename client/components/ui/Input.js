// Reusable Input component with label, error, and helper text support
export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#9898b0]"
        >
          {label}
          {required && <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        aria-invalid={!!error}
        className={`
          w-full px-4 py-2.5 rounded-lg text-sm
          bg-[#1a1a24] border text-[#f0f0f8] placeholder-[#60607a]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-red-500/50 focus:ring-red-500'
            : 'border-[#2a2a38] hover:border-[#3a3a50]'}
        `}
        {...props}
      />

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-[#60607a]">
          {helperText}
        </p>
      )}
    </div>
  );
}
