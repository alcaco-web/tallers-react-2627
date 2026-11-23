const VARIANTS = {
  primari: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secundari: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus-visible:ring-slate-400',
  perill: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
};

const MIDES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
};

export default function Boto({
  children,
  variant = 'primari',
  mida = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const classesBase =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const classesVariant = VARIANTS[variant] ?? VARIANTS.primari;
  const classesMida = MIDES[mida] ?? MIDES.md;

  return (
    <button
      type={type}
      className={`${classesBase} ${classesMida} ${classesVariant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}