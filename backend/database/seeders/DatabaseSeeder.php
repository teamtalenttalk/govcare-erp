<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Account;
use App\Models\Contract;
use App\Models\Project;
use App\Models\Vendor;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\CostElement;
use App\Models\LaborCategory;
use App\Models\PayCode;
use App\Models\ExpenseType;
use App\Models\Currency;
use App\Models\PaymentTermsConfig;
use App\Models\Holiday;
use App\Models\Location;
use App\Models\Skill;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo tenant
        $tenant = Tenant::create([
            'name' => 'TalentTalk IT Services',
            'slug' => 'talenttalk',
            'is_active' => true,
        ]);

        $tid = $tenant->id;

        // Create users
        User::create([
            'tenant_id' => $tid,
            'email' => 'admin@demo.com',
            'password' => 'Admin123!',
            'first_name' => 'System',
            'last_name' => 'Admin',
            'role' => 'SUPER_ADMIN',
            'is_active' => true,
        ]);

        User::create([
            'tenant_id' => $tid,
            'email' => 'accountant@demo.com',
            'password' => 'Admin123!',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'role' => 'ACCOUNTANT',
            'is_active' => true,
        ]);

        // Chart of Accounts
        $accounts = [
            ['1000', 'Cash', 'ASSET', 'DEBIT', 'N_A'],
            ['1100', 'Accounts Receivable', 'ASSET', 'DEBIT', 'N_A'],
            ['1200', 'Prepaid Expenses', 'ASSET', 'DEBIT', 'N_A'],
            ['1500', 'Equipment', 'ASSET', 'DEBIT', 'DIRECT'],
            ['2000', 'Accounts Payable', 'LIABILITY', 'CREDIT', 'N_A'],
            ['2100', 'Accrued Liabilities', 'LIABILITY', 'CREDIT', 'N_A'],
            ['2500', 'Notes Payable', 'LIABILITY', 'CREDIT', 'N_A'],
            ['3000', 'Retained Earnings', 'EQUITY', 'CREDIT', 'N_A'],
            ['3100', 'Common Stock', 'EQUITY', 'CREDIT', 'N_A'],
            ['4000', 'Service Revenue', 'REVENUE', 'CREDIT', 'N_A'],
            ['4100', 'Contract Revenue', 'REVENUE', 'CREDIT', 'N_A'],
            ['5000', 'Direct Labor', 'EXPENSE', 'DEBIT', 'DIRECT'],
            ['5100', 'Direct Materials', 'EXPENSE', 'DEBIT', 'DIRECT'],
            ['6000', 'Overhead', 'EXPENSE', 'DEBIT', 'OVERHEAD'],
            ['6100', 'G&A Expense', 'EXPENSE', 'DEBIT', 'GA'],
            ['6200', 'Fringe Benefits', 'EXPENSE', 'DEBIT', 'FRINGE'],
        ];

        foreach ($accounts as $a) {
            Account::create([
                'tenant_id' => $tid,
                'account_number' => $a[0],
                'name' => $a[1],
                'account_type' => $a[2],
                'normal_balance' => $a[3],
                'cost_type' => $a[4],
                'is_active' => true,
            ]);
        }

        // Cost Elements
        $costElements = [
            ['DL', 'Direct Labor'], ['DM', 'Direct Materials'],
            ['SC', 'Subcontracts'], ['OH', 'Overhead'], ['GA', 'G&A'],
        ];
        foreach ($costElements as $ce) {
            CostElement::create(['tenant_id' => $tid, 'code' => $ce[0], 'name' => $ce[1], 'is_active' => true]);
        }

        // Labor Categories
        $laborCats = [
            ['SE', 'Senior Engineer', 175.00, 85.00],
            ['PM', 'Project Manager', 200.00, 95.00],
            ['AN', 'Analyst', 125.00, 65.00],
        ];
        foreach ($laborCats as $lc) {
            LaborCategory::create(['tenant_id' => $tid, 'code' => $lc[0], 'name' => $lc[1], 'billing_rate' => $lc[2], 'cost_rate' => $lc[3], 'is_active' => true]);
        }

        // Pay Codes
        $payCodes = [
            ['REG', 'Regular', 1.00, true],
            ['OT', 'Overtime', 1.50, true],
            ['HOL', 'Holiday', 1.00, false],
        ];
        foreach ($payCodes as $pc) {
            PayCode::create(['tenant_id' => $tid, 'code' => $pc[0], 'name' => $pc[1], 'multiplier' => $pc[2], 'is_billable' => $pc[3], 'is_active' => true]);
        }

        // Expense Types
        $expTypes = [
            ['TRV', 'Travel', true, 5000],
            ['SUP', 'Supplies', false, 500],
        ];
        foreach ($expTypes as $et) {
            ExpenseType::create(['tenant_id' => $tid, 'code' => $et[0], 'name' => $et[1], 'requires_receipt' => $et[2], 'max_amount' => $et[3], 'is_billable' => true, 'is_active' => true]);
        }

        // Currencies
        $currencies = [
            ['USD', 'US Dollar', '$', 1.000000, true],
            ['EUR', 'Euro', "\u{20AC}", 0.920000, false],
            ['GBP', 'British Pound', "\u{00A3}", 0.790000, false],
        ];
        foreach ($currencies as $c) {
            Currency::create(['tenant_id' => $tid, 'code' => $c[0], 'name' => $c[1], 'symbol' => $c[2], 'exchange_rate' => $c[3], 'is_base' => $c[4], 'is_active' => true]);
        }

        // Payment Terms
        $terms = [
            ['NET30', 'Net 30', 30, 0, 0],
            ['NET15', 'Net 15', 15, 0, 0],
            ['2NET10', '2% 10 Net 30', 30, 2.00, 10],
        ];
        foreach ($terms as $t) {
            PaymentTermsConfig::create(['tenant_id' => $tid, 'code' => $t[0], 'name' => $t[1], 'days' => $t[2], 'discount_pct' => $t[3], 'discount_days' => $t[4], 'is_active' => true]);
        }

        // Holidays
        $holidays = [
            ['New Year\'s Day', '2026-01-01'],
            ['Memorial Day', '2026-05-25'],
            ['Independence Day', '2026-07-04'],
            ['Labor Day', '2026-09-07'],
            ['Thanksgiving', '2026-11-26'],
            ['Christmas Day', '2026-12-25'],
        ];
        foreach ($holidays as $h) {
            Holiday::create(['tenant_id' => $tid, 'name' => $h[0], 'date' => $h[1], 'is_paid' => true]);
        }

        // Locations
        $locations = [
            ['HQ', 'Headquarters', 'Washington', 'DC'],
            ['REM', 'Remote Office', 'Austin', 'TX'],
        ];
        foreach ($locations as $l) {
            Location::create(['tenant_id' => $tid, 'code' => $l[0], 'name' => $l[1], 'city' => $l[2], 'state' => $l[3], 'country' => 'US', 'is_active' => true]);
        }

        // Skills
        $skills = [
            ['Project Management', 'MANAGEMENT'],
            ['Cloud Architecture', 'TECHNICAL'],
            ['DCAA Compliance', 'COMPLIANCE'],
        ];
        foreach ($skills as $s) {
            Skill::create(['tenant_id' => $tid, 'name' => $s[0], 'skill_type' => $s[1], 'is_active' => true]);
        }

        // Contracts
        $contract1 = Contract::create([
            'tenant_id' => $tid,
            'contract_number' => 'FA8101-26-C-0001',
            'title' => 'IT Modernization Support',
            'contract_type' => 'COST_PLUS_FIXED_FEE',
            'client_name' => 'Department of Defense',
            'start_date' => '2026-01-01',
            'end_date' => '2027-12-31',
            'total_value' => 2500000,
            'funded_value' => 1200000,
            'ceiling_value' => 2750000,
            'status' => 'ACTIVE',
        ]);

        $contract2 = Contract::create([
            'tenant_id' => $tid,
            'contract_number' => 'GS-35F-0001',
            'title' => 'Cybersecurity Assessment',
            'contract_type' => 'TIME_AND_MATERIAL',
            'client_name' => 'General Services Administration',
            'start_date' => '2026-03-01',
            'end_date' => '2026-12-31',
            'total_value' => 750000,
            'funded_value' => 750000,
            'ceiling_value' => 750000,
            'status' => 'ACTIVE',
        ]);

        // Projects
        Project::create([
            'tenant_id' => $tid,
            'contract_id' => $contract1->id,
            'project_number' => 'PRJ-001',
            'name' => 'Cloud Migration Phase 1',
            'status' => 'ACTIVE',
            'start_date' => '2026-01-15',
            'end_date' => '2026-06-30',
            'budget_total' => 600000,
        ]);

        Project::create([
            'tenant_id' => $tid,
            'contract_id' => $contract2->id,
            'project_number' => 'PRJ-002',
            'name' => 'Security Audit',
            'status' => 'ACTIVE',
            'start_date' => '2026-03-01',
            'end_date' => '2026-08-31',
            'budget_total' => 350000,
        ]);

        // Vendors
        $vendorData = [
            ['V-001', 'CloudTech Solutions', 'Mike Johnson', 'mike@cloudtech.com'],
            ['V-002', 'SecureNet Inc', 'Sarah Chen', 'sarah@securenet.com'],
            ['V-003', 'DataCore Systems', 'James Wilson', 'james@datacore.com'],
        ];
        foreach ($vendorData as $v) {
            Vendor::create(['tenant_id' => $tid, 'vendor_number' => $v[0], 'name' => $v[1], 'contact_name' => $v[2], 'email' => $v[3], 'is_active' => true]);
        }

        // Customers
        $customerData = [
            ['C-001', 'Department of Defense', 'Col. Roberts', 'roberts@dod.mil'],
            ['C-002', 'GSA Federal', 'Linda Thompson', 'lthompson@gsa.gov'],
        ];
        foreach ($customerData as $c) {
            Customer::create(['tenant_id' => $tid, 'customer_number' => $c[0], 'name' => $c[1], 'contact_name' => $c[2], 'email' => $c[3], 'is_active' => true]);
        }

        // Employees
        $employeeData = [
            ['EMP-001', 'John', 'Anderson', 'Engineering', 'Senior Developer', 95.00],
            ['EMP-002', 'Maria', 'Garcia', 'Security', 'Security Analyst', 85.00],
            ['EMP-003', 'Robert', 'Taylor', 'Management', 'Program Manager', 110.00],
            ['EMP-004', 'Lisa', 'Wang', 'Engineering', 'Cloud Architect', 120.00],
        ];
        foreach ($employeeData as $e) {
            Employee::create([
                'tenant_id' => $tid,
                'employee_number' => $e[0],
                'first_name' => $e[1],
                'last_name' => $e[2],
                'department' => $e[3],
                'job_title' => $e[4],
                'pay_rate' => $e[5],
                'employment_type' => 'FULL_TIME',
                'employment_status' => 'ACTIVE',
                'hire_date' => '2025-01-15',
                'pay_frequency' => 'BIWEEKLY',
            ]);
        }
    }
}
