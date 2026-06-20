import Link from 'next/link';
import { Lote, LoteEstado } from '@/types';
import { EstadoBadge } from './EstadoBadge';
import styles from './LoteCard.module.css';

export function LoteCard({ lote }: { lote: Lote }) {
  const disponible = lote.estado === LoteEstado.DISPONIBLE;

  return (
    <Link
      href={`/lotes/${lote.id}`}
      className={styles.card}
      aria-label={`Ver detalle del lote: ${lote.material}, ${lote.cantidadKg} kilogramos, ${lote.ubicacion}. Estado: ${disponible ? 'disponible' : 'reservado'}.`}
    >
      <div className={styles.encabezado}>
        <h2 className={styles.material}>{lote.material}</h2>
        <EstadoBadge estado={lote.estado} />
      </div>

      <dl className={styles.datos}>
        <div className={styles.dato}>
          <dt className={styles.etiqueta}>Cantidad</dt>
          <dd className={styles.valor}>{lote.cantidadKg} kg</dd>
        </div>
        <div className={styles.dato}>
          <dt className={styles.etiqueta}>Ubicación</dt>
          <dd className={styles.valor}>{lote.ubicacion}</dd>
        </div>
      </dl>

      <span className={styles.cta} aria-hidden="true">
        Ver detalle →
      </span>
    </Link>
  );
}
