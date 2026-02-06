import { useEffect, useState } from "react";
import { Plus, Eye, Trash2, Calendar, Edit, AlertCircle } from "lucide-react";
import {
  vagueService,
  niveauService,
  referenceService,
  userService,
} from "@/services/api";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Loading from "@/components/ui/Loading";
import Input from "@/components/ui/Input";
import { getStatusLabel, getStatusColor } from "@/utils/helpers";
import toast from "react-hot-toast";

export default function Vagues() {
  const [vagues, setVagues] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [salles, setSalles] = useState([]);
  const [enseignants, setEnseignants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVague, setSelectedVague] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [vagueDetails, setVagueDetails] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vagueToDelete, setVagueToDelete] = useState(null);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    statut: "",
    niveau_id: "",
    enseignant_id: "",
    search: "",
  });

  // FormData principal
  const [formData, setFormData] = useState({
    nom: "",
    niveau_id: "",
    enseignant_id: "",
    salle_id: "",
    date_debut: "",
    date_fin: "",
    capacite_max: "",
    statut: "planifie",
    horaires: [],
  });

  // State local pour le nouveau créneau
  const [newCrenau, setNewCrenau] = useState({
    heure_debut: "",
    heure_fin: "",
  });

  useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vaguesRes, niveauxRes, sallesRes, enseignantsRes] =
        await Promise.all([
          vagueService.getAll({
            page: currentPage,
            limit: 10,
            ...filters,
          }),
          niveauService.getAll(),
          referenceService.getSalles(),
          userService.getProfesseurs(),
        ]);

      setVagues(vaguesRes.data.vagues || vaguesRes.data || []);
      setNiveaux(niveauxRes.data.niveaux || niveauxRes.data || []);
      setSalles(sallesRes.data.salles || sallesRes.data || []);
      setEnseignants(enseignantsRes.data.users || enseignantsRes.data || []);

      // Gestion de la pagination
      if (vaguesRes.data.total && vaguesRes.data.limit) {
        setTotalPages(Math.ceil(vaguesRes.data.total / vaguesRes.data.limit));
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vague = null) => {
    if (vague) {
      setSelectedVague(vague);
      setFormData({
        nom: vague.nom || "",
        niveau_id: vague.niveau_id || "",
        enseignant_id: vague.enseignant_id || "",
        salle_id: vague.salle_id || "",
        date_debut: vague.date_debut ? vague.date_debut.split("T")[0] : "",
        date_fin: vague.date_fin ? vague.date_fin.split("T")[0] : "",
        capacite_max: vague.capacite_max || "",
        statut: vague.statut || "planifie",
        horaires: vague.horaires || [],
      });
    } else {
      setSelectedVague(null);
      setFormData({
        nom: "",
        niveau_id: "",
        enseignant_id: "",
        salle_id: "",
        date_debut: "",
        date_fin: "",
        capacite_max: "",
        statut: "planifie",
        horaires: [],
      });
    }
    setNewCrenau({ heure_debut: "", heure_fin: "" });
    setShowModal(true);
  };

  // Ajoute le créneau saisi au tableau des horaires
  const addCrenau = () => {
    if (!newCrenau.heure_debut || !newCrenau.heure_fin) {
      toast.error("Veuillez saisir l'heure de début et de fin");
      return;
    }

    // Validation: heure de fin doit être après heure de début
    if (newCrenau.heure_debut >= newCrenau.heure_fin) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    setFormData({
      ...formData,
      horaires: [...formData.horaires, { ...newCrenau }],
    });
    setNewCrenau({ heure_debut: "", heure_fin: "" });
    toast.success("Créneau ajouté");
  };

  const removeCrenau = (index) => {
    setFormData({
      ...formData,
      horaires: formData.horaires.filter((_, i) => i !== index),
    });
    toast.success("Créneau supprimé");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des horaires
    if (formData.horaires.length === 0) {
      toast.error("Veuillez ajouter au moins un créneau horaire");
      return;
    }

    // Validation des dates
    if (formData.date_debut && formData.date_fin) {
      if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
        toast.error("La date de fin doit être après la date de début");
        return;
      }
    }

    const dataToSubmit = {
      nom: formData.nom,
      niveau_id: parseInt(formData.niveau_id),
      enseignant_id: formData.enseignant_id
        ? parseInt(formData.enseignant_id)
        : null,
      salle_id: formData.salle_id ? parseInt(formData.salle_id) : null,
      date_debut: formData.date_debut,
      date_fin: formData.date_fin,
      capacite_max: parseInt(formData.capacite_max) || 0,
      statut: formData.statut,
      horaires: formData.horaires.map((h) => ({
        heure_debut: h.heure_debut,
        heure_fin: h.heure_fin,
      })),
    };

    console.log("Payload final:", JSON.stringify(dataToSubmit, null, 2));

    try {
      setLoading(true);
      if (selectedVague) {
        await vagueService.update(selectedVague.id, dataToSubmit);
        toast.success("Vague mise à jour avec succès");
      } else {
        await vagueService.create(dataToSubmit);
        toast.success("Vague créée avec succès");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Erreur serveur:", error.response?.data);
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (vague) => {
    try {
      const response = await vagueService.getById(vague.id);
      setVagueDetails(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Impossible de charger les détails");
    }
  };

  const handleDeleteClick = (vague) => {
    setVagueToDelete(vague);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vagueToDelete) return;

    try {
      setLoading(true);
      await vagueService.delete(vagueToDelete.id);
      toast.success("Vague supprimée avec succès");
      setShowDeleteModal(false);
      setVagueToDelete(null);
      loadData();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error(
        error.response?.data?.message || "Impossible de supprimer cette vague",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      statut: "",
      niveau_id: "",
      enseignant_id: "",
      search: "",
    });
    setCurrentPage(1);
  };

  if (loading && vagues.length === 0) return <Loading fullScreen />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vagues</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2" /> Nouvelle vague
        </Button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher par nom..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <Select
            value={filters.statut}
            onChange={(e) => handleFilterChange("statut", e.target.value)}
            options={[
              { value: "", label: "Tous les statuts" },
              { value: "planifie", label: "Planifié" },
              { value: "en_cours", label: "En cours" },
              { value: "termine", label: "Terminé" },
              { value: "annule", label: "Annulé" },
            ]}
          />
          <Select
            value={filters.niveau_id}
            onChange={(e) => handleFilterChange("niveau_id", e.target.value)}
            options={[
              { value: "", label: "Tous les niveaux" },
              ...niveaux.map((n) => ({ value: n.id, label: n.code })),
            ]}
          />
          <Select
            value={filters.enseignant_id}
            onChange={(e) =>
              handleFilterChange("enseignant_id", e.target.value)
            }
            options={[
              { value: "", label: "Tous les enseignants" },
              ...enseignants.map((e) => ({
                value: e.id,
                label: `${e.prenom} ${e.nom}`,
              })),
            ]}
          />
        </div>
        {(filters.search ||
          filters.statut ||
          filters.niveau_id ||
          filters.enseignant_id) && (
          <div className="mt-4">
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableHead>Nom</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>Enseignant</TableHead>
            <TableHead>Salle</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Horaires</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Inscrits</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {vagues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-500">Aucune vague trouvée</p>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenModal()}
                      size="sm"
                    >
                      Créer une vague
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              vagues.map((vague) => (
                <TableRow key={vague.id}>
                  <TableCell className="font-medium">{vague.nom}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{vague.niveau_code}</Badge>
                  </TableCell>
                  <TableCell>
                    {vague.enseignant_nom
                      ? `${vague.enseignant_prenom} ${vague.enseignant_nom}`
                      : "-"}
                  </TableCell>
                  <TableCell>{vague.salle_nom || "-"}</TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-600">
                      {vague.date_debut
                        ? new Date(vague.date_debut).toLocaleDateString()
                        : "-"}
                      {" → "}
                      {vague.date_fin
                        ? new Date(vague.date_fin).toLocaleDateString()
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {vague.horaires?.length || 0} créneau(x)
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(vague.statut)}>
                      {getStatusLabel(vague.statut)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        vague.nb_inscrits >= vague.capacite_max
                          ? "text-red-600 font-semibold"
                          : "text-gray-700"
                      }
                    >
                      {vague.nb_inscrits || 0} / {vague.capacite_max}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(vague)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(vague)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(vague)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                        disabled={vague.nb_inscrits > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                size="sm"
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                size="sm"
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Création / Modification */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedVague ? "Modifier la vague" : "Nouvelle vague"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nom de la vague"
            placeholder="Ex: Groupe A - Mathématiques"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Niveau"
              value={formData.niveau_id}
              onChange={(e) =>
                setFormData({ ...formData, niveau_id: e.target.value })
              }
              options={niveaux.map((n) => ({
                value: n.id,
                label: `${n.code} - ${n.nom}`,
              }))}
              required
            />
            <Select
              label="Enseignant"
              value={formData.enseignant_id}
              onChange={(e) =>
                setFormData({ ...formData, enseignant_id: e.target.value })
              }
              options={enseignants.map((e) => ({
                value: e.id,
                label: `${e.prenom} ${e.nom}`,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date début"
              type="date"
              value={formData.date_debut}
              onChange={(e) =>
                setFormData({ ...formData, date_debut: e.target.value })
              }
              required
            />
            <Input
              label="Date fin"
              type="date"
              value={formData.date_fin}
              onChange={(e) =>
                setFormData({ ...formData, date_fin: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Changé en grid-cols-3 pour l'alignement */}
        <Select
          label="Salle"
          value={formData.salle_id}
          onChange={(e) =>
            setFormData({ ...formData, salle_id: e.target.value })
          }
          options={salles.map((s) => ({ value: s.id, label: s.nom }))}
        />
        <Input
          label="Capacité Max"
          type="number"
          placeholder="Ex: 25"
          value={formData.capacite_max}
          onChange={(e) =>
            setFormData({ ...formData, capacite_max: e.target.value })
          }
          required
        />
        <Select
          label="Statut"
          value={formData.statut}
          onChange={(e) =>
            setFormData({ ...formData, statut: e.target.value })
          }
          options={[
            { value: "planifie", label: "Planifié" },
            { value: "en_cours", label: "En cours" },
            { value: "termine", label: "Terminé" },
            { value: "annule", label: "Annulé" },
          ]}
        />
      </div>

          {/* Section Horaires */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Créneaux horaires de la vague
            </h3>

            <div className="flex gap-4 items-end mb-6">
              <div className="flex-1">
                <Input
                  label="Heure début"
                  type="time"
                  value={newCrenau.heure_debut}
                  onChange={(e) =>
                    setNewCrenau({ ...newCrenau, heure_debut: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Heure fin"
                  type="time"
                  value={newCrenau.heure_fin}
                  onChange={(e) =>
                    setNewCrenau({ ...newCrenau, heure_fin: e.target.value })
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addCrenau}
                className="h-10.5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-2">
              {formData.horaires.map((h, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-gray-700">
                      {h.heure_debut} — {h.heure_fin}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCrenau(idx)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {formData.horaires.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                  <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">
                    Aucun horaire défini pour cette vague
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Ajoutez au moins un créneau horaire
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Détails */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails de la vague"
        size="lg"
      >
        {vagueDetails && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nom</p>
                <p className="text-lg font-semibold">{vagueDetails.nom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Niveau
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  {vagueDetails.niveau_code}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Enseignant
                </p>
                <p className="text-lg font-semibold">
                  {vagueDetails.enseignant_nom
                    ? `${vagueDetails.enseignant_prenom} ${vagueDetails.enseignant_nom}`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Salle
                </p>
                <p className="text-lg font-semibold">
                  {vagueDetails.salle_nom || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Statut
                </p>
                <Badge className={getStatusColor(vagueDetails.statut)}>
                  {getStatusLabel(vagueDetails.statut)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Remplissage
                </p>
                <p className="font-semibold">
                  {vagueDetails.nb_inscrits || 0} / {vagueDetails.capacite_max}{" "}
                  élèves
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Période
                </p>
                <p className="text-sm">
                  Du{" "}
                  {vagueDetails.date_debut
                    ? new Date(vagueDetails.date_debut).toLocaleDateString()
                    : "-"}
                  <br />
                  Au{" "}
                  {vagueDetails.date_fin
                    ? new Date(vagueDetails.date_fin).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-bold text-gray-800 mb-4">
                Horaires de passage
              </h4>
              {vagueDetails.horaires && vagueDetails.horaires.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vagueDetails.horaires.map((h, i) => (
                    <div
                      key={i}
                      className="bg-blue-50 text-blue-700 p-3 rounded-xl font-bold border border-blue-100 flex justify-center items-center gap-2"
                    >
                      <Calendar size={16} />
                      {h.heure_debut} → {h.heure_fin}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  Aucun horaire défini
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmation Suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-sm text-red-800">
              Êtes-vous sûr de vouloir supprimer la vague "{vagueToDelete?.nom}"
              ?
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
