import {
  HourlyDataPoint,
  SolarParameters,
  SystemMetrics,
  TrackerState,
  InverterState,
  ElectricalProtectionState,
  EnergizationState,
} from '../types';

export const TOTAL_MODULES = 100;
export const MODULE_WATTAGE = 550; // Watts
export const TOTAL_KWP = (TOTAL_MODULES * MODULE_WATTAGE) / 1000; // 55 kWp
export const HALF_KWP = TOTAL_KWP / 2; // 27.5 kWp
export const INVERTER_RATED_KW = 30; // 30 kW each (total 60 kW AC capacity)
export const VOLTAGE_BT = 380; // V
export const VOLTAGE_MT = 13800; // 13.8 kV
export const TRAFO_RATED_KVA = 75; // 75 kVA
export const POWER_FACTOR = 0.98;

export function formatTime(hourDecimal: number): string {
  const hours = Math.floor(hourDecimal);
  const minutes = Math.round((hourDecimal - hours) * 60);
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function calculateSolarParameters(timeHour: number): SolarParameters {
  const clampedHour = Math.max(6, Math.min(18, timeHour));
  const sunAngle = (clampedHour - 12) * 15;
  const sunElevation = Math.max(0, 75 * Math.sin(((clampedHour - 6) / 12) * Math.PI));
  const zenithFactor = Math.sin(((clampedHour - 6) / 12) * Math.PI);
  const ghi = Math.max(0, 1000 * Math.pow(zenithFactor, 1.25));

  return {
    timeHour: clampedHour,
    sunAngle,
    sunElevation,
    ghi,
  };
}

export function getIdealTrackerAngle(sunAngle: number): number {
  return Math.max(-60, Math.min(60, sunAngle));
}

export function calculatePoa(
  sunAngle: number,
  trackerAngle: number,
  ghi: number,
  sunElevation: number = 60
): {
  poa: number;
  incidenceAngle: number;
} {
  if (ghi <= 1) return { poa: 0, incidenceAngle: 0 };

  const incidenceAngle = Math.abs(sunAngle - trackerAngle);
  const radIncidence = (incidenceAngle * Math.PI) / 180;
  
  // Solar elevation angle above horizon
  const elevationDeg = Math.max(2, sunElevation);
  const sinElevation = Math.sin((elevationDeg * Math.PI) / 180);

  // Separation of GHI into diffuse (DHI) and direct beam normal (DNI)
  const diffuseFraction = 0.18;
  const diffuseHorizontal = ghi * diffuseFraction;
  const directHorizontal = ghi * (1 - diffuseFraction);
  
  // Direct normal irradiance on tracker axis plane
  const dni = Math.min(1060, directHorizontal / Math.max(0.20, sinElevation));
  
  // Projection on single-axis tracker panel tilted at trackerAngle
  const tiltRad = (Math.abs(trackerAngle) * Math.PI) / 180;
  const cosIncidence = Math.max(0, Math.cos(radIncidence));
  // Single-axis tracker captures direct beam with cosine of incidence:
  const poaDirect = dni * cosIncidence * Math.max(0.35, Math.pow(sinElevation, 0.40));
  
  // Diffuse components (sky diffuse + ground reflected albedo ~20%)
  const skyDiffuse = diffuseHorizontal * ((1 + Math.cos(tiltRad)) / 2);
  const groundReflected = ghi * 0.20 * ((1 - Math.cos(tiltRad)) / 2);
  
  const poa = Math.max(0, poaDirect + skyDiffuse + groundReflected);

  return {
    poa,
    incidenceAngle,
  };
}

export function calculateTrackerMetrics(
  id: number,
  name: string,
  strings: string,
  isStuck: boolean,
  stuckAngle: number,
  sunAngle: number,
  ghi: number,
  sunElevation: number = 60,
  failureHour?: number,
  currentTimeHour?: number
): TrackerState {
  const idealAngle = getIdealTrackerAngle(sunAngle);
  // Failure takes effect only if isStuck is true AND currentTimeHour >= failureHour
  const isFailureActive =
    isStuck &&
    (failureHour === undefined || currentTimeHour === undefined || currentTimeHour >= failureHour);
  const currentAngle = isFailureActive ? stuckAngle : idealAngle;

  const { poa, incidenceAngle } = calculatePoa(sunAngle, currentAngle, ghi, sunElevation);
  const idealPoa = calculatePoa(sunAngle, idealAngle, ghi, sunElevation).poa;

  const misalignmentAngle = Math.abs(idealAngle - currentAngle);
  const misalignmentLossPercent = idealPoa > 1 ? Math.max(0, ((idealPoa - poa) / idealPoa) * 100) : 0;

  return {
    id,
    name,
    strings,
    moduleCount: 50,
    installedPowerKwp: HALF_KWP,
    angle: currentAngle,
    idealAngle,
    isStuck,
    stuckAngle,
    failureHour,
    isFailureActiveNow: isFailureActive,
    poaIrradiance: poa,
    incidenceAngle,
    misalignmentAngle,
    misalignmentLossPercent,
  };
}

export function calculateInverterMetrics(
  id: number,
  name: string,
  tracker: TrackerState,
  isDcConnected: boolean,
  disconnectedStrings: number = 0
): InverterState {
  const TOTAL_STRINGS = 10;
  const clampedDisconnected = Math.max(0, Math.min(TOTAL_STRINGS, disconnectedStrings));
  const activeStrings = TOTAL_STRINGS - clampedDisconnected;
  const activeRatio = activeStrings / TOTAL_STRINGS;
  const stringLossPercent = (clampedDisconnected / TOTAL_STRINGS) * 100;

  if (!isDcConnected || tracker.poaIrradiance <= 5 || activeStrings === 0) {
    return {
      id,
      name,
      ratedPowerKw: INVERTER_RATED_KW,
      dcPowerKw: 0,
      acPowerKw: 0,
      efficiencyPercent: 0,
      voltageAc: VOLTAGE_BT,
      currentAc: 0,
      status: 'offline',
      totalStrings: TOTAL_STRINGS,
      activeStrings,
      disconnectedStrings: clampedDisconnected,
      stringLossPercent,
    };
  }

  // Realistic operational field dispersion:
  // Inversor 1 (Tracker 1 strings: thermal gradient/cable run) -> 0.986
  // Inversor 2 (Tracker 2 strings: optimized position) -> 1.003
  // Ideal benchmark -> 1.000 nominal
  const fieldFactor = id === 1 ? 0.986 : id === 2 ? 1.003 : 1.0;
  const derate = 0.95 * fieldFactor;
  // Proportional DC power according to active strings ratio (e.g. 8/10 = 0.8)
  const rawDcPower = tracker.installedPowerKwp * (tracker.poaIrradiance / 1000) * derate * activeRatio;
  const dcPowerKw = Math.min(rawDcPower, INVERTER_RATED_KW * 1.05);

  const loadRatio = dcPowerKw / INVERTER_RATED_KW;
  let efficiency = 0.982;
  if (loadRatio < 0.2) efficiency = 0.94;
  else if (loadRatio < 0.5) efficiency = 0.975;

  const acPowerKw = Math.min(INVERTER_RATED_KW, dcPowerKw * efficiency);
  const currentAc = (acPowerKw * 1000) / (Math.sqrt(3) * VOLTAGE_BT * POWER_FACTOR);

  return {
    id,
    name,
    ratedPowerKw: INVERTER_RATED_KW,
    dcPowerKw,
    acPowerKw,
    efficiencyPercent: efficiency * 100,
    voltageAc: VOLTAGE_BT,
    currentAc,
    status: acPowerKw >= INVERTER_RATED_KW * 0.98 ? 'derating' : 'active',
    totalStrings: TOTAL_STRINGS,
    activeStrings,
    disconnectedStrings: clampedDisconnected,
    stringLossPercent,
  };
}

export function calculateSystemMetrics(
  timeHour: number,
  tracker1Stuck: boolean,
  tracker1StuckAngle: number,
  protection: ElectricalProtectionState,
  tracker1FailureHour: number = 10.5,
  disconnectedStringsInv1: number = 0,
  disconnectedStringsInv2: number = 0
): SystemMetrics {
  const solar = calculateSolarParameters(timeHour);

  // 1. Trackers
  const tracker1 = calculateTrackerMetrics(
    1,
    'Tracker 1 (Strings 01 a 10)',
    'Strings 01-10 (10 strings configuradas)',
    tracker1Stuck,
    tracker1StuckAngle,
    solar.sunAngle,
    solar.ghi,
    solar.sunElevation,
    tracker1FailureHour,
    timeHour
  );

  const tracker2 = calculateTrackerMetrics(
    2,
    'Tracker 2 (Strings 01 a 10)',
    'Strings 01-10 (10 strings configuradas)',
    false,
    0,
    solar.sunAngle,
    solar.ghi,
    solar.sunElevation
  );

  // Ideal tracker for 100% benchmark
  const idealTracker = calculateTrackerMetrics(
    0,
    'Tracker Ideal',
    'Strings 10x',
    false,
    0,
    solar.sunAngle,
    solar.ghi,
    solar.sunElevation
  );

  // 2. Inverters (DC input connected via dcSwitch1Closed & dcSwitch2Closed)
  const inverter1 = calculateInverterMetrics(
    1,
    'Inversor 1 (String Inverter 30kW)',
    tracker1,
    protection.dcSwitch1Closed,
    disconnectedStringsInv1
  );

  const inverter2 = calculateInverterMetrics(
    2,
    'Inversor 2 (String Inverter 30kW)',
    tracker2,
    protection.dcSwitch2Closed,
    disconnectedStringsInv2
  );

  const idealInverter = calculateInverterMetrics(
    0,
    'Inversor Ideal',
    idealTracker,
    true,
    0
  );

  // 3. Electrical Continuity & Energization Logic
  const dc1 = protection.dcSwitch1Closed && tracker1.poaIrradiance > 5;
  const dc2 = protection.dcSwitch2Closed && tracker2.poaIrradiance > 5;
  const inv1Output = dc1 && inverter1.acPowerKw > 0;
  const inv2Output = dc2 && inverter2.acPowerKw > 0;

  // QGBT feeding BT Bus
  const fedByInv1 = inv1Output && protection.qgbt1BreakerClosed;
  const fedByInv2 = inv2Output && protection.qgbt2BreakerClosed;
  const busBt = fedByInv1 || fedByInv2;

  // Trafo BT Side
  const trafoBtSide = busBt && protection.trafoBtSwitchClosed;
  const trafoMtSide = trafoBtSide; // When primary is energized, secondary steps up

  // Cabine MT Bus
  const cabineBus = trafoMtSide && protection.cabineDisconnectorClosed;

  // Protection & Breaker MT
  const isBreakerMTConducting = protection.breakerMTClosed && !protection.relay50_51Tripped;
  const utilityBranch = cabineBus && isBreakerMTConducting;

  // Point of delivery & Recloser
  const gridDelivering = utilityBranch && protection.utilityDisconnectorClosed && protection.recloserClosed;

  const energization: EnergizationState = {
    dc1,
    dc2,
    inv1Output,
    inv2Output,
    busBt,
    trafoBtSide,
    trafoMtSide,
    cabineBus,
    utilityBranch,
    gridDelivering,
  };

  // 4. Power flow calculations
  const totalDcPowerKw = inverter1.dcPowerKw + inverter2.dcPowerKw;
  
  // Power reaching the BT bus
  const pBt1 = fedByInv1 ? inverter1.acPowerKw : 0;
  const pBt2 = fedByInv2 ? inverter2.acPowerKw : 0;
  const totalBtPowerKw = pBt1 + pBt2;

  // Trafo losses (only if Trafo BT switch is closed)
  let trafoLossesKw = 0;
  let trafoOutputMtKw = 0;
  if (trafoBtSide && totalBtPowerKw > 0.5) {
    trafoLossesKw = 0.25 + totalBtPowerKw * 0.014;
    trafoOutputMtKw = Math.max(0, totalBtPowerKw - trafoLossesKw);
  }

  // MT Power delivered to utility grid
  const totalMtPowerKw = gridDelivering ? trafoOutputMtKw : 0;
  const totalMtPowerKva = totalMtPowerKw / POWER_FACTOR;
  const currentMtAmperes = totalMtPowerKw > 0
    ? (totalMtPowerKw * 1000) / (Math.sqrt(3) * VOLTAGE_MT * POWER_FACTOR)
    : 0;

  // Ideal reference
  const idealBtPowerKw = idealInverter.acPowerKw * 2;
  const idealTrafoLossesKw = idealBtPowerKw > 0.5 ? 0.25 + idealBtPowerKw * 0.014 : 0;
  const idealMtPowerKw = Math.max(0, idealBtPowerKw - idealTrafoLossesKw);

  const misalignmentLossKw = Math.max(0, idealMtPowerKw - totalMtPowerKw);
  const misalignmentLossPercent = idealMtPowerKw > 0.1 ? (misalignmentLossKw / idealMtPowerKw) * 100 : 0;

  // Daily totals
  const dailyMetrics = calculateDailyIntegrals(
    tracker1Stuck,
    tracker1StuckAngle,
    protection,
    tracker1FailureHour,
    disconnectedStringsInv1,
    disconnectedStringsInv2
  );

  return {
    solar,
    tracker1,
    tracker2,
    inverter1,
    inverter2,
    energization,
    totalDcPowerKw,
    totalBtPowerKw,
    trafoLossesKw,
    totalMtPowerKw,
    totalMtPowerKva,
    currentMtAmperes,
    idealMtPowerKw,
    misalignmentLossKw,
    misalignmentLossPercent,
    dailyIdealEnergyKwh: dailyMetrics.dailyIdealEnergyKwh,
    dailyRealEnergyKwh: dailyMetrics.dailyRealEnergyKwh,
    dailyLossKwh: dailyMetrics.dailyLossKwh,
  };
}

export function calculateDailyProfile(
  tracker1Stuck: boolean,
  tracker1StuckAngle: number,
  protection: ElectricalProtectionState,
  tracker1FailureHour: number = 10.5,
  disconnectedStringsInv1: number = 0,
  disconnectedStringsInv2: number = 0
): HourlyDataPoint[] {
  const points: HourlyDataPoint[] = [];
  const step = 0.25; // 15-minute intervals

  for (let h = 6.0; h <= 18.0; h += step) {
    const timeString = formatTime(h);
    const solar = calculateSolarParameters(h);

    // KEY REQUIREMENT: Before failure hour, generation curve is 100% normal.
    // After failure hour, it reflects the misalignment loss!
    const isTracker1StuckAtH = tracker1Stuck && h >= tracker1FailureHour;

    const t1 = calculateTrackerMetrics(
      1,
      'T1',
      '',
      tracker1Stuck,
      tracker1StuckAngle,
      solar.sunAngle,
      solar.ghi,
      solar.sunElevation,
      tracker1FailureHour,
      h
    );
    const t2 = calculateTrackerMetrics(2, 'T2', '', false, 0, solar.sunAngle, solar.ghi, solar.sunElevation);
    const tIdeal = calculateTrackerMetrics(0, 'TIdeal', '', false, 0, solar.sunAngle, solar.ghi, solar.sunElevation);

    const inv1 = calculateInverterMetrics(1, 'I1', t1, protection.dcSwitch1Closed, disconnectedStringsInv1);
    const inv2 = calculateInverterMetrics(2, 'I2', t2, protection.dcSwitch2Closed, disconnectedStringsInv2);
    const invIdeal = calculateInverterMetrics(0, 'IIdeal', tIdeal, true, 0);

    const fedByInv1 = protection.dcSwitch1Closed && protection.qgbt1BreakerClosed && inv1.acPowerKw > 0;
    const fedByInv2 = protection.dcSwitch2Closed && protection.qgbt2BreakerClosed && inv2.acPowerKw > 0;
    const busBt = fedByInv1 || fedByInv2;

    const trafoBtSide = busBt && protection.trafoBtSwitchClosed;
    const cabineBus = trafoBtSide && protection.cabineDisconnectorClosed;
    const isBreakerconducting = protection.breakerMTClosed && !protection.relay50_51Tripped;
    const gridDelivering = cabineBus && isBreakerconducting && protection.utilityDisconnectorClosed && protection.recloserClosed;

    const pBt1 = fedByInv1 ? inv1.acPowerKw : 0;
    const pBt2 = fedByInv2 ? inv2.acPowerKw : 0;
    const realBt = pBt1 + pBt2;

    const realLoss = realBt > 0.5 ? 0.25 + realBt * 0.014 : 0;
    const realMt = gridDelivering && realBt > 0.5 ? Math.max(0, realBt - realLoss) : 0;

    // Fractional contributions to MT
    const inv1Mt = realBt > 0 ? realMt * (pBt1 / realBt) : 0;
    const inv2Mt = realBt > 0 ? realMt * (pBt2 / realBt) : 0;

    const idealBt = invIdeal.acPowerKw * 2;
    const idealLoss = idealBt > 0.5 ? 0.25 + idealBt * 0.014 : 0;
    const idealMt = idealBt > 0.5 ? Math.max(0, idealBt - idealLoss) : 0;
    const idealInvMt = idealMt / 2; // Nominal single inverter reference on MT

    const lossKw = Math.max(0, idealMt - realMt);

    points.push({
      timeString,
      hour: h,
      sunAngle: solar.sunAngle,
      ghi: parseFloat(solar.ghi.toFixed(1)),
      poa1: parseFloat(t1.poaIrradiance.toFixed(1)),
      poa2: parseFloat(t2.poaIrradiance.toFixed(1)),
      poaIdeal: parseFloat(tIdeal.poaIrradiance.toFixed(1)),
      idealPowerKw: parseFloat(idealMt.toFixed(2)),
      idealInvPowerKw: parseFloat(idealInvMt.toFixed(2)),
      realPowerKw: parseFloat(realMt.toFixed(2)),
      inv1PowerKw: parseFloat(inv1Mt.toFixed(2)),
      inv2PowerKw: parseFloat(inv2Mt.toFixed(2)),
      lossKw: parseFloat(lossKw.toFixed(2)),
      isTracker1StuckAtThisHour: isTracker1StuckAtH,
    });
  }

  return points;
}

export function calculateDailyIntegrals(
  tracker1Stuck: boolean,
  tracker1StuckAngle: number,
  protection: ElectricalProtectionState,
  tracker1FailureHour: number = 10.5,
  disconnectedStringsInv1: number = 0,
  disconnectedStringsInv2: number = 0
): {
  dailyIdealEnergyKwh: number;
  dailyRealEnergyKwh: number;
  dailyLossKwh: number;
} {
  const stepHours = 0.25;
  let idealKwh = 0;
  let realKwh = 0;

  for (let h = 6.0; h <= 18.0; h += stepHours) {
    const solar = calculateSolarParameters(h);

    const t1 = calculateTrackerMetrics(
      1,
      'T1',
      '',
      tracker1Stuck,
      tracker1StuckAngle,
      solar.sunAngle,
      solar.ghi,
      solar.sunElevation,
      tracker1FailureHour,
      h
    );
    const t2 = calculateTrackerMetrics(2, 'T2', '', false, 0, solar.sunAngle, solar.ghi, solar.sunElevation);
    const tIdeal = calculateTrackerMetrics(0, 'TIdeal', '', false, 0, solar.sunAngle, solar.ghi, solar.sunElevation);

    const inv1 = calculateInverterMetrics(1, 'I1', t1, protection.dcSwitch1Closed, disconnectedStringsInv1);
    const inv2 = calculateInverterMetrics(2, 'I2', t2, protection.dcSwitch2Closed, disconnectedStringsInv2);
    const invIdeal = calculateInverterMetrics(0, 'IIdeal', tIdeal, true, 0);

    const fedByInv1 = protection.dcSwitch1Closed && protection.qgbt1BreakerClosed && inv1.acPowerKw > 0;
    const fedByInv2 = protection.dcSwitch2Closed && protection.qgbt2BreakerClosed && inv2.acPowerKw > 0;
    const busBt = fedByInv1 || fedByInv2;

    const trafoBtSide = busBt && protection.trafoBtSwitchClosed;
    const cabineBus = trafoBtSide && protection.cabineDisconnectorClosed;
    const isBreakerconducting = protection.breakerMTClosed && !protection.relay50_51Tripped;
    const gridDelivering = cabineBus && isBreakerconducting && protection.utilityDisconnectorClosed && protection.recloserClosed;

    const pBt1 = fedByInv1 ? inv1.acPowerKw : 0;
    const pBt2 = fedByInv2 ? inv2.acPowerKw : 0;
    const realBt = pBt1 + pBt2;

    const realLoss = realBt > 0.5 ? 0.25 + realBt * 0.014 : 0;
    const realMt = gridDelivering && realBt > 0.5 ? Math.max(0, realBt - realLoss) : 0;

    const idealBt = invIdeal.acPowerKw * 2;
    const idealLoss = idealBt > 0.5 ? 0.25 + idealBt * 0.014 : 0;
    const idealMt = idealBt > 0.5 ? Math.max(0, idealBt - idealLoss) : 0;

    realKwh += realMt * stepHours;
    idealKwh += idealMt * stepHours;
  }

  const dailyLossKwh = Math.max(0, idealKwh - realKwh);

  return {
    dailyIdealEnergyKwh: Math.round(idealKwh * 10) / 10,
    dailyRealEnergyKwh: Math.round(realKwh * 10) / 10,
    dailyLossKwh: Math.round(dailyLossKwh * 10) / 10,
  };
}
