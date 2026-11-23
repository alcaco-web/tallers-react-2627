import { useState } from 'react';
import Targeta from './components/Targeta';
import Comptador from './components/Comptador';
import FormulariTasca from './components/FormulariTasca';
import FiltreTasques from './components/FiltreTasques';
import LlistaTasques from './components/LlistaTasques';
import Boto from './components/Boto';

export default function App() {
  // Estat del Comptador (Fitxa 02)
  const [count, setCount] = useState(0);

  // Estat de Tasques i Filtre (Fitxa 03)
  const [tasques, setTasques] = useState([]);
  const [filtre, setFiltre] = useState('totes');

  // Handlers del Comptador
  function canvia(delta) {
    setCount((anterior) => anterior + delta);
  }

  function reinicia() {
    setCount(0);
  }

  function duplica() {
    setCount((anterior) => anterior * 2);
  }

  let missatgeComptador = 'Encara no has començat.';
  let tipusComptador = 'info';

  if (count > 0) {
    missatgeComptador = 'Vas per bon camí!';
    tipusComptador = 'exit';
  } else if (count < 0) {
    missatgeComptador = 'Compte, vas enrere!';
    tipusComptador = 'error';
  }

  // Handlers de Tasques (sempre creant arrays i objectes nous)
  function afegeixTasca(textNet) {
    const novaTasca = {
      id: crypto.randomUUID(),
      text: textNet,
      feta: false,
    };

    setTasques((anteriors) => [...anteriors, novaTasca]);
  }

  function toggleTasca(id) {
    setTasques((anteriors) =>
      anteriors.map((tasca) =>
        tasca.id === id ? { ...tasca, feta: !tasca.feta } : tasca
      )
    );
  }

  function eliminaTasca(id) {
    setTasques((anteriors) => anteriors.filter((tasca) => tasca.id !== id));
  }

  function marcaTotesComAFetes() {
    setTasques((anteriors) =>
      anteriors.map((tasca) => ({ ...tasca, feta: true }))
    );
  }

  function netejaLesFetes() {
    setTasques((anteriors) => anteriors.filter((tasca) => !tasca.feta));
  }

  // Estat derivat: llista filtrada, comptadors i missatge buit
  const tasquesFiltrades = tasques.filter((tasca) => {
    if (filtre === 'pendents') return !tasca.feta;
    if (filtre === 'fetes') return tasca.feta;
    return true;
  });

  const totalTasques = tasques.length;
  const pendents = tasques.filter((tasca) => !tasca.feta).length;
  const fetes = totalTasques - pendents;

  let missatgeBuit = 'Encara no hi ha tasques. Afegeix-ne una.';
  if (tasques.length > 0 && filtre === 'pendents') {
    missatgeBuit = 'No hi ha tasques pendents. Bona feina!';
  } else if (tasques.length > 0 && filtre === 'fetes') {
    missatgeBuit = 'Encara no has marcat cap tasca com a feta.';
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Hola món!</h1>

        <Targeta titol="Comptador">
          <Comptador
            valor={count}
            missatge={missatgeComptador}
            tipus={tipusComptador}
            pas={1}
            onCanvia={canvia}
            onReinicia={reinicia}
            onDuplica={duplica}
          />
        </Targeta>

        <Targeta titol="Tasques">
          <div className="space-y-4">
            <FormulariTasca onAfegir={afegeixTasca} />

            <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-200 py-2.5 text-sm text-slate-600">
              <span>
                Total: <strong className="text-slate-900">{totalTasques}</strong>
              </span>
              <span>
                Pendents: <strong className="text-slate-900">{pendents}</strong>
              </span>
              <span>
                Fetes: <strong className="text-slate-900">{fetes}</strong>
              </span>
            </div>

            <FiltreTasques filtre={filtre} onCanviaFiltre={setFiltre} />

            <LlistaTasques
              tasques={tasquesFiltrades}
              missatgeBuit={missatgeBuit}
              onToggle={toggleTasca}
              onElimina={eliminaTasca}
            />

            {totalTasques > 0 && (
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Boto
                  variant="secundari"
                  mida="sm"
                  disabled={pendents === 0}
                  onClick={marcaTotesComAFetes}
                >
                  Marca totes com a fetes
                </Boto>
                <Boto
                  variant="perill"
                  mida="sm"
                  disabled={fetes === 0}
                  onClick={netejaLesFetes}
                >
                  Neteja les fetes
                </Boto>
              </div>
            )}
          </div>
        </Targeta>
      </div>
    </main>
  );
}