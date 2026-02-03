import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { niveauService } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import Loading from '@/components/ui/Loading';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Niveaux() {
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedNiveau, setSelectedNiveau] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    frais_inscription: 0,
    frais_ecolage: 0,
    frais_livre: 0,
    duree_mois: 2,
  });

  useEffect(() => {
    loadNiveaux();
  }, []);

  const loadNiveaux = async () => {
    setLoading(true);
    try {
      const response = await niveauService.getAll();
      setNiveaux(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (niveau = null) => {
    if (niveau) {
      setSelectedNiveau(niveau);
      setFormData({
        code: niveau.code,
        nom: niveau.nom,
        description: niveau.description || '',
        frais_inscription: niveau.frais_inscription,
        frais_ecolage: niveau.frais_ecolage,
        frais_livre: niveau.frais_livre,
        duree_mois: niveau.duree_mois,
      });
    } else {
      setSelectedNiveau(null);
      setFormData({
        code: '',
        nom: '',
        description: '',
        frais_inscription: 0,
        frais_ecolage: 0,
        frais_livre: 0,
        duree_mois: 2,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedNiveau) {
        await niveauService.update(selectedNiveau.id, formData);
        toast.success('Niveau modifié avec succès');
      } else {
        await niveauService.create(formData);
        toast.success('Niveau créé avec succès');
      }
      setShowModal(false);
      loadNiveaux();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (niveau) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce niveau?')) return;

    try {
      await niveauService.delete(niveau.id);
      toast.success('Niveau supprimé avec succès');
      loadNiveaux();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Niveaux</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau niveau
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableHead>Code</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Frais inscription</TableHead>
            <TableHead>Frais écolage</TableHead>
            <TableHead>Frais livre</TableHead>
            <TableHead>Durée (mois)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {niveaux.map((niveau) => (
              <TableRow key={niveau.id}>
                <TableCell className="font-medium">{niveau.code}</TableCell>
                <TableCell>{niveau.nom}</TableCell>
                <TableCell>{formatCurrency(niveau.frais_inscription)}</TableCell>
                <TableCell>{formatCurrency(niveau.frais_ecolage)}</TableCell>
                <TableCell>{formatCurrency(niveau.frais_livre)}</TableCell>
                <TableCell>{niveau.duree_mois}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(niveau)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(niveau)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedNiveau ? 'Modifier le niveau' : 'Nouveau niveau'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={handleSubmit}>{selectedNiveau ? 'Modifier' : 'Créer'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="A1, B2..."
              required
            />
            <Input
              label="Durée (mois)"
              type="number"
              value={formData.duree_mois}
              onChange={(e) => setFormData({ ...formData, duree_mois: e.target.value })}
              required
            />
          </div>
          <Input
            label="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Frais inscription"
              type="number"
              step="0.01"
              value={formData.frais_inscription}
              onChange={(e) => setFormData({ ...formData, frais_inscription: e.target.value })}
              required
            />
            <Input
              label="Frais écolage"
              type="number"
              step="0.01"
              value={formData.frais_ecolage}
              onChange={(e) => setFormData({ ...formData, frais_ecolage: e.target.value })}
              required
            />
            <Input
              label="Frais livre"
              type="number"
              step="0.01"
              value={formData.frais_livre}
              onChange={(e) => setFormData({ ...formData, frais_livre: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
