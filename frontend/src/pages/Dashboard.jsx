import { useEffect, useState } from 'react';
import { Users, BookOpen, DollarSign, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store';
import { userService, vagueService, financeService, niveauService } from '@/services/api';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { formatCurrency } from '@/utils/helpers';

function StatCard({ title, value, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${colors[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    users: null,
    vagues: null,
    finances: null,
    niveaux: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const promises = [];

      if (user?.role === 'admin' || user?.role === 'secretaire') {
        promises.push(
          userService.getStats(),
          vagueService.getAll({ limit: 1 }),
          financeService.getStats(),
          niveauService.getStats()
        );

        const [usersData, vaguesData, financesData, niveauxData] = await Promise.all(promises);

        setStats({
          users: usersData.data,
          vagues: vaguesData,
          finances: financesData.data,
          niveaux: niveauxData.data,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  // Dashboard pour les étudiants
  if (user?.role === 'etudiant') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Bienvenue, {user.prenom}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Mes informations">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Email: {user.email}</p>
              <p className="text-sm text-gray-600">Téléphone: {user.telephone}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard pour les enseignants
  if (user?.role === 'enseignant') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Bienvenue, {user.prenom}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Mes cours">
            <p className="text-sm text-gray-600">
              Consultez vos vagues dans la section "Vagues"
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard pour admin et secrétaire
  const totalUsers = stats.users?.reduce((acc, item) => acc + parseInt(item.total), 0) || 0;
  const activeUsers = stats.users?.reduce((acc, item) => acc + parseInt(item.actifs), 0) || 0;
  const totalEtudiants = stats.users?.find(item => item.role === 'etudiant')?.total || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Tableau de bord
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total utilisateurs"
          value={totalUsers}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Étudiants"
          value={totalEtudiants}
          icon={GraduationCap}
          color="green"
        />
        <StatCard
          title="Vagues actives"
          value={stats.vagues?.pagination?.totalItems || 0}
          icon={BookOpen}
          color="yellow"
        />
        <StatCard
          title="Montant total"
          value={formatCurrency(stats.finances?.montant_total_attendu || 0)}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Additional info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Statistiques utilisateurs">
          <div className="space-y-3">
            {stats.users?.map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.role}</span>
                <div className="text-sm font-medium">
                  <span className="text-green-600">{item.actifs}</span>
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-900">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Statistiques financières">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Montant attendu</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(stats.finances?.montant_total_attendu || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Montant payé</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(stats.finances?.montant_total_paye || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reste à payer</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(stats.finances?.montant_total_restant || 0)}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Écolages payés</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.finances?.nb_payes || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
