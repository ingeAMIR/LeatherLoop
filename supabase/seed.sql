-- Limpiar datos existentes antes de insertar (opcional)
DELETE FROM reservas;
DELETE FROM lotes;

-- Insertar Lotes de prueba
INSERT INTO lotes (id, material, cantidad_kg, ubicacion, estado) VALUES
('lote-001', 'Retal de cuero vacuno napa', 12.50, 'Zona Piel Verde, León', 'disponible'),
('lote-002', 'Recorte de forro de cerdo', 8.20, 'Colonia Coecillo, León', 'disponible'),
('lote-003', 'Carnaza gruesa curtida', 25.00, 'San Jerónimo, León', 'disponible'),
('lote-004', 'Pedacería de charol negro', 5.80, 'Colonia Industrial, León', 'disponible'),
('lote-005', 'Cuero de cabra para calzado', 14.10, 'Fraccionamiento Guadalupe, León', 'reservado');

-- Insertar reserva inicial para el lote-005 para simular estado inicial
INSERT INTO reservas (lote_id, usuario_id, expira_en, estado) VALUES
('lote-005', 'artesano-demo-999', NOW() + INTERVAL '30 minutes', 'activa');
