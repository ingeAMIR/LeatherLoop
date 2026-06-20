import { LoteEstado } from '@/types';
import styles from './EstadoBadge.module.css';

// Estado del lote con texto explícito (no depende solo del color).
export function EstadoBadge({ estado }: { estado: LoteEstado }) {
  const disponible = estado === LoteEstado.DISPONIBLE;
  const clase = disponible ? styles.disponible : styles.reservado;
  const texto = disponible ? 'Disponible' : 'Reservado';

  return (
    <span className={`${styles.badge} ${clase}`}>
      <span aria-hidden="true" className={styles.punto} />
      {texto}
    </span>
  );
}
