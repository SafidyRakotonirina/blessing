import { useEffect, useState } from 'react';
import { vagueService } from '@/services/api';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { getStatusColor, getStatusLabel } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Planning() {
  const [planning, setPlanning] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlanning();
  }, []);

  const loadPlanning = async () => {
    setLoading(true);
    try {
      const response = await vagueService.getPlanning();
      setPlanning(response.data.liste || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du planning');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Planning</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 gap-4">
            {planning.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune vague planifiée</p>
            ) : (
              planning.map((vague) => (
                <div key={vague.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{vague.nom}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {vague.niveau_code} • {vague.salle_nom}
                      </p>
                      <p className="text-sm text-gray-600">
                        {vague.jour_nom}, {vague.heure_debut} - {vague.heure_fin}
                      </p>
                      <p className="text-sm text-gray-600">
                        Enseignant: {vague.enseignant_nom ? `${vague.enseignant_prenom} ${vague.enseignant_nom}` : '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(vague.statut)}>
                        {getStatusLabel(vague.statut)}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        {vague.nb_inscrits} / {vague.capacite_max} inscrits
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
