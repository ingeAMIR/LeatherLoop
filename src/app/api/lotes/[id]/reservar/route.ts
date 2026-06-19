import { NextRequest, NextResponse } from 'next/server';
import { reservarLote } from '../../../../../lib/reservas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'Cuerpo de petición JSON inválido.'
          }
        },
        { status: 400 }
      );
    }

    const { usuarioId } = body;

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            codigo: 'ID_REQUERIDO',
            mensaje: 'El identificador del lote es requerido.'
          }
        },
        { status: 400 }
      );
    }

    if (!usuarioId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            codigo: 'USUARIO_REQUERIDO',
            mensaje: 'El identificador del usuario es requerido.'
          }
        },
        { status: 400 }
      );
    }

    const resultado = await reservarLote(id, usuarioId);

    if (!resultado.ok) {
      if (resultado.error.codigo === 'LOTE_NO_DISPONIBLE') {
        return NextResponse.json(resultado, { status: 409 });
      }
      return NextResponse.json(resultado, { status: 500 });
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : 'Ocurrió un error inesperado al reservar el lote.';
    return NextResponse.json(
      {
        ok: false,
        error: {
          codigo: 'ERROR_INTERNO',
          mensaje
        }
      },
      { status: 500 }
    );
  }
}
