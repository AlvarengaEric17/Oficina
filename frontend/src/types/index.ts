// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MECHANIC' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Part types
export interface Part {
  id: string;
  name: string;
  sku: string;
  cost_price: number; // centavos
  sale_price: number; // centavos
  quantity: number;
  min_quantity: number;
  is_critical?: boolean;
}

// Budget types
export type BudgetStatus = 'DRAFT' | 'WAITING_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'TESTING' | 'READY' | 'DELIVERED' | 'REJECTED';

export interface Budget {
  id: string;
  vehicle_plate: string;
  vehicle_model: string;
  client_name: string;
  client_phone: string;
  status: BudgetStatus;
  mechanic_id: string;
  total_value: number; // centavos
  createdAt: string;
  updatedAt: string;
  items: BudgetItem[];
  mechanic?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  part_id?: string;
  description: string;
  cost: number; // centavos
  price: number; // centavos
  quantity: number;
  part?: Part;
}

// Financial types
export type TransactionType = 'INPUT' | 'OUTPUT';

export interface Transaction {
  id: string;
  budget_id?: string;
  description: string;
  type: TransactionType;
  value: number; // centavos
  payment_method?: string;
  createdAt: string;
  budget?: {
    id: string;
    vehicle_plate: string;
    vehicle_model: string;
    client_name: string;
  };
}

export interface CashFlow {
  transactions: Transaction[];
  totals: {
    totalInput: number;
    totalOutput: number;
    balance: number;
  };
}

export interface TaxCalculation {
  originalAmount: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  details: {
    message: string;
  };
}

// Schedule types
export interface Schedule {
  id: string;
  mechanic_id: string;
  start_time: string; // ISO date
  end_time: string; // ISO date
  is_available: boolean;
  mechanic?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface ApiError {
  error: string;
  details?: any;
}
