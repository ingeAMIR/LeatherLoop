import styles from './Cargando.module.css';

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className={styles.contenedor} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.texto}>{texto}</span>
    </div>
  );
}
