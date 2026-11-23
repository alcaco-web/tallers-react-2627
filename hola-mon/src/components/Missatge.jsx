const ESTILS_TIPUS = {
  info: 'bg-slate-100 text-slate-700 border-slate-300',
  exit: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  error: 'bg-red-50 text-red-800 border-red-300',
};

export default function Missatge({ text, tipus = 'info' }) {
  const classesTipus = ESTILS_TIPUS[tipus] ?? ESTILS_TIPUS.info;

  return (
    <p
      role="status"
      className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${classesTipus}`}
    >
      {text}
    </p>
  );
}