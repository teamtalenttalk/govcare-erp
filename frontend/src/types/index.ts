export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  tenant_id: string;
  is_active: boolean;
}

export interface Account {
  id: number;
  tenant_id: number;
  code: string;
  name: string;
  type: string;
  subtype: string | null;
  parent_id: number | null;
  is_active: boolean;
  description: string | null;
  normal_balance: 'debit' | 'credit';
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: number;
  tenant_id: number;
  entry_number: string;
  date: string;
  description: string;
  reference: string | null;
  status: 'draft' | 'posted' | 'voided';
  posted_at: string | null;
  posted_by: number | null;
  created_by: number;
  total_debit: number;
  total_credit: number;
  lines: JournalEntryLine[];
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: number;
  journal_entry_id: number;
  account_id: number;
  description: string | null;
  debit: number;
  credit: number;
  account?: Account;
}

export interface Contract {
  id: number;
  tenant_id: number;
  contract_number: string;
  name: string;
  customer_id: number;
  type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  total_value: number;
  funded_value: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  tenant_id: number;
  contract_id: number;
  project_number: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string | null;
  budget: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  status: string;
  assigned_to: number | null;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectBudget {
  id: number;
  project_id: number;
  category: string;
  description: string | null;
  budgeted_amount: number;
  actual_amount: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface TimesheetEntry {
  id: number;
  tenant_id: number;
  employee_id: number;
  project_id: number;
  task_id: number | null;
  date: string;
  hours: number;
  description: string | null;
  status: string;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseReport {
  id: number;
  tenant_id: number;
  employee_id: number;
  report_number: string;
  title: string;
  status: string;
  submitted_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  total_amount: number;
  items: ExpenseItem[];
  created_at: string;
  updated_at: string;
}

export interface ExpenseItem {
  id: number;
  expense_report_id: number;
  project_id: number | null;
  account_id: number | null;
  date: string;
  description: string;
  category: string;
  amount: number;
  receipt_url: string | null;
}

export interface Vendor {
  id: number;
  tenant_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: number;
  tenant_id: number;
  vendor_id: number;
  bill_number: string;
  date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  items: BillItem[];
  vendor?: Vendor;
  created_at: string;
  updated_at: string;
}

export interface BillItem {
  id: number;
  bill_id: number;
  account_id: number;
  project_id: number | null;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface BillPayment {
  id: number;
  bill_id: number;
  date: string;
  amount: number;
  method: string;
  reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  tenant_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  tenant_id: number;
  customer_id: number;
  invoice_number: string;
  date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  items: InvoiceItem[];
  customer?: Customer;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  account_id: number;
  project_id: number | null;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoicePayment {
  id: number;
  invoice_id: number;
  date: string;
  amount: number;
  method: string;
  reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  tenant_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  job_title: string | null;
  employment_type: string;
  employment_status: string;
  hire_date: string;
  termination_date: string | null;
  pay_rate: number;
  pay_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type: string;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: string;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollRun {
  id: number;
  tenant_id: number;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: string;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  items: PayrollItem[];
  created_by: number;
  approved_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollItem {
  id: number;
  payroll_run_id: number;
  employee_id: number;
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  social_security: number;
  medicare: number;
  other_deductions: number;
  net_pay: number;
  hours_worked: number;
  overtime_hours: number;
}

export interface Product {
  id: number;
  tenant_id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit_price: number;
  cost_price: number;
  quantity_on_hand: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_by: number;
  created_at: string;
}

export interface PurchaseOrder {
  id: number;
  tenant_id: number;
  vendor_id: number;
  po_number: string;
  date: string;
  expected_date: string | null;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  items: PurchaseOrderItem[];
  vendor?: Vendor;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  received_quantity: number;
}

export interface SalesOrder {
  id: number;
  tenant_id: number;
  customer_id: number;
  so_number: string;
  date: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  items: SalesOrderItem[];
  customer?: Customer;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderItem {
  id: number;
  sales_order_id: number;
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  shipped_quantity: number;
}

export interface AuditLog {
  id: number;
  tenant_id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
