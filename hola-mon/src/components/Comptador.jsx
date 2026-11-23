import Boto from './Boto';
import Missatge from './Missatge';

const ACCIONS = [
  { id: 'incrementa', text: 'Incrementa', variant: 'primari' },
  { id: 'decrementa', text: 'Decrementa', variant: 'secundari' },
  { id: 'reinicia', text: 'Reinicia', variant: 'perill' },
  { id: 'duplica', text: 'Duplica', variant: 'secundari' }, // Repte opcional
];

export default function Comptador({
  valor,
  missatge,
  tipus = 'info',
  pas = 1,
  onCanvia,
  onReinicia,
  onDuplica,
}) {
  function executaAccio(id) {
    if (id === 'incrementa') {
      onCanvia(pas);
    } else if (id === 'decrementa') {
      onCanvia(-pas);
    } else if (id === 'reinicia') {
      onReinicia();
    } else if (id === 'duplica' && onDuplica) {
      onDuplica();
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-lg text-slate-700">
        Has fet clic <span className="font-bold text-slate-900">{valor}</span> vegades.
      </p>

      <Missatge text={missatge} tipus={tipus} />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {ACCIONS.map((accio) => {
          const estaDesactivat = accio.id === 'reinicia' && valor === 0;

          return (
            <Boto
              key={accio.id}
              variant={accio.variant}
              disabled={estaDesactivat}
              className="w-full sm:w-auto"
              onClick={() => executaAccio(accio.id)}
            >
              {accio.text}
            </Boto>
          );
        })}
      </div>
    </div>
  );
}