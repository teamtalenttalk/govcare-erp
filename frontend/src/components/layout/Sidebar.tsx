import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  FileText,
  Landmark,
  FolderKanban,
  Briefcase,
  ListTodo,
  Clock,
  Receipt,
  Building2,
  CreditCard,
  Users,
  FileBarChart,
  UserCircle,
  CalendarDays,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../lib/auth';
import type { User } from '../../types';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    title: 'ACCOUNTING',
    items: [
      { label: 'Chart of Accounts', path: '/chart-of-accounts', icon: <BookOpen className="h-4 w-4" /> },
      { label: 'Journal Entries', path: '/journal-entries', icon: <FileText className="h-4 w-4" /> },
      { label: 'General Ledger', path: '/general-ledger', icon: <Landmark className="h-4 w-4" /> },
    ],
  },
  {
    title: 'PROJECTS',
    items: [
      { label: 'Contracts', path: '/contracts', icon: <FolderKanban className="h-4 w-4" /> },
      { label: 'Projects', path: '/projects', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Tasks', path: '/tasks', icon: <ListTodo className="h-4 w-4" /> },
    ],
  },
  {
    title: 'TIME & EXPENSE',
    items: [
      { label: 'Timesheets', path: '/timesheets', icon: <Clock className="h-4 w-4" /> },
      { label: 'Expenses', path: '/expenses', icon: <Receipt className="h-4 w-4" /> },
    ],
  },
  {
    title: 'AP/AR',
    items: [
      { label: 'Vendors', path: '/vendors', icon: <Building2 className="h-4 w-4" /> },
      { label: 'Bills', path: '/bills', icon: <CreditCard className="h-4 w-4" /> },
      { label: 'Customers', path: '/customers', icon: <Users className="h-4 w-4" /> },
      { label: 'Invoices', path: '/invoices', icon: <FileBarChart className="h-4 w-4" /> },
    ],
  },
  {
    title: 'HR & PAYROLL',
    items: [
      { label: 'Employees', path: '/employees', icon: <UserCircle className="h-4 w-4" /> },
      { label: 'Leaves', path: '/leaves', icon: <CalendarDays className="h-4 w-4" /> },
      { label: 'Payroll', path: '/payroll', icon: <DollarSign className="h-4 w-4" /> },
    ],
  },
  {
    title: 'INVENTORY',
    items: [
      { label: 'Products', path: '/products', icon: <Package className="h-4 w-4" /> },
      { label: 'Purchase Orders', path: '/purchase-orders', icon: <ShoppingCart className="h-4 w-4" /> },
      { label: 'Sales Orders', path: '/sales-orders', icon: <Truck className="h-4 w-4" /> },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { label: 'Reports Center', path: '/reports', icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Audit Log', path: '/audit-log', icon: <ScrollText className="h-4 w-4" /> },
      { label: 'Users', path: '/users', icon: <Users className="h-4 w-4" /> },
      { label: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();

  const getInitials = (u: User) => {
    return `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="flex h-screen w-[250px] flex-col border-r border-border bg-card">
      {/* Branding */}
      <div className="flex items-center gap-2 px-4 py-5">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-sm font-bold text-foreground">GovCare ERP</h1>
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground">
            COMPLIANCE SUITE
          </p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-1 px-2 text-[10px] font-semibold tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User section */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-xs text-primary">
            {user ? getInitials(user) : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium text-foreground">
            {user ? `${user.first_name} ${user.last_name}` : 'User'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.role || 'Role'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => logout()}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
