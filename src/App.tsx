/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CRMProvider } from './context/CRMContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { GanttView } from './components/GanttView';
import { MaterialsView } from './components/MaterialsView';
import { ClientsView } from './components/ClientsView';
import { FinancialReportsView } from './components/FinancialReportsView';
import { RDOView } from './components/RDOView';
import { ContractorMeasurementsView } from './components/ContractorMeasurementsView';
import { NewProjectModal } from './components/NewProjectModal';
import { NewTaskModal } from './components/NewTaskModal';
import { NewOrderModal } from './components/NewOrderModal';
import { NewClientModal } from './components/NewClientModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { PrintReportModal } from './components/PrintReportModal';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Navigation (Desktop persistent / Mobile & Tablet off-canvas drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Bar Header */}
        <Header
          currentTab={currentTab}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenNewTask={() => setIsNewTaskOpen(true)}
          onOpenNewOrder={() => setIsNewOrderOpen(true)}
          onOpenNewClient={() => setIsNewClientOpen(true)}
          onOpenExportReport={() => setIsPrintReportOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Viewport Content Area with mobile bottom padding */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              onOpenNewProject={() => setIsNewProjectOpen(true)}
              onOpenNewTask={() => setIsNewTaskOpen(true)}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
            />
          )}

          {currentTab === 'gantt' && (
            <GanttView
              onOpenNewTask={() => setIsNewTaskOpen(true)}
            />
          )}

          {currentTab === 'rdo' && (
            <RDOView />
          )}

          {currentTab === 'materials' && (
            <MaterialsView
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
            />
          )}

          {currentTab === 'measurements' && (
            <div className="p-3 sm:p-6">
              <ContractorMeasurementsView />
            </div>
          )}

          {currentTab === 'clients' && (
            <ClientsView
              onOpenNewClient={() => setIsNewClientOpen(true)}
              onOpenNewProject={() => setIsNewProjectOpen(true)}
            />
          )}

          {currentTab === 'financial' && (
            <FinancialReportsView
              onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
              onOpenPrintModal={() => setIsPrintReportOpen(true)}
            />
          )}
        </main>

        {/* Mobile & Tablet Quick Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Functional Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
      />

      <NewTransactionModal
        isOpen={isNewTransactionOpen}
        onClose={() => setIsNewTransactionOpen(false)}
      />

      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <MainLayout />
    </CRMProvider>
  );
}
