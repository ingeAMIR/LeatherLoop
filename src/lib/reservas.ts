import { supabase } from './supabase';
import { ReservarResponse } from '@/types';

export async function reservarLote(loteId: string, usuarioId: string): Promise<ReservarResponse> {
  if (!loteId || !usuarioId) {
    return {
      ok: false,
      error: {
        codigo: 'DATOS_INVALIDOS',
        mensaje: 'El identificador del lote y del usuario son requeridos.'
      }
    };
  }

  try {
    const { data, error } = await supabase.rpc('reservar_lote', {
      p_lote_id: loteId,
      p_usuario_id: usuarioId,
    });

    if (error) {
      return {
        ok: false,
        error: {
          codigo: 'DATABASE_ERROR',
          mensaje: error.message || 'Error al comunicarse con la base de datos.'
        }
      };
    }

    return data as ReservarResponse;
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar la reserva.';
    return {
      ok: false,
      error: {
        codigo: 'ERROR_INTERNO',
        mensaje
      }
    };
  }
}
