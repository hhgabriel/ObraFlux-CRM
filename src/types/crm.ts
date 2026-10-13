export type ProjectStatus = 'planning' | 'in_progress' | 'inspection' | 'completed' | 'paused';

export type TaskCategory = 
  | 'Planejamento & Projetos'
  | 'Fundação & Terraplenagem'
  | 'Estrutura & Alvenaria'
  | 'Instalações Hidráulicas & Elétricas'
  | 'Cobertura & Impermeabilização'
  | 'Acabamentos & Revestimentos'
  | 'Vistoria & Entrega das Chaves';

export interface GanttTask {
  id: string;
  projectId: string;
  name: string;
  category: TaskCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  progress: number;  // 0 - 100
  budgetCost: number;
  actualCost: number;
  isMilestone?: boolean;
  assignedTeam?: string;
  dependencyTaskId?: string;
}

export type MaterialUnit = 'm³' | 'kg' | 'sacos' | 'barras (12m)' | 'un' | 'm²' | 'litros' | 'ton';

export interface MaterialItem {
  id: string;
  projectId: string;
  name: string;
  category: 'Agregados' | 'Aço & Ferragens' | 'Alvenaria' | 'Argamassas & Cimentos' | 'Elétrica' | 'Hidráulica' | 'Acabamento';
  unit: MaterialUnit;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  lastUpdated: string;
}

export type OrderStatus = 'requested' | 'in_transit' | 'received_at_site';

export interface MaterialOrder {
  id: string;
  projectId: string;
  materialId: string;
  materialName: string;
  supplier: string;
  quantity: number;
  unit: MaterialUnit;
  unitPrice: number;
  totalPrice: number;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  invoiceNumber?: string;
  status: OrderStatus;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  email: string;
  phone: string;
  companyName?: string;
  address: string;
  notes?: string;
  status: 'lead' | 'proposal' | 'contract_signed' | 'active_construction' | 'completed';
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Materiais de Construção'
  | 'Mão de Obra Direta'
  | 'Equipamentos & Locação'
  | 'Serviços Terceirizados'
  | 'Projetos, Taxas & Licenças'
  | 'Administração & Canteiro';

export type IncomeCategory =
  | 'Medição de Obra'
  | 'Entrada Contratual'
  | 'Aditivo de Projeto'
  | 'Financiamento Imobiliário';

export interface FinancialRecord {
  id: string;
  projectId: string;
  type: 'expense' | 'income';
  category: ExpenseCategory | IncomeCategory;
  amount: number;
  date: string;
  description: string;
  paymentStatus: 'paid' | 'pending';
  receiptUrl?: string;
  relatedOrderId?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  clientId: string;
  engineerName: string;
  artNumber: string; // Registro ART/CREA
  address: string;
  city: string;
  state: string;
  startDate: string;
  expectedEndDate: string;
  status: ProjectStatus;
  contractValue: number; // Valor total contratado com cliente
  budgetTotal: number;   // Custo orçado da obra
  spentTotal: number;    // Custo já realizado
  description: string;
  builtAreaM2: number;
  imageUrl?: string;
}

export interface CategoryBudgetAnalysis {
  category: ExpenseCategory;
  budgeted: number;
  spent: number;
  variance: number; // orçado - realizado
  percentSpent: number;
}

// 1. Curva S (S-Curve)
export interface SCurvePoint {
  month: string;      // YYYY-MM
  monthLabel: string; // Abr/26
  plannedCumulativePercent: number; // 0-100
  actualCumulativePercent: number | null; // 0-100 or null if future
  plannedCumulativeAmount: number;
  actualCumulativeAmount: number | null;
  projectedCumulativePercent: number | null;
}

// 2. Diário de Obra Digital (RDO)
export type WeatherType = 'ensolarado' | 'nublado' | 'chuva_fraca' | 'chuva_forte' | 'impraticavel';

export interface DailyConstructionLog {
  id: string;
  projectId: string;
  reportNumber: number;
  date: string; // YYYY-MM-DD
  weatherMorning: WeatherType;
  weatherAfternoon: WeatherType;
  workability: 'praticavel' | 'parcial' | 'impraticavel';
  workforce: {
    engineers: number;
    foremen: number;    // mestre de obras / encarregados
    masons: number;     // pedreiros
    laborers: number;   // serventes
    ironworkers: number;// armadores
    carpenters: number; // carpinteiros
    electricians: number;
    plumbers: number;
    subcontractorsCount: number;
  };
  equipment: Array<{ name: string; quantity: number; status: 'operando' | 'parado' | 'manutencao' }>;
  activitiesCompleted: string[];
  inspectionsAndSafety: string; // DDS, vistorias, EPIs
  occurrences: string;          // imprevistos, paralisações
  responsibleEngineer: string;
}

// 3. Mapa de Cotação de Fornecedores
export interface VendorQuoteOption {
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  paymentTerms: string;
  freightType: 'CIF (Incluso)' | 'FOB (Retira)';
  isBestPrice?: boolean;
  isRecommended?: boolean;
  notes?: string;
}

export interface SupplierRFQ {
  id: string;
  projectId: string;
  title: string;
  materialName: string;
  quantity: number;
  unit: MaterialUnit;
  requestedDate: string;
  status: 'cotacao' | 'aprovado' | 'cancelado';
  selectedVendorId?: string;
  quotes: VendorQuoteOption[];
}

// 4. Boletim de Medição de Empreiteiros
export interface ContractorMeasurement {
  id: string;
  projectId: string;
  subcontractorName: string;
  cnpj: string;
  serviceTitle: string;
  measurementNumber: number;
  periodStart: string;
  periodEnd: string;
  unit: string;
  unitRate: number;
  contractTotalQty: number;
  previousMeasuredQty: number;
  currentPeriodQty: number;
  accumulatedQty: number;
  grossAmount: number;
  withholdingTax: number; // retenção INSS/ISS
  netAmountToPay: number;
  status: 'pendente' | 'aprovado' | 'pago';
  approvalDate?: string;
  engineerComments?: string;
}

// 6. Diagnóstico Preditivo de Custos com IA (EVM & Predictive Analytics)
export interface PredictiveAnalysis {
  spi: number; // Schedule Performance Index (>1 adiantado, <1 atrasado)
  cpi: number; // Cost Performance Index (>1 economia, <1 sobrecusto)
  eac: number; // Estimate At Completion (R$)
  vac: number; // Variance At Completion (Orçado - EAC)
  projectedCompletionDate: string;
  projectedDelayDays: number;
  riskLevel: 'baixo' | 'moderado' | 'critico';
  executiveSummary: string;
  recommendations: string[];
  generatedAt: string;
}
