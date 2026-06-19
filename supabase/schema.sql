-- Tabla de Lotes
CREATE TABLE IF NOT EXISTS lotes (
  id TEXT PRIMARY KEY,
  material TEXT NOT NULL,
  cantidad_kg NUMERIC(10, 2) NOT NULL,
  ubicacion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id TEXT NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  usuario_id TEXT NOT NULL,
  reservado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_en TIMESTAMPTZ NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa'))
);

-- Función de Reserva Atómica (FOR UPDATE SKIP LOCKED)
CREATE OR REPLACE FUNCTION reservar_lote(p_lote_id TEXT, p_usuario_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_lote_id TEXT;
  v_expira_en TIMESTAMPTZ;
  v_reserva_id UUID;
BEGIN
  -- Definir tiempo de expiración (45 minutos)
  v_expira_en := NOW() + INTERVAL '45 minutes';

  -- Bloquear fila del lote si está disponible; saltar si está bloqueada por otra trans.
  SELECT id INTO v_lote_id
  FROM lotes
  WHERE id = p_lote_id AND estado = 'disponible'
  FOR UPDATE SKIP LOCKED;

  -- Si no se encontró o ya está tomado
  IF v_lote_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object(
        'codigo', 'LOTE_NO_DISPONIBLE',
        'mensaje', 'El lote fue reservado por otro usuario. Busca lotes alternativos.'
      )
    );
  END IF;

  -- Marcar lote como reservado
  UPDATE lotes
  SET estado = 'reservado'
  WHERE id = p_lote_id;

  -- Crear registro de la reserva
  INSERT INTO reservas (lote_id, usuario_id, expira_en)
  VALUES (p_lote_id, p_usuario_id, v_expira_en)
  RETURNING id INTO v_reserva_id;

  -- Retornar respuesta exitosa
  RETURN jsonb_build_object(
    'ok', true,
    'loteId', p_lote_id,
    'estado', 'reservado',
    'minutosGarantizados', 45,
    'expiraEn', to_jsonb(v_expira_en),
    'mensaje', 'Tu lote está apartado. Tienes 45 minutos garantizados.'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object(
        'codigo', 'ERROR_INTERNO',
        'mensaje', SQLERRM
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
