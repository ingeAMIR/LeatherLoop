import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { Lote, LoteEstado } from '../../../../types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: {
            codigo: 'ID_REQUERIDO',
            mensaje: 'El identificador del lote es requerido.'
          }
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('lotes')
      .select('id, material, cantidad_kg, ubicacion, estado')
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 es el código de error de Supabase/PostgREST cuando no hay filas devueltas para .single()
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: {
              codigo: 'LOTE_NO_ENCONTRADO',
              mensaje: 'El lote solicitado no existe.'
            }
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          error: {
            codigo: 'DATABASE_ERROR',
            mensaje: error.message || 'Error al obtener el detalle del lote.'
          }
        },
        { status: 500 }
      );
    }

    const lote: Lote = {
      id: data.id,
      material: data.material,
      cantidadKg: Number(data.cantidad_kg),
      ubicacion: data.ubicacion,
      estado: data.estado as LoteEstado
    };

    return NextResponse.json(lote, { status: 200 });
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
