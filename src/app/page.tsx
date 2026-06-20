'use client';

import { useCallback, useEffect, useState } from 'react';
import { Lote } from '@/types';
import { getLotes, mensajeDeFallo } from '@/components/lotesApi';
import { LoteCard } from '@/components/LoteCard';
import { Cargando } from '@/components/Cargando';
import { MensajeError } from '@/components/MensajeError';
import styles from './page.module.css';

type Estado =
  | { fase: 'cargando' }
  | { fase: 'error'; mensaje: string }
  | { fase: 'listo'; lotes: Lote[] };

// Vista Catálogo (/): lista los lotes desde GET /api/lotes con estados
// de carga, error y vacío.
export default function CatalogoPage() {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' });

  // Loader del botón "Reintentar".
  const cargar = useCallback(async () => {
    setEstado({ fase: 'cargando' });
    try {
      const lotes = await getLotes();
      setEstado({ fase: 'listo', lotes });
    } catch (err) {
      setEstado({
        fase: 'error',
        mensaje: mensajeDeFallo(err, 'No pudimos cargar los lotes. Revisa tu conexión e inténtalo de nuevo.'),
      });
    }
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const lotes = await getLotes();
        if (activo) setEstado({ fase: 'listo', lotes });
      } catch (err) {
        if (activo) {
          setEstado({
            fase: 'error',
            mensaje: mensajeDeFallo(err, 'No pudimos cargar los lotes. Revisa tu conexión e inténtalo de nuevo.'),
          });
        }
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Lotes de merma disponibles</h1>
        <p className={styles.subtitulo}>
          Aparta un lote y recógelo con la certeza de que es tuyo. Economía
          circular del cuero en León (ODS 12).
        </p>
      </header>

      <main className={styles.contenido}>
        {estado.fase === 'cargando' && <Cargando texto="Cargando lotes…" />}

        {estado.fase === 'error' && (
          <MensajeError mensaje={estado.mensaje} onReintentar={cargar} />
        )}

        {estado.fase === 'listo' && estado.lotes.length === 0 && (
          <p className={styles.vacio}>
            Por ahora no hay lotes publicados. Vuelve a consultar más tarde.
          </p>
        )}

        {estado.fase === 'listo' && estado.lotes.length > 0 && (
          <ul className={styles.lista}>
            {estado.lotes.map((lote) => (
              <li key={lote.id}>
                <LoteCard lote={lote} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
