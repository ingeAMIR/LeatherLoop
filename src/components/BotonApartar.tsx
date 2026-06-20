'use client';

import styles from './BotonApartar.module.css';

interface BotonApartarProps {
  onClick: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
}

// Botón "Apartar" — CA-3: ≥48×48px, alto contraste, con estado de carga.
export function BotonApartar({ onClick, cargando = false, deshabilitado = false }: BotonApartarProps) {
  const inactivo = cargando || deshabilitado;

  return (
    <button
      type="button"
      className={styles.boton}
      onClick={onClick}
      disabled={inactivo}
      aria-busy={cargando}
      aria-label={cargando ? 'Apartando el lote, espera un momento' : 'Apartar este lote'}
    >
      {cargando ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          Apartando…
        </>
      ) : (
        'Apartar este lote'
      )}
    </button>
  );
}
