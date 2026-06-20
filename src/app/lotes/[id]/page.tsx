'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Lote, LoteEstado } from '@/types';
import { getLote, reservarLote, mensajeDeFallo } from '@/components/lotesApi';
import { EstadoBadge } from '@/components/EstadoBadge';
import { BotonApartar } from '@/components/BotonApartar';
import { MensajeConfirmacion } from '@/components/MensajeConfirmacion';
import { MensajeConflicto } from '@/components/MensajeConflicto';
import { Cargando } from '@/components/Cargando';
import { MensajeError } from '@/components/MensajeError';
import styles from './page.module.css';

type EstadoCarga =
  | { fase: 'cargando' }
  | { fase: 'error'; mensaje: string }
  | { fase: 'noEncontrado' }
  | { fase: 'listo'; lote: Lote };

type Resultado =
  | { tipo: 'exito'; mensaje: string; expiraEn: string }
  | { tipo: 'conflicto'; mensaje: string }
  | { tipo: 'error'; mensaje: string };

// Vista Detalle + Apartar (/lotes/[id]): tras apartar muestra, en la misma
// vista, la confirmación de 45 min (CA-1) o el conflicto (CA-2).
export default function DetalleLotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [carga, setCarga] = useState<EstadoCarga>({ fase: 'cargando' });
  const [reservando, setReservando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Loader del botón "Reintentar".
  const cargar = useCallback(async () => {
    setCarga({ fase: 'cargando' });
    setResultado(null);
    try {
      const lote = await getLote(id);
      setCarga(lote ? { fase: 'listo', lote } : { fase: 'noEncontrado' });
    } catch (err) {
      setCarga({
        fase: 'error',
        mensaje: mensajeDeFallo(err, 'No pudimos cargar el lote. Revisa tu conexión e inténtalo de nuevo.'),
      });
    }
  }, [id]);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const lote = await getLote(id);
        if (activo) setCarga(lote ? { fase: 'listo', lote } : { fase: 'noEncontrado' });
      } catch (err) {
        if (activo) {
          setCarga({
            fase: 'error',
            mensaje: mensajeDeFallo(err, 'No pudimos cargar el lote. Revisa tu conexión e inténtalo de nuevo.'),
          });
        }
      }
    })();
    return () => {
      activo = false;
    };
  }, [id]);

  const apartar = useCallback(async () => {
    setReservando(true);
    setResultado(null);
    try {
      const respuesta = await reservarLote(id);
      if (respuesta.ok) {
        setResultado({ tipo: 'exito', mensaje: respuesta.mensaje, expiraEn: respuesta.expiraEn });
        setCarga((prev) =>
          prev.fase === 'listo'
            ? { fase: 'listo', lote: { ...prev.lote, estado: LoteEstado.RESERVADO } }
            : prev,
        );
      } else {
        setResultado({ tipo: 'conflicto', mensaje: respuesta.error.mensaje });
        setCarga((prev) =>
          prev.fase === 'listo'
            ? { fase: 'listo', lote: { ...prev.lote, estado: LoteEstado.RESERVADO } }
            : prev,
        );
      }
    } catch (err) {
      setResultado({
        tipo: 'error',
        mensaje: mensajeDeFallo(err, 'No pudimos completar el apartado. Inténtalo de nuevo en un momento.'),
      });
    } finally {
      setReservando(false);
    }
  }, [id]);

  return (
    <div className={styles.pagina}>
      <Link href="/" className={styles.volver}>
        ← Volver al catálogo
      </Link>

      {carga.fase === 'cargando' && <Cargando texto="Cargando lote…" />}

      {carga.fase === 'error' && (
        <MensajeError mensaje={carga.mensaje} onReintentar={cargar} />
      )}

      {carga.fase === 'noEncontrado' && (
        <div className={styles.noEncontrado}>
          <h1 className={styles.titulo}>No encontramos este lote</h1>
          <p className={styles.subtitulo}>
            El lote que buscas no existe o ya no está publicado.
          </p>
          <Link href="/" className={styles.enlacePrimario}>
            Ver lotes disponibles
          </Link>
        </div>
      )}

      {carga.fase === 'listo' && (
        <Detalle
          lote={carga.lote}
          reservando={reservando}
          resultado={resultado}
          onApartar={apartar}
        />
      )}
    </div>
  );
}

function Detalle({
  lote,
  reservando,
  resultado,
  onApartar,
}: {
  lote: Lote;
  reservando: boolean;
  resultado: Resultado | null;
  onApartar: () => void;
}) {
  const yaReservado = lote.estado === LoteEstado.RESERVADO;
  const apartadoConExito = resultado?.tipo === 'exito';

  return (
    <article className={styles.tarjeta}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>{lote.material}</h1>
        <EstadoBadge estado={lote.estado} />
      </header>

      <dl className={styles.datos}>
        <div className={styles.dato}>
          <dt className={styles.etiqueta}>Cantidad disponible</dt>
          <dd className={styles.valor}>{lote.cantidadKg} kg</dd>
        </div>
        <div className={styles.dato}>
          <dt className={styles.etiqueta}>Ubicación</dt>
          <dd className={styles.valor}>{lote.ubicacion}</dd>
        </div>
      </dl>

      <section className={styles.accion} aria-live="polite">
        {/* CA-1 */}
        {resultado?.tipo === 'exito' && (
          <MensajeConfirmacion mensaje={resultado.mensaje} expiraEn={resultado.expiraEn} />
        )}

        {/* CA-2 */}
        {resultado?.tipo === 'conflicto' && <MensajeConflicto mensaje={resultado.mensaje} />}

        {resultado?.tipo === 'error' && (
          <MensajeError mensaje={resultado.mensaje} onReintentar={onApartar} />
        )}

        {!apartadoConExito && !yaReservado && (
          <BotonApartar onClick={onApartar} cargando={reservando} />
        )}

        {/* Lote ya reservado al cargar la página */}
        {!resultado && yaReservado && (
          <MensajeConflicto mensaje="El lote fue reservado por otro usuario. Busca lotes alternativos." />
        )}
      </section>
    </article>
  );
}
