import Boto from './Boto';

const FILTRES = [
  { id: 'totes', etiqueta: 'Totes' },
  { id: 'pendents', etiqueta: 'Pendents' },
  { id: 'fetes', etiqueta: 'Fetes' },
];

export default function FiltreTasques({ filtre, onCanviaFiltre }) {
  return (
    <div
      role="group"
      aria-label="Filtrar tasques"
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
    >
      {FILTRES.map(({ id, etiqueta }) => {
        const esActiu = filtre === id;

        return (
          <Boto
            key={id}
            variant={esActiu ? 'primari' : 'secundari'}
            mida="sm"
            aria-pressed={esActiu}
            className="w-full sm:w-auto"
            onClick={() => onCanviaFiltre(id)}
          >
            {etiqueta}
          </Boto>
        );
      })}
    </div>
  );
}