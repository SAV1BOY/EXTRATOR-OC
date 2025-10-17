export interface Supplier {
  name: string | null;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Buyer {
  company: string;
  cnpj: string;
  inscricaoEstadual?: string;
  address: string;
  city: string;
  phone: string | null;
  cep?: string;
}

export interface Payment {
  condition: string | null;
  freight: string | null;
}

export interface Item {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  ipi?: number;
  total: number;
  deliveryDate: string;
}

export interface Totals {
  totalQuantity: number;
  totalValue: number;
  itemCount: number;
  totalValueFormatted: string | undefined;
  documentTotal?: number | null;
}

export interface Metadata {
  extractionTime: string;
  confidence: number;
  fileName?: string;
  source?: string;
  method?: string;
}

export interface ExtractedData {
  orderNumber: string | null;
  date: string | null;
  supplier: Supplier;
  buyer: Buyer;
  items: Item[];
  totals: Totals;
  payment: Payment;
  metadata: Metadata;
}

export type KnownOC = Omit<ExtractedData, 'metadata'>;

export type Tab = 'upload' | 'results' | 'validation' | 'export' | 'debug';
export type ExportFormat = 'json' | 'csv' | 'xml';

export interface ValidationResult {
    errors: string[];
    warnings: string[];
    isValid: boolean;
}
