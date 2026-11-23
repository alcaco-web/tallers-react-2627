export default function Targeta({ titol, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {titol && (
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          {titol}
        </h2>
      )}
      {children}
    </section>
  );
}