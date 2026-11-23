import { useState } from 'react';
import Boto from './Boto';
import Missatge from './Missatge';

const MAX_CARACTERS = 80;

export default function FormulariTasca({ onAfegir }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  function canviaText(e) {
    setText(e.target.value);
    if (error) {
      setError('');
    }
  }

  function envia(e) {
    e.preventDefault();

    const net = text.trim();
    if (!net) {
      setError("Escriu una tasca abans d'afegir-la.");
      return;
    }

    onAfegir(net);
    setText('');
    setError('');
  }

  return (
    <form onSubmit={envia} noValidate className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="tasca" className="text-sm font-medium text-slate-700">
          Nova tasca
        </label>
        <span id="comptador-caracters" className="text-xs text-slate-500">
          {text.length}/{MAX_CARACTERS}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="tasca"
          type="text"
          value={text}
          maxLength={MAX_CARACTERS}
          autoComplete="off"
          placeholder="Ex: Repassar props i estat..."
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'error-tasca comptador-caracters' : 'comptador-caracters'}
          onChange={canviaText}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />

        <Boto
          type="submit"
          variant="primari"
          disabled={text.trim().length === 0}
          className="w-full sm:w-auto"
        >
          Afegeix
        </Boto>
      </div>

      {error && (
        <div id="error-tasca">
          <Missatge text={error} tipus="error" />
        </div>
      )}
    </form>
  );
}