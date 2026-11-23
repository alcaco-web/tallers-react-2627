import Boto from './Boto';

export default function Tasca({ tasca, onToggle, onElimina }) {
  const inputId = `tasca-${tasca.id}`;

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <input
          id={inputId}
          type="checkbox"
          checked={tasca.feta}
          onChange={() => onToggle(tasca.id)}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
        <label
          htmlFor={inputId}
          className={
            tasca.feta
              ? 'cursor-pointer break-words text-sm text-slate-400 line-through'
              : 'cursor-pointer break-words text-sm text-slate-800'
          }
        >
          {tasca.text}
        </label>
      </div>

      <Boto
        variant="perill"
        mida="sm"
        aria-label={`Elimina la tasca: ${tasca.text}`}
        onClick={() => onElimina(tasca.id)}
      >
        Elimina
      </Boto>
    </li>
  );
}