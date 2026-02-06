import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Building,
  House,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/helpers';

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const { user } = useAuthStore();

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'secretaire', 'enseignant', 'etudiant'],
    },
    {
      name: 'Utilisateurs',
      href: '/users',
      icon: Users,
      roles: ['admin', 'secretaire'],
    },
    {
      name: 'Vagues',
      href: '/vagues',
      icon: BookOpen,
      roles: ['admin', 'secretaire', 'enseignant'],
    },
    {
      name: 'Niveaux',
      href: '/niveaux',
      icon: GraduationCap,
      roles: ['admin', 'secretaire'],
    },
    {
      name: 'Planning',
      href: '/planning',
      icon: Calendar,
      roles: ['admin', 'secretaire', 'enseignant'],
    },
    {
      name: 'Finances',
      href: '/finances',
      icon: DollarSign,
      roles: ['admin', 'secretaire'],
    },
    {
      name: 'Mes cours',
      href: '/mes-cours',
      icon: BookOpen,
      roles: ['etudiant'],
    },
    {
      name: 'Salles',
      href: '/salles',
      icon: House,
      roles: ['admin', 'secretaire', 'enseignant', 'etudiant'],
    },
    {
      name: 'Référence',
      href: '/reference',
      icon: Building,
      roles: ['admin', 'secretaire'],
    },
    {
      name: 'Paramètres',
      href: '/settings',
      icon: Settings,
      roles: ['admin', 'secretaire', 'enseignant', 'etudiant'],
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">Gestion Vagues</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            {user?.prenom} {user?.nom}
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
