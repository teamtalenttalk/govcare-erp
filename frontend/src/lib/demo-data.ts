// Demo data for GitHub Pages deployment (no API needed)

export const DEMO_MODE = !import.meta.env.VITE_API_URL && import.meta.env.PROD;

export const DEMO_USER = {
  id: "demo-001",
  first_name: "System",
  last_name: "Admin",
  email: "admin@demo.com",
  role: "SUPER_ADMIN",
  tenant_id: "demo-tenant",
  is_active: true,
};

function paginate(items: any[], page = 1, perPage = 25) {
  const start = (page - 1) * perPage;
  return {
    current_page: page, data: items.slice(start, start + perPage),
    last_page: Math.ceil(items.length / perPage) || 1, per_page: perPage,
    total: items.length, from: start + 1, to: Math.min(start + perPage, items.length),
  };
}

const accounts = [
  { id: "a1", account_number: "1000", name: "Cash", account_type: "ASSET", normal_balance: "DEBIT", cost_type: "N_A", is_active: true },
  { id: "a2", account_number: "1100", name: "Accounts Receivable", account_type: "ASSET", normal_balance: "DEBIT", cost_type: "N_A", is_active: true },
  { id: "a3", account_number: "1200", name: "Prepaid Expenses", account_type: "ASSET", normal_balance: "DEBIT", cost_type: "N_A", is_active: true },
  { id: "a4", account_number: "1500", name: "Equipment", account_type: "ASSET", normal_balance: "DEBIT", cost_type: "DIRECT", is_active: true },
  { id: "a5", account_number: "2000", name: "Accounts Payable", account_type: "LIABILITY", normal_balance: "CREDIT", cost_type: "N_A", is_active: true },
  { id: "a6", account_number: "2100", name: "Accrued Liabilities", account_type: "LIABILITY", normal_balance: "CREDIT", cost_type: "N_A", is_active: true },
  { id: "a7", account_number: "3000", name: "Retained Earnings", account_type: "EQUITY", normal_balance: "CREDIT", cost_type: "N_A", is_active: true },
  { id: "a8", account_number: "4000", name: "Service Revenue", account_type: "REVENUE", normal_balance: "CREDIT", cost_type: "N_A", is_active: true },
  { id: "a9", account_number: "4100", name: "Contract Revenue", account_type: "REVENUE", normal_balance: "CREDIT", cost_type: "N_A", is_active: true },
  { id: "a10", account_number: "5000", name: "Direct Labor", account_type: "EXPENSE", normal_balance: "DEBIT", cost_type: "DIRECT", is_active: true },
  { id: "a11", account_number: "5100", name: "Direct Materials", account_type: "EXPENSE", normal_balance: "DEBIT", cost_type: "DIRECT", is_active: true },
  { id: "a12", account_number: "6000", name: "Overhead", account_type: "EXPENSE", normal_balance: "DEBIT", cost_type: "INDIRECT", is_active: true },
  { id: "a13", account_number: "6100", name: "G&A Expense", account_type: "EXPENSE", normal_balance: "DEBIT", cost_type: "INDIRECT", is_active: true },
];

const vendors = [
  { id: "v1", vendor_number: "V-001", name: "CloudTech Solutions", contact_name: "Mike Johnson", email: "mike@cloudtech.com", phone: "(555) 123-4567", payment_terms: "Net 30", is_active: true },
  { id: "v2", vendor_number: "V-002", name: "SecureNet Inc", contact_name: "Sarah Chen", email: "sarah@securenet.com", phone: "(555) 234-5678", payment_terms: "Net 45", is_active: true },
  { id: "v3", vendor_number: "V-003", name: "DataCore Systems", contact_name: "James Wilson", email: "james@datacore.com", phone: "(555) 345-6789", payment_terms: "Net 30", is_active: true },
];

const customers = [
  { id: "c1", customer_number: "C-001", name: "Department of Defense", contact_name: "Col. Roberts", email: "roberts@dod.mil", credit_limit: 5000000, is_active: true },
  { id: "c2", customer_number: "C-002", name: "NASA Goddard", contact_name: "Dr. Martinez", email: "martinez@nasa.gov", credit_limit: 2000000, is_active: true },
  { id: "c3", customer_number: "C-003", name: "DHS Cybersecurity", contact_name: "Agent Park", email: "park@dhs.gov", credit_limit: 3000000, is_active: true },
];

const contracts = [
  { id: "ct1", contract_number: "FA8101-26-C-0001", title: "IT Modernization Support", contract_type: "COST_PLUS_FIXED_FEE", client_name: "Department of Defense", start_date: "2026-01-01", end_date: "2027-12-31", total_value: 2500000, funded_value: 1200000, status: "ACTIVE" },
  { id: "ct2", contract_number: "NNG26-0045-T", title: "Data Analytics Platform", contract_type: "TIME_AND_MATERIALS", client_name: "NASA Goddard", start_date: "2026-03-01", end_date: "2026-12-31", total_value: 800000, funded_value: 800000, status: "ACTIVE" },
  { id: "ct3", contract_number: "70CMSD26-F-0012", title: "Cybersecurity Assessment", contract_type: "FIRM_FIXED_PRICE", client_name: "DHS Cybersecurity", start_date: "2026-02-15", end_date: "2026-08-15", total_value: 450000, funded_value: 450000, status: "ACTIVE" },
];

const projects = [
  { id: "p1", project_number: "PRJ-001", name: "Cloud Migration Phase 1", status: "ACTIVE", start_date: "2026-01-15", end_date: "2026-06-30", budget_total: 600000, contract_id: "ct1", contract: { title: "IT Modernization Support", contract_number: "FA8101-26-C-0001" } },
  { id: "p2", project_number: "PRJ-002", name: "Data Lake Implementation", status: "ACTIVE", start_date: "2026-03-01", end_date: "2026-09-30", budget_total: 350000, contract_id: "ct2", contract: { title: "Data Analytics Platform" } },
  { id: "p3", project_number: "PRJ-003", name: "Network Security Audit", status: "ACTIVE", start_date: "2026-02-15", end_date: "2026-05-15", budget_total: 150000, contract_id: "ct3", contract: { title: "Cybersecurity Assessment" } },
];

const employees = [
  { id: "e1", employee_number: "EMP-001", first_name: "John", last_name: "Anderson", email: "john.anderson@talenttalk.com", department: "Engineering", job_title: "Senior Developer", employment_type: "FULL_TIME", employment_status: "ACTIVE", hire_date: "2025-01-15", pay_rate: 95 },
  { id: "e2", employee_number: "EMP-002", first_name: "Maria", last_name: "Garcia", email: "maria.garcia@talenttalk.com", department: "Security", job_title: "Security Analyst", employment_type: "FULL_TIME", employment_status: "ACTIVE", hire_date: "2025-03-01", pay_rate: 85 },
  { id: "e3", employee_number: "EMP-003", first_name: "Robert", last_name: "Taylor", email: "robert.taylor@talenttalk.com", department: "Management", job_title: "Program Manager", employment_type: "FULL_TIME", employment_status: "ACTIVE", hire_date: "2024-06-15", pay_rate: 110 },
  { id: "e4", employee_number: "EMP-004", first_name: "Lisa", last_name: "Wang", email: "lisa.wang@talenttalk.com", department: "Engineering", job_title: "Cloud Architect", employment_type: "FULL_TIME", employment_status: "ACTIVE", hire_date: "2025-02-01", pay_rate: 120 },
  { id: "e5", employee_number: "EMP-005", first_name: "David", last_name: "Chen", email: "david.chen@talenttalk.com", department: "Finance", job_title: "Staff Accountant", employment_type: "FULL_TIME", employment_status: "ACTIVE", hire_date: "2025-04-15", pay_rate: 75 },
];

const journalEntries = [
  { id: "je1", entry_number: "JE-2026-001", date: "2026-04-01", description: "Monthly payroll accrual", status: "posted", total_debit: 45000, total_credit: 45000 },
  { id: "je2", entry_number: "JE-2026-002", date: "2026-04-05", description: "Vendor payment - CloudTech Solutions", status: "posted", total_debit: 15000, total_credit: 15000 },
  { id: "je3", entry_number: "JE-2026-003", date: "2026-04-10", description: "Revenue recognition - DoD contract", status: "posted", total_debit: 125000, total_credit: 125000 },
  { id: "je4", entry_number: "JE-2026-004", date: "2026-04-15", description: "Office supplies purchase", status: "draft", total_debit: 3500, total_credit: 3500 },
];

const bills = [
  { id: "b1", bill_number: "BILL-001", vendor_id: "v1", vendor: vendors[0], bill_date: "2026-04-01", due_date: "2026-05-01", total_amount: 15000, amount_paid: 15000, status: "PAID" },
  { id: "b2", bill_number: "BILL-002", vendor_id: "v2", vendor: vendors[1], bill_date: "2026-04-10", due_date: "2026-05-25", total_amount: 8500, amount_paid: 0, status: "APPROVED" },
];

const invoices = [
  { id: "i1", invoice_number: "INV-2026-001", customer_id: "c1", customer: customers[0], invoice_date: "2026-04-01", due_date: "2026-05-01", total_amount: 125000, amount_paid: 125000, status: "PAID" },
  { id: "i2", invoice_number: "INV-2026-002", customer_id: "c2", customer: customers[1], invoice_date: "2026-04-15", due_date: "2026-05-15", total_amount: 65000, amount_paid: 0, status: "SENT" },
];

const setupData: Record<string, any[]> = {
  'cost-elements': [
    { id: "s1", code: "DL", name: "Direct Labor", is_active: true },
    { id: "s2", code: "DM", name: "Direct Materials", is_active: true },
    { id: "s3", code: "SC", name: "Subcontracts", is_active: true },
    { id: "s4", code: "OH", name: "Overhead", is_active: true },
    { id: "s5", code: "GA", name: "G&A", is_active: true },
  ],
  'labor-categories': [
    { id: "s9", code: "SE-III", name: "Senior Engineer III", is_active: true },
    { id: "s10", code: "PM-II", name: "Program Manager II", is_active: true },
  ],
};

const timesheets = [
  { id: "t1", timesheet_number: "TS-W15-001", employee_id: "e1", employee: employees[0], project_id: "p1", project: projects[0], week_ending: "2026-04-12", total_hours: 40, status: "APPROVED" },
  { id: "t2", timesheet_number: "TS-W15-002", employee_id: "e2", employee: employees[1], project_id: "p3", project: projects[2], week_ending: "2026-04-12", total_hours: 38, status: "APPROVED" },
];

const auditLogs = [
  { id: "al1", action: "LOGIN", entity_type: "User", entity_id: "demo-001", ip_address: "192.168.1.100", created_at: "2026-04-20T09:00:00Z", user: DEMO_USER },
  { id: "al2", action: "CREATE", entity_type: "JournalEntry", entity_id: "je4", ip_address: "192.168.1.100", created_at: "2026-04-20T09:15:00Z", user: DEMO_USER },
  { id: "al3", action: "UPDATE", entity_type: "Account", entity_id: "a4", ip_address: "192.168.1.100", created_at: "2026-04-20T10:30:00Z", user: DEMO_USER },
];

const trialBalanceData = {
  accounts: [
    { account_id: 1, account_number: "1000", account_name: "Cash", account_type: "ASSET", debit_balance: "485000.00", credit_balance: "0.00" },
    { account_id: 2, account_number: "1100", account_name: "Accounts Receivable", account_type: "ASSET", debit_balance: "190000.00", credit_balance: "0.00" },
    { account_id: 3, account_number: "1200", account_name: "Prepaid Expenses", account_type: "ASSET", debit_balance: "12000.00", credit_balance: "0.00" },
    { account_id: 4, account_number: "1500", account_name: "Equipment", account_type: "ASSET", debit_balance: "75000.00", credit_balance: "0.00" },
    { account_id: 5, account_number: "2000", account_name: "Accounts Payable", account_type: "LIABILITY", debit_balance: "0.00", credit_balance: "45000.00" },
    { account_id: 6, account_number: "2100", account_name: "Accrued Liabilities", account_type: "LIABILITY", debit_balance: "0.00", credit_balance: "32000.00" },
    { account_id: 7, account_number: "3000", account_name: "Retained Earnings", account_type: "EQUITY", debit_balance: "0.00", credit_balance: "250000.00" },
    { account_id: 8, account_number: "4000", account_name: "Service Revenue", account_type: "REVENUE", debit_balance: "0.00", credit_balance: "325000.00" },
    { account_id: 9, account_number: "4100", account_name: "Contract Revenue", account_type: "REVENUE", debit_balance: "0.00", credit_balance: "190000.00" },
    { account_id: 10, account_number: "5000", account_name: "Direct Labor", account_type: "EXPENSE", debit_balance: "45000.00", credit_balance: "0.00" },
    { account_id: 11, account_number: "5100", account_name: "Direct Materials", account_type: "EXPENSE", debit_balance: "12000.00", credit_balance: "0.00" },
    { account_id: 12, account_number: "6000", account_name: "Overhead", account_type: "EXPENSE", debit_balance: "15000.00", credit_balance: "0.00" },
    { account_id: 13, account_number: "6100", account_name: "G&A Expense", account_type: "EXPENSE", debit_balance: "8000.00", credit_balance: "0.00" },
  ],
};

const balanceSheetData = {
  assets: [
    { account_number: "1000", name: "Cash", balance: 485000 },
    { account_number: "1100", name: "Accounts Receivable", balance: 190000 },
    { account_number: "1200", name: "Prepaid Expenses", balance: 12000 },
    { account_number: "1500", name: "Equipment", balance: 75000 },
  ],
  liabilities: [
    { account_number: "2000", name: "Accounts Payable", balance: 45000 },
    { account_number: "2100", name: "Accrued Liabilities", balance: 32000 },
  ],
  equity: [
    { account_number: "3000", name: "Retained Earnings", balance: 250000 },
    { account_number: "3100", name: "Current Year Earnings", balance: 435000 },
  ],
  total_assets: 762000, total_liabilities: 77000, total_equity: 685000,
};

const incomeStatementData = {
  revenue: [
    { account_number: "4000", name: "Service Revenue", amount: 325000 },
    { account_number: "4100", name: "Contract Revenue", amount: 190000 },
  ],
  expenses: [
    { account_number: "5000", name: "Direct Labor", amount: 45000 },
    { account_number: "5100", name: "Direct Materials", amount: 12000 },
    { account_number: "6000", name: "Overhead", amount: 15000 },
    { account_number: "6100", name: "G&A Expense", amount: 8000 },
  ],
  total_revenue: 515000, total_expenses: 80000, net_income: 435000,
};

export function getDemoResponse(url: string, method: string): any {
  const path = url.replace(/^\/api/, '').replace(/\?.*$/, '');
  if (method === 'POST' && path === '/login') return { token: "demo-token", user: DEMO_USER };
  if (method !== 'GET') return { message: 'Success' };

  // Report endpoints
  if (path === '/reports/trial-balance') return trialBalanceData;
  if (path === '/reports/balance-sheet') return balanceSheetData;
  if (path === '/reports/income-statement') return incomeStatementData;

  const routes: Record<string, any[]> = {
    '/accounts': accounts, '/vendors': vendors, '/customers': customers, '/contracts': contracts,
    '/projects': projects, '/employees': employees, '/journal-entries': journalEntries,
    '/bills': bills, '/invoices': invoices, '/timesheets': timesheets, '/tasks': [],
    '/expenses': [], '/leaves': [], '/payroll': [], '/purchase-orders': [], '/sales-orders': [],
    '/audit-logs': auditLogs, '/users': [DEMO_USER], '/products': [],
  };

  if (path === '/admin/entities') return { entities: [] };
  if (path.startsWith('/admin/')) return paginate(setupData[path.replace('/admin/', '')] || []);
  for (const [route, data] of Object.entries(routes)) {
    if (path === route) return paginate(data);
    if (path.startsWith(route + '/')) return data[0] || {};
  }
  return paginate([]);
}
