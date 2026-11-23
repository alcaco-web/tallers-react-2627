import Missatge from './Missatge';
import Tasca from './Tasca';

export default function LlistaTasques({ tasques, missatgeBuit, onToggle, onElimina }) {
  if (tasques.length === 0) {
    return <Missatge text={missatgeBuit} tipus="info" />;
  }

  return (
    <ul className="space-y-2">
      {tasques.map((tasca) => (
        <Tasca
          key={tasca.id}
          tasca={tasca}
          onToggle={onToggle}
          onElimina={onElimina}
        />
      ))}
    </ul>
  );
}