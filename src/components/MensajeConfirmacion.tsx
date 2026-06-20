'use client';

import { useEffect, useState } from 'react';
import styles from './MensajeConfirmacion.module.css';

interface MensajeConfirmacionProps {
  mensaje: string; // texto exacto del contrato (CA-1)
  expiraEn: string; // ISO: reservado_en + 45 min
}

function calcularRestanteMs(expiraEn: string): number {
  return Math.max(0, new Date(expiraEn).getTime() - Date.now());
}

function formatear(ms: number): string {
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

// Confirmación (CA-1) con temporizador local de la garantía de 45 min.
export function MensajeConfirmacion({ mensaje, expiraEn }: MensajeConfirmacionProps) {
  const [restanteMs, setRestanteMs] = useState(() => calcularRestanteMs(expiraEn));

  useEffect(() => {
    const id = setInterval(() => {
      setRestanteMs(calcularRestanteMs(expiraEn));
    }, 1000);
    return () => clearInterval(id);
  }, [expiraEn]);

  const expirado = restanteMs <= 0;

  return (
    <div className={styles.contenedor} role="status" aria-live="polite">
      <div className={styles.encabezado}>
        <span className={styles.icono} aria-hidden="true">
          ✓
        </span>
        <p className={styles.mensaje}>{mensaje}</p>
      </div>

      {expirado ? (
        <p className={styles.expirado}>
          El tiempo garantizado terminó. Si aún no recoges el lote, vuelve a
          consultarlo en el catálogo.
        </p>
      ) : (
        <div className={styles.temporizador}>
          <span className={styles.temporizadorEtiqueta}>Tiempo garantizado restante</span>
          <span className={styles.cuenta} aria-label={`Quedan ${formatear(restanteMs)} minutos`}>
            {formatear(restanteMs)}
          </span>
        </div>
      )}
    </div>
  );
}
