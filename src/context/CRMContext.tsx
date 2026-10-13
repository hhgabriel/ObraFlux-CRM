import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Project, 
  GanttTask, 
  MaterialItem, 
  MaterialOrder, 
  Client, 
  FinancialRecord,
  CategoryBudgetAnalysis,
  ExpenseCategory,
  DailyConstructionLog,
  SupplierRFQ,
  ContractorMeasurement,
  SCurvePoint,
  PredictiveAnalysis
} from '../types/crm';
import { 
  initialProjects, 
  initialClients, 
  initialGanttTasks, 
  initialMaterials, 
  initialOrders, 
  initialFinancialRecords,
  initialRDOs,
  initialRFQs,
  initialContractorMeasurements
} from '../data/initialData';

interface FinancialReportSummary {
  project: Project;
  client?: Client;
  contractValue: number;
  budgetTotal: number;
  spentTotal: number;
  totalIncome: number;
  currentCashBalance: number;
  budgetVariance: number;
  percentBudgetSpent: number;
  physicalProgress: number;
  grossMargin: number;
  projectedNetMarginPercent: number;
  currentOperatingMargin: number;
  categories: CategoryBudgetAnalysis[];
  monthlyCashFlow: Array<{ month: string; income: number; expense: number; balance: number }>;
  healthStatus: 'healthy' | 'attention' | 'critical';
  insights: string[];
}

interface CRMContextType {
  projects: Project[];
  activeProjectId: string;
  activeProject: Project | null;
  setActiveProjectId: (id: string) => void;
  clients: Client[];
  ganttTasks: GanttTask[];
  materials: MaterialItem[];
  orders: MaterialOrder[];
  financialRecords: FinancialRecord[];
  rdos: DailyConstructionLog[];
  rfqs: SupplierRFQ[];
  contractorMeasurements: ContractorMeasurement[];
  
  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'spentTotal'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;

  // Task Actions
  addTask: (task: Omit<GanttTask, 'id'>) => void;
  updateTask: (task: GanttTask) => void;
  deleteTask: (id: string) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  importTasksFromCSV: (tasks: Array<Omit<GanttTask, 'id' | 'projectId'>>) => void;

  // Material Actions
  addMaterial: (material: Omit<MaterialItem, 'id' | 'lastUpdated'>) => void;
  updateMaterial: (material: MaterialItem) => void;
  consumeMaterial: (materialId: string, quantity: number) => void;

  // Order Actions
  addOrder: (order: Omit<MaterialOrder, 'id' | 'totalPrice'>) => void;
  receiveOrder: (orderId: string, invoiceNumber?: string) => void;
  updateOrderStatus: (orderId: string, status: MaterialOrder['status']) => void;

  // Client Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;

  // Financial Actions
  addFinancialRecord: (record: Omit<FinancialRecord, 'id'>) => void;
  deleteFinancialRecord: (id: string) => void;

  // Daily Construction Log (RDO)
  addRDO: (rdo: Omit<DailyConstructionLog, 'id' | 'reportNumber'>) => void;

  // Supplier RFQ Quotes
  addRFQ: (rfq: Omit<SupplierRFQ, 'id'>) => void;
  approveRFQQuote: (rfqId: string, vendorId: string) => void;

  // Contractor Measurements
  addContractorMeasurement: (measurement: Omit<ContractorMeasurement, 'id' | 'grossAmount' | 'netAmountToPay' | 'accumulatedQty'>) => void;
  approveContractorMeasurement: (measurementId: string, comments?: string) => void;

  // Calculations & Advanced Analytics
  getProjectFinancialReport: (projectId: string) => FinancialReportSummary | null;
  getSCurveData: (projectId: string) => SCurvePoint[];
  getPredictiveAnalysis: (projectId: string) => PredictiveAnalysis;
  resetToDefaults: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('obraflux_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('obraflux_active_project');
    return saved && initialProjects.some(p => p.id === saved) ? saved : (initialProjects[0]?.id || '');
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('obraflux_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(() => {
    const saved = localStorage.getItem('obraflux_tasks');
    return saved ? JSON.parse(saved) : initialGanttTasks;
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('obraflux_materials');
    return saved ? JSON.parse(saved) : initialMaterials;
  });

  const [orders, setOrders] = useState<MaterialOrder[]>(() => {
    const saved = localStorage.getItem('obraflux_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('obraflux_financial');
    return saved ? JSON.parse(saved) : initialFinancialRecords;
  });

  const [rdos, setRDOs] = useState<DailyConstructionLog[]>(() => {
    const saved = localStorage.getItem('obraflux_rdos');
    return saved ? JSON.parse(saved) : initialRDOs;
  });

  const [rfqs, setRFQs] = useState<SupplierRFQ[]>(() => {
    const saved = localStorage.getItem('obraflux_rfqs');
    return saved ? JSON.parse(saved) : initialRFQs;
  });

  const [contractorMeasurements, setContractorMeasurements] = useState<ContractorMeasurement[]>(() => {
    const saved = localStorage.getItem('obraflux_measurements');
    return saved ? JSON.parse(saved) : initialContractorMeasurements;
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('obraflux_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('obraflux_active_project', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('obraflux_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('obraflux_tasks', JSON.stringify(ganttTasks));
  }, [ganttTasks]);

  useEffect(() => {
    localStorage.setItem('obraflux_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('obraflux_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('obraflux_financial', JSON.stringify(financialRecords));
  }, [financialRecords]);

  useEffect(() => {
    localStorage.setItem('obraflux_rdos', JSON.stringify(rdos));
  }, [rdos]);

  useEffect(() => {
    localStorage.setItem('obraflux_rfqs', JSON.stringify(rfqs));
  }, [rfqs]);

  useEffect(() => {
    localStorage.setItem('obraflux_measurements', JSON.stringify(contractorMeasurements));
  }, [contractorMeasurements]);

  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  // Project Actions
  const addProject = (projectData: Omit<Project, 'id' | 'spentTotal'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      spentTotal: 0,
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
  };

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length > 0) setActiveProjectId(remaining[0].id);
    }
  };

  // Task Actions
  const addTask = (taskData: Omit<GanttTask, 'id'>) => {
    const newTask: GanttTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setGanttTasks(prev => [...prev, newTask]);
  };

  const updateTask = (updated: GanttTask) => {
    setGanttTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTask = (id: string) => {
    setGanttTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    setGanttTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: clamped } : t));
  };

  const importTasksFromCSV = (tasks: Array<Omit<GanttTask, 'id' | 'projectId'>>) => {
    if (!activeProject) return;
    const newTasks: GanttTask[] = tasks.map((t, idx) => ({
      ...t,
      id: `task-imported-${Date.now()}-${idx}`,
      projectId: activeProject.id,
    }));
    setGanttTasks(prev => [...prev, ...newTasks]);
  };

  // Material Actions
  const addMaterial = (materialData: Omit<MaterialItem, 'id' | 'lastUpdated'>) => {
    const newMaterial: MaterialItem = {
      ...materialData,
      id: `mat-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (updated: MaterialItem) => {
    setMaterials(prev => prev.map(m => m.id === updated.id ? { ...updated, lastUpdated: new Date().toISOString().split('T')[0] } : m));
  };

  const consumeMaterial = (materialId: string, quantity: number) => {
    setMaterials(prev => prev.map(m => {
      if (m.id === materialId) {
        const nextStock = Math.max(0, m.currentStock - quantity);
        return {
          ...m,
          currentStock: nextStock,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return m;
    }));
  };

  // Order Actions & Site Receiving Flow
  const addOrder = (orderData: Omit<MaterialOrder, 'id' | 'totalPrice'>) => {
    const total = orderData.quantity * orderData.unitPrice;
    const newOrder: MaterialOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      totalPrice: total,
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: MaterialOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const receiveOrder = (orderId: string, invoiceNumber?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === 'received_at_site') return;

    const today = new Date().toISOString().split('T')[0];

    // 1. Update order status
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'received_at_site',
          actualDeliveryDate: today,
          invoiceNumber: invoiceNumber || o.invoiceNumber || `NF-e ${Math.floor(100000 + Math.random() * 900000)}`,
        };
      }
      return o;
    }));

    // 2. Increase material stock in site inventory
    setMaterials(prev => prev.map(m => {
      if (m.id === order.materialId) {
        return {
          ...m,
          currentStock: m.currentStock + order.quantity,
          lastUpdated: today,
        };
      }
      return m;
    }));

    // 3. Register financial expense automatically
    const newExpense: FinancialRecord = {
      id: `fin-auto-${Date.now()}`,
      projectId: order.projectId,
      type: 'expense',
      category: 'Materiais de Construção',
      amount: order.totalPrice,
      date: today,
      description: `Entrada no canteiro: ${order.quantity} ${order.unit} de ${order.materialName} (Fornecedor: ${order.supplier})`,
      paymentStatus: 'paid',
      relatedOrderId: order.id,
    };

    setFinancialRecords(prev => [newExpense, ...prev]);

    // 4. Update project spentTotal
    setProjects(prev => prev.map(p => {
      if (p.id === order.projectId) {
        return {
          ...p,
          spentTotal: p.spentTotal + order.totalPrice,
        };
      }
      return p;
    }));
  };

  // Client Actions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (updated: Client) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Financial Actions
  const addFinancialRecord = (recordData: Omit<FinancialRecord, 'id'>) => {
    const newRecord: FinancialRecord = {
      ...recordData,
      id: `fin-${Date.now()}`,
    };
    setFinancialRecords(prev => [newRecord, ...prev]);

    if (newRecord.type === 'expense' && newRecord.paymentStatus === 'paid') {
      setProjects(prev => prev.map(p => {
        if (p.id === newRecord.projectId) {
          return {
            ...p,
            spentTotal: p.spentTotal + newRecord.amount,
          };
        }
        return p;
      }));
    }
  };

  const deleteFinancialRecord = (id: string) => {
    const record = financialRecords.find(r => r.id === id);
    if (record && record.type === 'expense' && record.paymentStatus === 'paid') {
      setProjects(prev => prev.map(p => {
        if (p.id === record.projectId) {
          return {
            ...p,
            spentTotal: Math.max(0, p.spentTotal - record.amount),
          };
        }
        return p;
      }));
    }
    setFinancialRecords(prev => prev.filter(r => r.id !== id));
  };

  // Daily Construction Log (RDO) Actions
  const addRDO = (rdoData: Omit<DailyConstructionLog, 'id' | 'reportNumber'>) => {
    const projectRDOs = rdos.filter(r => r.projectId === rdoData.projectId);
    const nextNum = projectRDOs.length > 0 
      ? Math.max(...projectRDOs.map(r => r.reportNumber)) + 1 
      : 1;

    const newRDO: DailyConstructionLog = {
      ...rdoData,
      id: `rdo-${Date.now()}`,
      reportNumber: nextNum,
    };
    setRDOs(prev => [newRDO, ...prev]);
  };

  // Supplier Quote Actions
  const addRFQ = (rfqData: Omit<SupplierRFQ, 'id'>) => {
    const newRFQ: SupplierRFQ = {
      ...rfqData,
      id: `rfq-${Date.now()}`,
    };
    setRFQs(prev => [newRFQ, ...prev]);
  };

  const approveRFQQuote = (rfqId: string, vendorId: string) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) return;

    const chosenQuote = rfq.quotes.find(q => q.vendorId === vendorId);
    if (!chosenQuote) return;

    // 1. Mark RFQ as approved
    setRFQs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'aprovado', selectedVendorId: vendorId } : r));

    // 2. Automatically generate purchase order in material flow!
    // Try to find matching material in project
    const matchMat = materials.find(m => m.projectId === rfq.projectId && m.name.toLowerCase().includes(rfq.materialName.toLowerCase()));
    const matId = matchMat ? matchMat.id : `mat-auto-${Date.now()}`;

    // If material doesn't exist, register it in project catalog
    if (!matchMat) {
      addMaterial({
        projectId: rfq.projectId,
        name: rfq.materialName,
        category: 'Argamassas & Cimentos',
        unit: rfq.unit,
        currentStock: 0,
        minStock: Math.round(rfq.quantity * 0.3),
        unitPrice: chosenQuote.unitPrice,
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + chosenQuote.deliveryDays);

    addOrder({
      projectId: rfq.projectId,
      materialId: matId,
      materialName: rfq.materialName,
      supplier: chosenQuote.vendorName,
      quantity: rfq.quantity,
      unit: rfq.unit,
      unitPrice: chosenQuote.unitPrice,
      orderDate: today,
      expectedDeliveryDate: expDate.toISOString().split('T')[0],
      status: 'in_transit',
      notes: `Gerado a partir do Mapa de Cotação: ${rfq.title}. Termos: ${chosenQuote.paymentTerms}. Frete: ${chosenQuote.freightType}`,
    });
  };

  // Contractor Measurements Actions
  const addContractorMeasurement = (mData: Omit<ContractorMeasurement, 'id' | 'grossAmount' | 'netAmountToPay' | 'accumulatedQty'>) => {
    const gross = mData.currentPeriodQty * mData.unitRate;
    const net = gross - mData.withholdingTax;
    const accumulated = mData.previousMeasuredQty + mData.currentPeriodQty;

    const newMeasurement: ContractorMeasurement = {
      ...mData,
      id: `med-${Date.now()}`,
      accumulatedQty: accumulated,
      grossAmount: gross,
      netAmountToPay: net,
    };
    setContractorMeasurements(prev => [newMeasurement, ...prev]);
  };

  const approveContractorMeasurement = (measurementId: string, comments?: string) => {
    const measurement = contractorMeasurements.find(m => m.id === measurementId);
    if (!measurement || measurement.status === 'aprovado' || measurement.status === 'pago') return;

    const today = new Date().toISOString().split('T')[0];

    // 1. Update status to approved
    setContractorMeasurements(prev => prev.map(m => {
      if (m.id === measurementId) {
        return {
          ...m,
          status: 'aprovado',
          approvalDate: today,
          engineerComments: comments || m.engineerComments,
        };
      }
      return m;
    }));

    // 2. Automatically log financial expense for the contractor
    addFinancialRecord({
      projectId: measurement.projectId,
      type: 'expense',
      category: 'Serviços Terceirizados',
      amount: measurement.grossAmount,
      date: today,
      description: `Boletim de Medição #${measurement.measurementNumber}: ${measurement.serviceTitle} (${measurement.subcontractorName}) - Líquido a pagar: R$ ${measurement.netAmountToPay.toLocaleString('pt-BR')}`,
      paymentStatus: 'paid',
    });
  };

  // S-Curve Calculator
  const getSCurveData = (projectId: string): SCurvePoint[] => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];

    const pTasks = ganttTasks.filter(t => t.projectId === projectId);
    const pRecords = financialRecords.filter(r => r.projectId === projectId && r.type === 'expense' && r.paymentStatus === 'paid');

    // Months horizon from start to expected end
    const start = new Date(project.startDate);
    const end = new Date(project.expectedEndDate);

    const points: SCurvePoint[] = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth() + 1, 1);

    const totalBudget = project.budgetTotal;
    const monthList: string[] = [];

    while (cur <= lastMonth) {
      const ym = cur.toISOString().substring(0, 7);
      monthList.push(ym);
      cur.setMonth(cur.getMonth() + 1);
    }

    const todayYm = new Date().toISOString().substring(0, 7);
    const totalM = monthList.length;

    let accumulatedActualExpenses = 0;

    monthList.forEach((ym, idx) => {
      // S-curve mathematical formula: sigmoid curve 1 / (1 + exp(-k * (x - x0)))
      const x = (idx + 0.5) / totalM;
      // standard S-curve mapping 0 to 1
      const sigmoid = 1 / (1 + Math.exp(-6 * (x - 0.5)));
      // Normalize to 0-100%
      const minSig = 1 / (1 + Math.exp(-6 * -0.5));
      const maxSig = 1 / (1 + Math.exp(-6 * 0.5));
      const plannedPercent = Math.min(100, Math.max(0, Math.round(((sigmoid - minSig) / (maxSig - minSig)) * 100)));
      const plannedAmount = (plannedPercent / 100) * totalBudget;

      const dateObj = new Date(ym + '-02');
      const label = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');

      const isPastOrCurrent = ym <= todayYm;

      let actualPercent: number | null = null;
      let actualAmount: number | null = null;
      let projectedPercent: number | null = null;

      if (isPastOrCurrent) {
        // Expenses up to this month
        const monthExpenses = pRecords
          .filter(r => r.date.substring(0, 7) <= ym)
          .reduce((sum, r) => sum + r.amount, 0);

        accumulatedActualExpenses = monthExpenses;
        actualAmount = accumulatedActualExpenses;
        actualPercent = totalBudget > 0 ? Math.min(100, Math.round((actualAmount / totalBudget) * 100)) : 0;
      } else {
        // Future projection starting from current actual
        const remainingMonths = totalM - monthList.indexOf(todayYm);
        const curIdx = idx - monthList.indexOf(todayYm);
        const lastActualPct = points[points.length - 1]?.actualCumulativePercent || 40;
        projectedPercent = Math.min(100, Math.round(lastActualPct + ((100 - lastActualPct) * (curIdx / Math.max(1, remainingMonths)))));
      }

      points.push({
        month: ym,
        monthLabel: label.charAt(0).toUpperCase() + label.slice(1),
        plannedCumulativePercent: plannedPercent,
        actualCumulativePercent: actualPercent,
        plannedCumulativeAmount: plannedAmount,
        actualCumulativeAmount: actualAmount,
        projectedCumulativePercent: projectedPercent,
      });
    });

    return points;
  };

  // EVM & Predictive AI Analysis Engine
  const getPredictiveAnalysis = (projectId: string): PredictiveAnalysis => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return {
        spi: 1.0,
        cpi: 1.0,
        eac: 0,
        vac: 0,
        projectedCompletionDate: '2027-04-30',
        projectedDelayDays: 0,
        riskLevel: 'baixo',
        executiveSummary: 'Dados insuficientes para análise.',
        recommendations: [],
        generatedAt: new Date().toISOString(),
      };
    }

    const pTasks = ganttTasks.filter(t => t.projectId === projectId);
    const pRecords = financialRecords.filter(r => r.projectId === projectId && r.type === 'expense' && r.paymentStatus === 'paid');

    const BAC = project.budgetTotal; // Budget At Completion
    const AC = pRecords.reduce((sum, r) => sum + r.amount, 0); // Actual Cost

    // Earned Value (EV) = BAC * (Physical Progress %)
    const nonMilestones = pTasks.filter(t => !t.isMilestone);
    const physicalProgress = nonMilestones.length > 0 
      ? (nonMilestones.reduce((acc, t) => acc + t.progress, 0) / nonMilestones.length) / 100
      : 0.1;

    const EV = BAC * physicalProgress;

    // Planned Value (PV) based on elapsed project duration
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.expectedEndDate).getTime();
    const now = new Date().getTime();
    const totalDuration = Math.max(1, end - start);
    const elapsedDuration = Math.max(0, Math.min(totalDuration, now - start));
    const plannedProgressRatio = elapsedDuration / totalDuration;
    const PV = BAC * plannedProgressRatio;

    // EVM Indices
    // CPI = EV / AC
    const cpi = AC > 0 ? Number((EV / AC).toFixed(2)) : 1.0;
    // SPI = EV / PV
    const spi = PV > 0 ? Number((EV / PV).toFixed(2)) : 1.0;

    // Estimate At Completion: EAC = BAC / CPI
    const safeCpi = Math.max(0.5, cpi);
    const eac = Math.round(BAC / safeCpi);
    const vac = BAC - eac; // Variance at completion

    // Schedule delay projection
    const expectedDays = Math.ceil(totalDuration / 86400000);
    const safeSpi = Math.max(0.5, spi);
    const projectedTotalDays = Math.ceil(expectedDays / safeSpi);
    const projectedDelayDays = Math.max(0, projectedTotalDays - expectedDays);

    const projectedDate = new Date(start + projectedTotalDays * 86400000);
    const projectedCompletionDate = projectedDate.toISOString().split('T')[0];

    // Risk level assessment
    let riskLevel: 'baixo' | 'moderado' | 'critico' = 'baixo';
    if (cpi < 0.88 || spi < 0.85 || projectedDelayDays > 45) {
      riskLevel = 'critico';
    } else if (cpi < 0.95 || spi < 0.92 || projectedDelayDays > 15) {
      riskLevel = 'moderado';
    }

    // Engineering Recommendations
    const recs: string[] = [];
    if (spi < 0.95) {
      recs.push(`Índice de Prazo (SPI = ${spi}): A obra está operando a ${(spi * 100).toFixed(0)}% da velocidade planejada. Recomenda-se abrir 2 frentes simultâneas de trabalho e estender jornada aos sábados nas etapas do caminho crítico.`);
    } else {
      recs.push(`Índice de Prazo (SPI = ${spi}): Cronograma alinhado com o plano de ataque inicial.`);
    }

    if (cpi < 0.95) {
      recs.push(`Índice de Custos (CPI = ${cpi}): Cada R$ 1,00 gasto está entregando R$ ${(cpi).toFixed(2)} de valor agregado. Projeção de estouro final de R$ ${Math.abs(vac).toLocaleString('pt-BR')}. Recomenda-se cotar insumos via Mapa de Cotações com no mínimo 3 concorrentes.`);
    } else {
      recs.push(`Índice de Custos (CPI = ${cpi}): Gestão de compras eficiente e dentro das premissas orçamentárias.`);
    }

    if (projectedDelayDays > 0) {
      recs.push(`Previsão de Entrega Ajustada: Estimada para ${projectedCompletionDate} (potencial atraso de ${projectedDelayDays} dias corridos se o ritmo atual for mantido).`);
    } else {
      recs.push(`Previsão de Entrega no Prazo: Término previsto dentro do horizonte contratual (${project.expectedEndDate}).`);
    }

    const summary = riskLevel === 'critico'
      ? `ALERTA DE ENGENHARIA: Obra com desvio desfavorável de custos e ritmo físico (CPI: ${cpi} | SPI: ${spi}). Necessária intervenção imediata da diretoria técnica.`
      : riskLevel === 'moderado'
        ? `ATENÇÃO OPERACIONAL: Obra com desvios leves no cronograma físico (SPI: ${spi}). Correção recomendada antes da entrada na fase de acabamentos.`
        : `STATUS OPERACIONAL EXCELENTE: Desempenho físico-financeiro equilibrado (CPI: ${cpi} | SPI: ${spi}). Margem de lucro preservada.`;

    return {
      spi,
      cpi,
      eac,
      vac,
      projectedCompletionDate,
      projectedDelayDays,
      riskLevel,
      executiveSummary: summary,
      recommendations: recs,
      generatedAt: new Date().toISOString(),
    };
  };

  const getProjectFinancialReport = (projectId: string): FinancialReportSummary | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    const client = clients.find(c => c.id === project.clientId);
    const pRecords = financialRecords.filter(r => r.projectId === projectId);
    const pTasks = ganttTasks.filter(t => t.projectId === projectId);

    const totalIncome = pRecords
      .filter(r => r.type === 'income' && r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = pRecords
      .filter(r => r.type === 'expense' && r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + r.amount, 0);

    const spentTotal = totalExpense > 0 ? totalExpense : project.spentTotal;
    const budgetVariance = project.budgetTotal - spentTotal;
    const percentBudgetSpent = project.budgetTotal > 0 ? (spentTotal / project.budgetTotal) * 100 : 0;
    
    const nonMilestoneTasks = pTasks.filter(t => !t.isMilestone);
    const physicalProgress = nonMilestoneTasks.length > 0 
      ? Math.round(nonMilestoneTasks.reduce((acc, t) => acc + t.progress, 0) / nonMilestoneTasks.length) 
      : 0;

    const grossMargin = project.contractValue - project.budgetTotal;
    const projectedNetMarginPercent = project.contractValue > 0 
      ? (grossMargin / project.contractValue) * 100 
      : 0;
    const currentOperatingMargin = totalIncome - spentTotal;

    const standardCategories: ExpenseCategory[] = [
      'Materiais de Construção',
      'Mão de Obra Direta',
      'Equipamentos & Locação',
      'Serviços Terceirizados',
      'Projetos, Taxas & Licenças',
      'Administração & Canteiro'
    ];

    const categoryWeights: Record<ExpenseCategory, number> = {
      'Materiais de Construção': 0.42,
      'Mão de Obra Direta': 0.28,
      'Equipamentos & Locação': 0.10,
      'Serviços Terceirizados': 0.12,
      'Projetos, Taxas & Licenças': 0.04,
      'Administração & Canteiro': 0.04,
    };

    const categories: CategoryBudgetAnalysis[] = standardCategories.map(cat => {
      const budgeted = project.budgetTotal * (categoryWeights[cat] || 0.1);
      const spent = pRecords
        .filter(r => r.type === 'expense' && r.category === cat && r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + r.amount, 0);
      const variance = budgeted - spent;
      const percentSpent = budgeted > 0 ? (spent / budgeted) * 100 : 0;
      return {
        category: cat,
        budgeted,
        spent,
        variance,
        percentSpent,
      };
    });

    const monthMap: Record<string, { income: number; expense: number }> = {};
    pRecords.forEach(r => {
      const monthKey = r.date.substring(0, 7);
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { income: 0, expense: 0 };
      }
      if (r.type === 'income') {
        monthMap[monthKey].income += r.amount;
      } else {
        monthMap[monthKey].expense += r.amount;
      }
    });

    const monthlyCashFlow = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      }));

    const insights: string[] = [];
    let healthStatus: 'healthy' | 'attention' | 'critical' = 'healthy';

    if (percentBudgetSpent > physicalProgress + 15) {
      healthStatus = 'critical';
      insights.push(`Alerta de Descompasso Físico-Financeiro: O orçamento realizado (${percentBudgetSpent.toFixed(1)}%) avançou muito mais que o progresso físico aferido (${physicalProgress}%). Risco iminente de sobrecusto.`);
    } else if (percentBudgetSpent > physicalProgress + 5) {
      healthStatus = 'attention';
      insights.push(`Atenção ao ritmo de gastos: Desembolso (${percentBudgetSpent.toFixed(1)}%) ligeiramente à frente da execução física (${physicalProgress}%).`);
    } else {
      insights.push(`Eficiência físico-financeira positiva: Progresso físico (${physicalProgress}%) compatível com a taxa de queima orçamentária (${percentBudgetSpent.toFixed(1)}%).`);
    }

    if (currentOperatingMargin < 0) {
      healthStatus = healthStatus === 'healthy' ? 'attention' : healthStatus;
      insights.push(`Fluxo de caixa momentâneo descoberto: Despesas realizadas superam as receitas faturadas por medição em R$ ${Math.abs(currentOperatingMargin).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
    } else {
      insights.push(`Caixa operacional superavitário em R$ ${currentOperatingMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, garantindo liquidez para as próximas etapas.`);
    }

    return {
      project,
      client,
      contractValue: project.contractValue,
      budgetTotal: project.budgetTotal,
      spentTotal,
      totalIncome,
      currentCashBalance: totalIncome - spentTotal,
      budgetVariance,
      percentBudgetSpent,
      physicalProgress,
      grossMargin,
      projectedNetMarginPercent,
      currentOperatingMargin,
      categories,
      monthlyCashFlow,
      healthStatus,
      insights,
    };
  };

  const resetToDefaults = () => {
    setProjects(initialProjects);
    setActiveProjectId(initialProjects[0].id);
    setClients(initialClients);
    setGanttTasks(initialGanttTasks);
    setMaterials(initialMaterials);
    setOrders(initialOrders);
    setFinancialRecords(initialFinancialRecords);
    setRDOs(initialRDOs);
    setRFQs(initialRFQs);
    setContractorMeasurements(initialContractorMeasurements);
    localStorage.clear();
  };

  return (
    <CRMContext.Provider
      value={{
        projects,
        activeProjectId,
        activeProject,
        setActiveProjectId,
        clients,
        ganttTasks,
        materials,
        orders,
        financialRecords,
        rdos,
        rfqs,
        contractorMeasurements,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        updateTaskProgress,
        importTasksFromCSV,
        addMaterial,
        updateMaterial,
        consumeMaterial,
        addOrder,
        receiveOrder,
        updateOrderStatus,
        addClient,
        updateClient,
        deleteClient,
        addFinancialRecord,
        deleteFinancialRecord,
        addRDO,
        addRFQ,
        approveRFQQuote,
        addContractorMeasurement,
        approveContractorMeasurement,
        getProjectFinancialReport,
        getSCurveData,
        getPredictiveAnalysis,
        resetToDefaults,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
