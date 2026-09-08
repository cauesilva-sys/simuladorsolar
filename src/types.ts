export type ActiveTab = 'dashboard' | 'unifilar';

export interface SolarParameters {
  timeHour: number; // 6.0 to 18.0 (e.g. 13.5 = 13:30)
  sunAngle: number; // -90 deg at 06:00, 0 deg at 12:00, +90 deg at 18:00
  sunElevation: number; // 0 deg at sunrise/sunset, ~75 deg at solar noon
  ghi: number; // Global Horizontal Irradiance (W/m2), 0 - 1000 W/m2
}

export interface TrackerState {
  id: number;
  name: string;
  strings: string;
  moduleCount: number;
  installedPowerKwp: number; // 27.5 kWp
  angle: number; // Current physical angle (-60 to +60)
  idealAngle: number;
  isStuck: boolean;
  stuckAngle: number;
  failureHour?: number; // Solar hour when the failure occurred (e.g. 10.5 = 10:30)
  isFailureActiveNow?: boolean; // Whether current time is >= failureHour
  poaIrradiance: number; // Plane of Array Irradiance (W/m2)
  incidenceAngle: number; // Angle between panel normal and sun vector
  misalignmentAngle: number; // Angle difference between ideal and current
  misalignmentLossPercent: number; // % loss compared to ideal tracking
}

export interface InverterState {
  id: number;
  name: string;
  ratedPowerKw: number; // e.g. 30 kW
  dcPowerKw: number;
  acPowerKw: number;
  efficiencyPercent: number;
  voltageAc: number; // 380 V
  currentAc: number; // Amperes
  status: 'active' | 'derating' | 'offline';
  totalStrings: number; // 10 strings per inverter
  activeStrings: number; // 0 to 10
  disconnectedStrings: number; // 0 to 10
  stringLossPercent: number; // (disconnectedStrings / 10) * 100
}

export interface ElectricalProtectionState {
  // Seccionadoras e Disjuntores (NF = Fechado / Energizado [VERMELHO], NA = Aberto / Desenergizado [VERDE])
  dcSwitch1Closed: boolean; // Chave Seccionadora CC 01
  dcSwitch2Closed: boolean; // Chave Seccionadora CC 02
  qgbt1BreakerClosed: boolean; // Disjuntor Geral QGBT 01
  qgbt2BreakerClosed: boolean; // Disjuntor Geral QGBT 02
  trafoBtSwitchClosed: boolean; // Chave Seccionadora BT Trafo Elevador
  cabineDisconnectorClosed: boolean; // Chave Seccionadora MT Cabine Primária
  breakerMTClosed: boolean; // Disjuntor MT 52 a Vácuo Cabine Primária
  relay50_51Tripped: boolean; // Relé de Proteção 50/51 (Sobrecorrente)
  utilityDisconnectorClosed: boolean; // Chave Seccionadora Ponto de Entrega Concessionária
  recloserClosed: boolean; // Religador Automático MT Concessionária
  // Parâmetros elétricos
  trafoRatingKva: number; // 75 kVA
  voltageBt: number; // 380 V
  voltageMt: number; // 13800 V (13.8 kV)
  powerFactor: number; // e.g. 0.98 inductive
}

export interface EnergizationState {
  dc1: boolean;
  dc2: boolean;
  inv1Output: boolean;
  inv2Output: boolean;
  busBt: boolean;
  trafoBtSide: boolean;
  trafoMtSide: boolean;
  cabineBus: boolean;
  utilityBranch: boolean;
  gridDelivering: boolean;
}

export interface SystemMetrics {
  solar: SolarParameters;
  tracker1: TrackerState;
  tracker2: TrackerState;
  inverter1: InverterState;
  inverter2: InverterState;
  energization: EnergizationState;
  totalDcPowerKw: number;
  totalBtPowerKw: number;
  trafoLossesKw: number;
  totalMtPowerKw: number;
  totalMtPowerKva: number;
  currentMtAmperes: number;
  idealMtPowerKw: number;
  misalignmentLossKw: number;
  misalignmentLossPercent: number;
  dailyIdealEnergyKwh: number;
  dailyRealEnergyKwh: number;
  dailyLossKwh: number;
}

export interface HourlyDataPoint {
  timeString: string;
  hour: number;
  sunAngle: number;
  ghi: number;
  poa1: number;
  poa2: number;
  poaIdeal: number;
  idealPowerKw: number;
  idealInvPowerKw: number;
  realPowerKw: number;
  inv1PowerKw: number;
  inv2PowerKw: number;
  lossKw: number;
  isTracker1StuckAtThisHour?: boolean;
}
