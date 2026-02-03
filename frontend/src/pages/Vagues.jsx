import { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { vagueService, niveauService, referenceService, userService } from '@/services/api';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import Input from '@/components/ui/Input';
import { getStatusLabel, getStatusColor, formatShortDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Vagues() {
  const [vagues, setVagues] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [salles, setSalles] = useState([]);
  const [horaires, setHoraires] = useState([]);
  const [jours, setJours] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVague, setSelectedVague] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [vagueDetails, setVagueDetails] = useState(null);

  const [formData, setFormData] = useState({
    nom: '',
    niveau_id: '',
    enseignant_id: '',
    salle_id: '',
    date_debut: '',
    date_fin: '',
    horaire_id: '',
    jour_id: '',
    capacite_max: 20,
    statut: 'planifie',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vaguesRes, niveauxRes, sallesRes, horairesRes, joursRes, enseignantsRes] = await Promise.all([
        vagueService.getAll(),
        niveauService.getAll(),
        referenceService.getSalles(),
        referenceService.getHoraires(),
        referenceService.getJours(),
        userService.getProfesseurs(),
      ]);

      setVagues(vaguesRes.data);
      setNiveaux(niveauxRes.data);
      setSalles(sallesRes.data);
      setHoraires(horairesRes.data);
      setJours(joursRes.data);
      setEnseignants(enseignantsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vague = null) => {
    if (vague) {
      setSelectedVague(vague);
      setFormData({
        nom: vague.nom,
        niveau_id: vague.niveau_id,
        enseignant_id: vague.enseignant_id || '',
        salle_id: vague.salle_id || '',
        date_debut: vague.date_debut,
        date_fin: vague.date_fin,
        horaire_id: vague.horaire_id || '',
        jour_id: vague.jour_id || '',
        capacite_max: vague.capacite_max,
        statut: vague.statut,
      });
    } else {
      setSelectedVague(null);
      setFormData({
        nom: '',
        niveau_id: '',
        enseignant_id: '',
        salle_id: '',
        date_debut: '',
        date_fin: '',
        horaire_id: '',
        jour_id: '',
        capacite_max: 20,
        statut: 'planifie',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedVague) {
        await vagueService.update(selectedVague.id, formData);
        toast.success('Vague modifiée avec succès');
      } else {
        await vagueService.create(formData);
        toast.success('Vague créée avec succès');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleViewDetails = async (vague) => {
    try {
      const response = await vagueService.getById(vague.id);
      setVagueDetails(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vagues</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle vague
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableHead>Nom</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>Enseignant</TableHead>
            <TableHead>Salle</TableHead>
            <TableHead>Date début</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Inscrits</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {vagues.map((vague) => (
              <TableRow key={vague.id}>
                <TableCell className="font-medium">{vague.nom}</TableCell>
                <TableCell>{vague.niveau_code}</TableCell>
                <TableCell>{vague.enseignant_nom ? `${vague.enseignant_prenom} ${vague.enseignant_nom}` : '-'}</TableCell>
                <TableCell>{vague.salle_nom || '-'}</TableCell>
                <TableCell>{formatShortDate(vague.date_debut)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(vague.statut)}>
                    {getStatusLabel(vague.statut)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {vague.nb_inscrits} / {vague.capacite_max}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewDetails(vague)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedVague ? 'Modifier la vague' : 'Nouvelle vague'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={handleSubmit}>
              {selectedVague ? 'Modifier' : 'Créer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom de la vague"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Niveau"
              value={formData.niveau_id}
              onChange={(e) => setFormData({ ...formData, niveau_id: e.target.value })}
              options={niveaux.map(n => ({ value: n.id, label: `${n.code} - ${n.nom}` }))}
              required
            />
            <Select
              label="Enseignant"
              value={formData.enseignant_id}
              onChange={(e) => setFormData({ ...formData, enseignant_id: e.target.value })}
              options={enseignants.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Salle"
              value={formData.salle_id}
              onChange={(e) => setFormData({ ...formData, salle_id: e.target.value })}
              options={salles.map(s => ({ value: s.id, label: s.nom }))}
            />
            <Input
              label="Capacité maximale"
              type="number"
              value={formData.capacite_max}
              onChange={(e) => setFormData({ ...formData, capacite_max: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Jour"
              value={formData.jour_id}
              onChange={(e) => setFormData({ ...formData, jour_id: e.target.value })}
              options={jours.map(j => ({ value: j.id, label: j.nom }))}
            />
            <Select
              label="Horaire"
              value={formData.horaire_id}
              onChange={(e) => setFormData({ ...formData, horaire_id: e.target.value })}
              options={horaires.map(h => ({ value: h.id, label: h.libelle || `${h.heure_debut} - ${h.heure_fin}` }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de début"
              type="date"
              value={formData.date_debut}
              onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
              required
            />
            <Input
              label="Date de fin"
              type="date"
              value={formData.date_fin}
              onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
              required
            />
          </div>
          <Select
            label="Statut"
            value={formData.statut}
            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            options={[
              { value: 'planifie', label: 'Planifié' },
              { value: 'en_cours', label: 'En cours' },
              { value: 'termine', label: 'Terminé' },
              { value: 'annule', label: 'Annulé' },
            ]}
            required
          />
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails de la vague"
        size="lg"
      >
        {vagueDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-medium">{vagueDetails.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Niveau</p>
                <p className="font-medium">{vagueDetails.niveau_code} - {vagueDetails.niveau_nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Enseignant</p>
                <p className="font-medium">
                  {vagueDetails.enseignant_nom ? `${vagueDetails.enseignant_prenom} ${vagueDetails.enseignant_nom}` : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Salle</p>
                <p className="font-medium">{vagueDetails.salle_nom || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Horaire</p>
                <p className="font-medium">
                  {vagueDetails.jour_nom && `${vagueDetails.jour_nom}, `}
                  {vagueDetails.heure_debut} - {vagueDetails.heure_fin}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Capacité</p>
                <p className="font-medium">{vagueDetails.nb_inscrits} / {vagueDetails.capacite_max}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date début</p>
                <p className="font-medium">{formatShortDate(vagueDetails.date_debut)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date fin</p>
                <p className="font-medium">{formatShortDate(vagueDetails.date_fin)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
