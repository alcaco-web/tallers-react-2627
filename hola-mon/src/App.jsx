import { useState } from 'react';
import Targeta from './components/Targeta';
import Comptador from './components/Comptador';

export default function App() {
  const [count, setCount] = useState(0);

  function canvia(delta) {
    setCount((anterior) => anterior + delta);
  }

  function reinicia() {
    setCount(0);
  }

  function duplica() {
    setCount((anterior) => anterior * 2);
  }

  let missatge = 'Encara no has començat.';
  let tipus = 'info';

  if (count > 0) {
    missatge = 'Vas per bon camí!';
    tipus = 'exit';
  } else if (count < 0) {
    missatge = 'Compte, vas enrere!';
    tipus = 'error';
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Hola món!</h1>

        <Targeta titol="Comptador">
          <Comptador
            valor={count}
            missatge={missatge}
            tipus={tipus}
            pas={1}
            onCanvia={canvia}
            onReinicia={reinicia}
            onDuplica={duplica}
          />
        </Targeta>
      </div>
    </main>
  );
}