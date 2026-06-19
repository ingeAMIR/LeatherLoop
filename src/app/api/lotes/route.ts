import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { Lote, LoteEstado } from '../../../types';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('id, material, cantidad_kg, ubicacion, estado')
      .order('creado_en', { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          error: {
            codigo: 'DATABASE_ERROR',
            mensaje: error.message || 'Error al obtener los lotes de la base de datos.'
          }
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json([], { status: 200 });
    }

    // Mapear respuesta de base de datos a camelCase contract
    const lotes: Lote[] = data.map((lote) => ({
      id: lote.id,
      material: lote.material,
      cantidadKg: Number(lote.cantidad_kg),
      ubicacion: lote.ubicacion,
      estado: lote.estado as LoteEstado
    }));

    return NextResponse.json(lotes, { status: 200 });
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar la solicitud.';
    return NextResponse.json(
      {
        error: {
          codigo: 'ERROR_INTERNO',
          mensaje
        }
      },
      { status: 500 }
    );
  }
}
