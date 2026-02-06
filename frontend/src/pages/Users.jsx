import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { userService } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { getRoleLabel } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    actif: '',
    search: '',
  });

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    role: 'etudiant',
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll(filters);
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone || '',
        password: '',
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        role: 'etudiant',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, formData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await userService.create(formData);
        toast.success('Utilisateur créé avec succès');
      }
      handleCloseModal();
      loadUsers();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.toggleActive(user.id);
      toast.success(`Utilisateur ${user.actif ? 'désactivé' : 'activé'} avec succès`);
      loadUsers();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur?')) return;

    try {
      await userService.delete(user.id);
      toast.success('Utilisateur désactivé avec succès');
      loadUsers();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            containerClassName="mb-0"
          />
          <Select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            options={[
              { value: 'admin', label: 'Administrateur' },
              { value: 'secretaire', label: 'Secrétaire' },
              { value: 'enseignant', label: 'Enseignant' },
              { value: 'etudiant', label: 'Étudiant' },
            ]}
            placeholder="Tous les rôles"
            containerClassName="mb-0"
          />
          <Select
            value={filters.actif}
            onChange={(e) => setFilters({ ...filters, actif: e.target.value })}
            options={[
              { value: 'true', label: 'Actifs' },
              { value: 'false', label: 'Inactifs' },
            ]}
            placeholder="Tous les statuts"
            containerClassName="mb-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableHead>Nom complet</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.prenom} {user.nom}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.telephone || '-'}</TableCell>
                <TableCell>
                  <Badge variant="primary">{getRoleLabel(user.role)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.actif ? 'success' : 'danger'}>
                    {user.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      {user.actif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {selectedUser ? 'Modifier' : 'Créer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
            <Input
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Téléphone"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
          {!selectedUser && (
            <Input
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <Select
            label="Rôle"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'admin', label: 'Administrateur' },
              { value: 'secretaire', label: 'Secrétaire' },
              { value: 'enseignant', label: 'Enseignant' },
            ]}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
