/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SolarControls } from './components/SolarControls';
import { TrackerStatusPanel } from './components/TrackerStatusPanel';
import { KpiCards } from './components/KpiCards';
import { UnifilarDiagram } from './components/UnifilarDiagram';
import { DailyChart } from './components/DailyChart';
import { SpecsModal } from './components/SpecsModal';
import { HtmlExportModal } from './components/HtmlExportModal';
import { StringDisconnectionModal } from './components/StringDisconnectionModal';
import { TrackerFailureModal } from './components/TrackerFailureModal';
import { ElectricalProtectionState, ActiveTab } from './types';
import { calculateSystemMetrics, calculateDailyProfile } from './utils/solarMath';

export default function App() {
  // 1. Navigation Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // 2. Time & Animation State
  const [timeHour, setTimeHour] = useState<number>(12.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // 3. Tracker 1 Failure State & Timing
  const [tracker1Stuck, setTracker1Stuck] = useState<boolean>(false);
  const [tracker1StuckAngle, setTracker1StuckAngle] = useState<number>(-45);
  const [tracker1FailureHour, setTracker1FailureHour] = useState<number>(10.5);

  // 3.1 String Disconnection State (10 strings per inverter)
  const [disconnectedStringsInv1, setDisconnectedStringsInv1] = useState<number>(0);
  const [disconnectedStringsInv2, setDisconnectedStringsInv2] = useState<number>(0);

  // 4. Electrical Protection & Switchgear State (NA / NF Safety Logic)
  const [protection, setProtection] = useState<ElectricalProtectionState>({
    relay50_51Tripped: false,
    breakerMTClosed: true,
    recloserClosed: true,
    qgbt1BreakerClosed: true,
    qgbt2BreakerClosed: true,
    dcSwitch1Closed: true,
    dcSwitch2Closed: true,
    trafoBtSwitchClosed: true,
    cabineDisconnectorClosed: true,
    utilityDisconnectorClosed: true,
    trafoRatingKva: 75,
    voltageBt: 380,
    voltageMt: 13800,
    powerFactor: 0.98,
  });

  // 5. Modals
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isStringModalOpen, setIsStringModalOpen] = useState<boolean>(false);
  const [isTrackerFailureModalOpen, setIsTrackerFailureModalOpen] = useState<boolean>(false);

  // 6. System Calculations with String Loss and Time-based Tracker Failure
  const metrics = useMemo(() => {
    return calculateSystemMetrics(
      timeHour,
      tracker1Stuck,
      tracker1StuckAngle,
      protection,
      tracker1FailureHour,
      disconnectedStringsInv1,
      disconnectedStringsInv2
    );
  }, [
    timeHour,
    tracker1Stuck,
    tracker1StuckAngle,
    protection,
    tracker1FailureHour,
    disconnectedStringsInv1,
    disconnectedStringsInv2,
  ]);

  const dailyProfile = useMemo(() => {
    return calculateDailyProfile(
      tracker1Stuck,
      tracker1StuckAngle,
      protection,
      tracker1FailureHour,
      disconnectedStringsInv1,
      disconnectedStringsInv2
    );
  }, [
    tracker1Stuck,
    tracker1StuckAngle,
    protection,
    tracker1FailureHour,
    disconnectedStringsInv1,
    disconnectedStringsInv2,
  ]);

  // Handlers for String Management & Tracker Failure
  const handleConfirmStringDisconnection = (inv1: number, inv2: number) => {
    setDisconnectedStringsInv1(inv1);
    setDisconnectedStringsInv2(inv2);
  };

  const handleConfirmTrackerFailure = (hour: number, angle: number) => {
    setTracker1Stuck(true);
    setTracker1FailureHour(hour);
    setTracker1StuckAngle(angle);
  };

  const handleRestoreTracker1 = () => {
    setTracker1Stuck(false);
  };

  const handleSetStuckAngle = (angle: number) => {
    setTracker1StuckAngle(angle);
  };

  const handleToggleDcSwitch1 = () => {
    setProtection((prev) => ({
      ...prev,
      dcSwitch1Closed: !prev.dcSwitch1Closed,
    }));
  };

  const handleToggleDcSwitch2 = () => {
    setProtection((prev) => ({
      ...prev,
      dcSwitch2Closed: !prev.dcSwitch2Closed,
    }));
  };

  const handleToggleQgbt1 = () => {
    setProtection((prev) => ({
      ...prev,
      qgbt1BreakerClosed: !prev.qgbt1BreakerClosed,
    }));
  };

  const handleToggleQgbt2 = () => {
    setProtection((prev) => ({
      ...prev,
      qgbt2BreakerClosed: !prev.qgbt2BreakerClosed,
    }));
  };

  const handleToggleTrafoBtSwitch = () => {
    setProtection((prev) => ({
      ...prev,
      trafoBtSwitchClosed: !prev.trafoBtSwitchClosed,
    }));
  };

  const handleToggleCabineDisconnector = () => {
    setProtection((prev) => ({
      ...prev,
      cabineDisconnectorClosed: !prev.cabineDisconnectorClosed,
    }));
  };

  const handleToggleBreakerMT = () => {
    setProtection((prev) => ({
      ...prev,
      breakerMTClosed: !prev.breakerMTClosed,
    }));
  };

  const handleToggleUtilityDisconnector = () => {
    setProtection((prev) => ({
      ...prev,
      utilityDisconnectorClosed: !prev.utilityDisconnectorClosed,
    }));
  };

  const handleToggleRecloser = () => {
    setProtection((prev) => ({
      ...prev,
      recloserClosed: !prev.recloserClosed,
    }));
  };

  const handleTripRelay = () => {
    setProtection((prev) => ({
      ...prev,
      relay50_51Tripped: true,
      breakerMTClosed: false, // Disjuntor 52 abre no Trip do Relé 50/51
    }));
  };

  const handleResetRelay = () => {
    setProtection((prev) => ({
      ...prev,
      relay50_51Tripped: false,
      breakerMTClosed: true,
    }));
  };

  const handleEnergizeAll = () => {
    setProtection((prev) => ({
      ...prev,
      relay50_51Tripped: false,
      dcSwitch1Closed: true,
      dcSwitch2Closed: true,
      qgbt1BreakerClosed: true,
      qgbt2BreakerClosed: true,
      trafoBtSwitchClosed: true,
      cabineDisconnectorClosed: true,
      breakerMTClosed: true,
      utilityDisconnectorClosed: true,
      recloserClosed: true,
    }));
  };

  const handleDeenergizeAll = () => {
    setProtection((prev) => ({
      ...prev,
      dcSwitch1Closed: false,
      dcSwitch2Closed: false,
      qgbt1BreakerClosed: false,
      qgbt2BreakerClosed: false,
      trafoBtSwitchClosed: false,
      cabineDisconnectorClosed: false,
      breakerMTClosed: false,
      utilityDisconnectorClosed: false,
      recloserClosed: false,
    }));
  };

  const handleResetToDefaults = () => {
    setTimeHour(12.0);
    setIsPlaying(false);
    setTracker1Stuck(false);
    setTracker1StuckAngle(-45);
    setTracker1FailureHour(10.5);
    setDisconnectedStringsInv1(0);
    setDisconnectedStringsInv2(0);
    setProtection({
      relay50_51Tripped: false,
      breakerMTClosed: true,
      recloserClosed: true,
      qgbt1BreakerClosed: true,
      qgbt2BreakerClosed: true,
      dcSwitch1Closed: true,
      dcSwitch2Closed: true,
      trafoBtSwitchClosed: true,
      cabineDisconnectorClosed: true,
      utilityDisconnectorClosed: true,
      trafoRatingKva: 75,
      voltageBt: 380,
      voltageMt: 13800,
      powerFactor: 0.98,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navigation & Status with Tabs */}
      <Header
        metrics={metrics}
        protection={protection}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onResetToDefaults={handleResetToDefaults}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* COMMON: Solar & Time Controls (accessible in both tabs for immediate interaction) */}
        <SolarControls
          solar={metrics.solar}
          tracker1Poa={metrics.tracker1.poaIrradiance}
          tracker2Poa={metrics.tracker2.poaIrradiance}
          tracker1Stuck={tracker1Stuck}
          onTimeChange={setTimeHour}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
        />

        {/* COMMON: Core Key Performance Indicators (Inversor 1 Laranja/Amarelo, Inversor 2 Azul/Ciano, Total MT Verde) */}
        <KpiCards
          metrics={metrics}
          onOpenStringModal={() => setIsStringModalOpen(true)}
        />

        {/* TAB 1: Dashboard e Geração */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Tracker Physical Status & Failure Simulation */}
            <TrackerStatusPanel
              tracker1={metrics.tracker1}
              tracker2={metrics.tracker2}
              ghi={metrics.solar.ghi}
              onOpenFailureModal={() => setIsTrackerFailureModalOpen(true)}
              onRestoreTracker1={handleRestoreTracker1}
              onSetStuckAngle={handleSetStuckAngle}
            />

            {/* Daily Generation Profile Chart (Chart.js with individual inverters & total curve) */}
            <DailyChart
              dailyProfile={dailyProfile}
              currentTime={timeHour}
              tracker1Stuck={tracker1Stuck}
              tracker1StuckAngle={tracker1StuckAngle}
              tracker1FailureHour={tracker1FailureHour}
              disconnectedStringsInv1={disconnectedStringsInv1}
              disconnectedStringsInv2={disconnectedStringsInv2}
              onOpenStringModal={() => setIsStringModalOpen(true)}
              onOpenTrackerFailureModal={() => setIsTrackerFailureModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: Diagrama Unifilar Interativo (SLD) */}
        {activeTab === 'unifilar' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Dynamic Single-Line Diagram with full NA / NF switches and electrical standard color coding */}
            <UnifilarDiagram
              metrics={metrics}
              protection={protection}
              onToggleBreakerMT={handleToggleBreakerMT}
              onToggleRecloser={handleToggleRecloser}
              onTripRelay={handleTripRelay}
              onResetRelay={handleResetRelay}
              onToggleQgbt1={handleToggleQgbt1}
              onToggleQgbt2={handleToggleQgbt2}
              onToggleDcSwitch1={handleToggleDcSwitch1}
              onToggleDcSwitch2={handleToggleDcSwitch2}
              onToggleTrafoBtSwitch={handleToggleTrafoBtSwitch}
              onToggleCabineDisconnector={handleToggleCabineDisconnector}
              onToggleUtilityDisconnector={handleToggleUtilityDisconnector}
              onEnergizeAll={handleEnergizeAll}
              onDeenergizeAll={handleDeenergizeAll}
            />
          </div>
        )}

      </main>

      {/* String Disconnection Field Management Modal (10 strings / inversor) */}
      <StringDisconnectionModal
        isOpen={isStringModalOpen}
        onClose={() => setIsStringModalOpen(false)}
        disconnectedStringsInv1={disconnectedStringsInv1}
        disconnectedStringsInv2={disconnectedStringsInv2}
        onConfirm={handleConfirmStringDisconnection}
      />

      {/* Tracker Failure Simulation Modal (Time & Angle of failure) */}
      <TrackerFailureModal
        isOpen={isTrackerFailureModalOpen}
        onClose={() => setIsTrackerFailureModalOpen(false)}
        isStuck={tracker1Stuck}
        currentStuckAngle={tracker1StuckAngle}
        currentFailureHour={tracker1FailureHour}
        currentTime={timeHour}
        onConfirmFailure={handleConfirmTrackerFailure}
        onRestoreTracker={handleRestoreTracker1}
      />

      {/* Technical Memorial Modal */}
      <SpecsModal isOpen={isSpecsOpen} onClose={() => setIsSpecsOpen(false)} />

      {/* Standalone HTML Exporter Modal */}
      <HtmlExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Simulador de Usina Fotovoltaica de Média Tensão · 55 kWp · 13.8 kV · NBR 5410 & NBR 14039
          </span>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">
            Convenção de Segurança: Vermelho (Fechado/Energizado) · Verde (Aberto/Desenergizado)
          </span>
        </div>
      </footer>
    </div>
  );
}
