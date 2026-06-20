// Capa de datos del frontend: consume los contratos de la sección 5 del plan.
// Con NEXT_PUBLIC_USE_MOCK=true responde con datos simulados (sin Supabase).

import { Lote, LoteEstado, ReservarResponse } from '@/types';

/** Identificador fijo simulado del usuario (no hay autenticación real). */
export const USUARIO_ID = 'artesano-demo-001';

export function mensajeDeFallo(err: unknown, porDefecto: string): string {
  return err instanceof Error ? err.message : porDefecto;
}

export const MINUTOS_GARANTIZADOS = 45;

const USAR_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Datos simulados: espejo en memoria del seed (supabase/seed.sql).
const mockLotes: Lote[] = [
  { id: 'lote-001', material: 'Retal de cuero vacuno napa', cantidadKg: 12.5, ubicacion: 'Zona Piel Verde, León', estado: LoteEstado.DISPONIBLE },
  { id: 'lote-002', material: 'Recorte de forro de cerdo', cantidadKg: 8.2, ubicacion: 'Colonia Coecillo, León', estado: LoteEstado.DISPONIBLE },
  { id: 'lote-003', material: 'Carnaza gruesa curtida', cantidadKg: 25.0, ubicacion: 'San Jerónimo, León', estado: LoteEstado.DISPONIBLE },
  { id: 'lote-004', material: 'Pedacería de charol negro', cantidadKg: 5.8, ubicacion: 'Colonia Industrial, León', estado: LoteEstado.DISPONIBLE },
  { id: 'lote-005', material: 'Cuero de cabra para calzado', cantidadKg: 14.1, ubicacion: 'Fraccionamiento Guadalupe, León', estado: LoteEstado.RESERVADO },
];

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockGetLotes(): Promise<Lote[]> {
  await esperar(300);
  return mockLotes.map((l) => ({ ...l }));
}

async function mockGetLote(id: string): Promise<Lote | null> {
  await esperar(250);
  const lote = mockLotes.find((l) => l.id === id);
  return lote ? { ...lote } : null;
}

async function mockReservar(id: string): Promise<ReservarResponse> {
  await esperar(400);
  const lote = mockLotes.find((l) => l.id === id);

  if (!lote) {
    return {
      ok: false,
      error: { codigo: 'LOTE_NO_ENCONTRADO', mensaje: 'El lote solicitado no existe.' },
    };
  }

  if (lote.estado === LoteEstado.RESERVADO) {
    return {
      ok: false,
      error: {
        codigo: 'LOTE_NO_DISPONIBLE',
        mensaje: 'El lote fue reservado por otro usuario. Busca lotes alternativos.',
      },
    };
  }

  lote.estado = LoteEstado.RESERVADO;
  const expiraEn = new Date(Date.now() + MINUTOS_GARANTIZADOS * 60_000).toISOString();
  return {
    ok: true,
    loteId: lote.id,
    estado: LoteEstado.RESERVADO,
    minutosGarantizados: MINUTOS_GARANTIZADOS,
    expiraEn,
    mensaje: 'Tu lote está apartado. Tienes 45 minutos garantizados.',
  };
}

interface ApiError {
  error?: { codigo?: string; mensaje?: string };
}

async function mensajeDeError(res: Response, porDefecto: string): Promise<string> {
  try {
    const cuerpo: ApiError = await res.json();
    return cuerpo?.error?.mensaje ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

export async function getLotes(): Promise<Lote[]> {
  if (USAR_MOCK) return mockGetLotes();

  const res = await fetch('/api/lotes', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      await mensajeDeError(res, 'No pudimos cargar los lotes. Revisa tu conexión e inténtalo de nuevo.'),
    );
  }
  return (await res.json()) as Lote[];
}

/** Devuelve null si el lote no existe (404). */
export async function getLote(id: string): Promise<Lote | null> {
  if (USAR_MOCK) return mockGetLote(id);

  const res = await fetch(`/api/lotes/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(
      await mensajeDeError(res, 'No pudimos cargar el lote. Revisa tu conexión e inténtalo de nuevo.'),
    );
  }
  return (await res.json()) as Lote;
}

export async function reservarLote(id: string): Promise<ReservarResponse> {
  if (USAR_MOCK) return mockReservar(id);

  const res = await fetch(`/api/lotes/${id}/reservar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuarioId: USUARIO_ID }),
  });

  // 200 (éxito) y 409 (conflicto) traen un cuerpo ReservarResponse válido.
  if (res.ok || res.status === 409) {
    return (await res.json()) as ReservarResponse;
  }

  throw new Error(
    await mensajeDeError(res, 'No pudimos completar el apartado. Inténtalo de nuevo en un momento.'),
  );
}
