import { reservarLote } from '../src/lib/reservas';
import { supabase } from '../src/lib/supabase';
import { LoteEstado } from '../src/types';

// Mock de la base de datos Supabase
jest.mock('../src/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe('Lógica de Reserva Atómica (reservarLote)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe reservar un lote disponible exitosamente (CA-1)', async () => {
    const mockFechaExpira = '2026-06-19T18:45:00Z';
    const mockResponse = {
      ok: true,
      loteId: 'lote-001',
      estado: LoteEstado.RESERVADO,
      minutosGarantizados: 45,
      expiraEn: mockFechaExpira,
      mensaje: 'Tu lote está apartado. Tienes 45 minutos garantizados.'
    };

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: mockResponse,
      error: null,
    });

    const res = await reservarLote('lote-001', 'artesano-demo-001');

    expect(supabase.rpc).toHaveBeenCalledWith('reservar_lote', {
      p_lote_id: 'lote-001',
      p_usuario_id: 'artesano-demo-001',
    });
    expect(res).toEqual(mockResponse);
  });

  it('debe retornar conflicto si el lote ya fue reservado por otro usuario (CA-2)', async () => {
    const mockErrorResponse = {
      ok: false,
      error: {
        codigo: 'LOTE_NO_DISPONIBLE',
        mensaje: 'El lote fue reservado por otro usuario. Busca lotes alternativos.'
      }
    };

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: mockErrorResponse,
      error: null,
    });

    const res = await reservarLote('lote-001', 'artesano-demo-002');

    expect(supabase.rpc).toHaveBeenCalledWith('reservar_lote', {
      p_lote_id: 'lote-001',
      p_usuario_id: 'artesano-demo-002',
    });
    expect(res).toEqual(mockErrorResponse);
  });

  it('debe manejar errores de base de datos o conexión adecuadamente', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: {
        message: 'Conexión perdida con la base de datos',
      },
    });

    const res = await reservarLote('lote-001', 'artesano-demo-001');

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.codigo).toBe('DATABASE_ERROR');
      expect(res.error.mensaje).toBe('Conexión perdida con la base de datos');
    }
  });

  it('debe retornar error de datos inválidos si no se proveen parámetros', async () => {
    const res = await reservarLote('', '');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.codigo).toBe('DATOS_INVALIDOS');
      expect(res.error.mensaje).toContain('requeridos');
    }
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
