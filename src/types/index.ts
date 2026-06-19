export enum LoteEstado {
  DISPONIBLE = 'disponible',
  RESERVADO = 'reservado',
}

export enum ReservaEstado {
  ACTIVA = 'activa',
}

export interface Lote {
  id: string;
  material: string;
  cantidadKg: number;
  ubicacion: string;
  estado: LoteEstado;
  creadoEn?: string;
}

export interface Reserva {
  id: string;
  loteId: string;
  usuarioId: string;
  reservadoEn: string;
  expiraEn: string;
  estado: ReservaEstado;
}

export interface ReservarResponseExito {
  ok: true;
  loteId: string;
  estado: LoteEstado;
  minutosGarantizados: number;
  expiraEn: string;
  mensaje: string;
}

export interface ReservarResponseError {
  ok: false;
  error: {
    codigo: string;
    mensaje: string;
  };
}

export type ReservarResponse = ReservarResponseExito | ReservarResponseError;
