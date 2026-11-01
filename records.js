// ===== Gestion de la page des enregistrements =====

function initRecordsPage() {
    // Récupérer les éléments du DOM
    const recordsTableBody = document.getElementById('recordsTableBody');
    const noRecordsElement = document.getElementById('noRecords');
    const filterCategory = document.getElementById('filterCategory');
    const filterDate = document.getElementById('filterDate');
    const filterHabit = document.getElementById('filterHabit');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const editModal = document.getElementById('editModal');
    const editRecordForm = document.getElementById('editRecordForm');
    const editRecordId = document.getElementById('editRecordId');
    const editRecordDate = document.getElementById('editRecordDate');
    const editRecordTime = document.getElementById('editRecordTime');
    const deleteRecordBtn = document.getElementById('deleteRecordBtn');
    const importModal = document.getElementById('importModal');
    const importData = document.getElementById('importData');
    const confirmImportBtn = document.getElementById('confirmImportBtn');

    // État du tri
    let sortState = {
        column: null,
        direction: 'asc'
    };

    // Charger et afficher les enregistrements
    function loadAndDisplayRecords() {
        const records = getAllRecords();
        const habits = getAllHabits();

        // Remplir le filtre des habitudes
        fillHabitFilter(habits);

        // Filtrer les enregistrements
        const filteredRecords = filterRecords(records, habits);

        // Trier les enregistrements
        const sortedRecords = sortRecords(filteredRecords);

        // Afficher les enregistrements
        displayRecords(sortedRecords, habits);
    }

    // Remplir le filtre des habitudes
    function fillHabitFilter(habits) {
        if (!filterHabit) return;

        // Sauvegarder la sélection actuelle
        const currentValue = filterHabit.value;

        // Réinitialiser
        filterHabit.innerHTML = '<option value="">Toutes</option>';

        // Ajouter les habitudes
        habits.forEach(habit => {
            const option = document.createElement('option');
            option.value = habit.id;
            option.textContent = habit.title;
            filterHabit.appendChild(option);
        });

        // Restaurer la sélection
        filterHabit.value = currentValue;
    }

    // Filtrer les enregistrements
    function filterRecords(records, habits) {
        let filtered = [...records];

        // Filtrer par catégorie
        const category = filterCategory?.value;
        if (category) {
            filtered = filtered.filter(record => {
                const habit = habits.find(h => h.id === record.habitId);
                return habit && habit.category === category;
            });
        }

        // Filtrer par date
        const date = filterDate?.value;
        if (date) {
            filtered = filtered.filter(record => record.date === date);
        }

        // Filtrer par habitude
        const habitId = filterHabit?.value;
        if (habitId) {
            filtered = filtered.filter(record => record.habitId === habitId);
        }

        return filtered;
    }

    // Trier les enregistrements
    function sortRecords(records) {
        if (!sortState.column) return records;

        return [...records].sort((a, b) => {
            const habits = getAllHabits();
            const habitA = habits.find(h => h.id === a.habitId);
            const habitB = habits.find(h => h.id === b.habitId);

            let valueA, valueB;

            switch (sortState.column) {
                case 'habit':
                    valueA = habitA?.title || '';
                    valueB = habitB?.title || '';
                    break;
                case 'category':
                    valueA = habitA?.category || '';
                    valueB = habitB?.category || '';
                    break;
                case 'date':
                    valueA = a.date;
                    valueB = b.date;
                    break;
                case 'time':
                    valueA = a.time;
                    valueB = b.time;
                    break;
                default:
                    return 0;
            }

            // Comparaison
            if (valueA < valueB) return sortState.direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortState.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Afficher les enregistrements
    function displayRecords(records, habits) {
        if (!recordsTableBody) return;

        if (records.length === 0) {
            recordsTableBody.innerHTML = '';
            if (noRecordsElement) {
                noRecordsElement.style.display = 'block';
            }
            return;
        }

        if (noRecordsElement) {
            noRecordsElement.style.display = 'none';
        }

        recordsTableBody.innerHTML = '';

        records.forEach(record => {
            const habit = habits.find(h => h.id === record.habitId);
            if (!habit) return;

            const row = document.createElement('tr');
            row.dataset.recordId = record.id;

            row.innerHTML = `
                <td>
                    <span class="habit-name">
                        <i class="fas ${habit.icon}" style="color: ${habit.color}"></i>
                        ${habit.title}
                    </span>
                </td>
                <td>${habit.category}</td>
                <td>${formatDate(record.date)}</td>
                <td>${formatTime(record.time)}</td>
                <td>
                    <button class="action-btn edit" data-record-id="${record.id}" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-record-id="${record.id}" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            recordsTableBody.appendChild(row);
        });

        // Ajouter les écouteurs d'événements
        addRecordEventListeners();
    }

    // Ajouter les écouteurs d'événements pour les boutons
    function addRecordEventListeners() {
        // Boutons de tri
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.onclick = () => {
                const column = th.dataset.sort;

                // Si on clique sur la même colonne, inverser le sens
                if (sortState.column === column) {
                    sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    sortState.column = column;
                    sortState.direction = 'asc';
                }

                // Mettre à jour les classes de tri
                document.querySelectorAll('th[data-sort]').forEach(header => {
                    header.classList.remove('asc', 'desc');
                });

                th.classList.add(sortState.direction);

                // Recharger les enregistrements
                loadAndDisplayRecords();
            };
        });

        // Boutons Modifier
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const recordId = btn.dataset.recordId;
                openEditModal(recordId);
            });
        });

        // Boutons Supprimer
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const recordId = btn.dataset.recordId;
                if (confirm('Voulez-vous vraiment supprimer cet enregistrement ?')) {
                    deleteRecord(recordId);
                    loadAndDisplayRecords();
                }
            });
        });
    }

    // Ouvrir la modale de modification
    function openEditModal(recordId) {
        const record = getAllRecords().find(r => r.id === recordId);
        if (!record) return;

        editRecordId.value = recordId;
        editRecordDate.value = record.date;
        editRecordTime.value = record.time;

        openModal('editModal');
    }

    // Soumettre le formulaire de modification
    if (editRecordForm) {
        editRecordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const recordId = editRecordId.value;
            const date = editRecordDate.value;
            const time = editRecordTime.value;

            updateRecord(recordId, { date, time });

            // Fermer la modale
            closeModal('editModal');

            // Recharger les enregistrements
            loadAndDisplayRecords();
        });
    }

    // Bouton Supprimer dans la modale de modification
    if (deleteRecordBtn) {
        deleteRecordBtn.addEventListener('click', () => {
            const recordId = editRecordId.value;
            if (confirm('Voulez-vous vraiment supprimer cet enregistrement ?')) {
                deleteRecord(recordId);
                closeModal('editModal');
                loadAndDisplayRecords();
            }
        });
    }

    // Bouton Effacer les filtres
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (filterCategory) filterCategory.value = '';
            if (filterDate) filterDate.value = '';
            if (filterHabit) filterHabit.value = '';

            // Réinitialiser le tri
            sortState = { column: null, direction: 'asc' };
            document.querySelectorAll('th[data-sort]').forEach(header => {
                header.classList.remove('asc', 'desc');
            });

            loadAndDisplayRecords();
        });
    }

    // Bouton Exporter
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const habits = getAllHabits();
            const records = getAllRecords();

            const exportData = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                habits: habits,
                records: records
            };

            exportData(exportData, 'suivi_habitudes_export.json');
        });
    }

    // Bouton Importer
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            openModal('importModal');
        });
    }

    // Bouton Confirmer l'import
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            const jsonString = importData.value.trim();

            if (!jsonString) {
                alert('Veuillez entrer des données JSON valides');
                return;
            }

            try {
                const data = JSON.parse(jsonString);

                // Vérifier la structure des données
                if (!data.habits || !data.records) {
                    alert('Le fichier JSON doit contenir les propriétés "habits" et "records"');
                    return;
                }

                if (!Array.isArray(data.habits) || !Array.isArray(data.records)) {
                    alert('Les données doivent être des tableaux');
                    return;
                }

                // Demander confirmation
                if (confirm('Cette opération remplacera toutes vos données actuelles. Continuer ?')) {
                    saveToLocalStorage(HABITS_STORAGE_KEY, data.habits);
                    saveToLocalStorage(RECORDS_STORAGE_KEY, data.records);

                    closeModal('importModal');
                    importData.value = '';

                    // Recharger les données
                    loadAndDisplayRecords();

                    alert('Données importées avec succès !');
                }
            } catch (error) {
                alert('Erreur: Données JSON invalides. ' + error.message);
            }
        });
    }

    // Écouteurs pour les filtres (appliquer automatiquement)
    if (filterCategory) {
        filterCategory.addEventListener('change', loadAndDisplayRecords);
    }

    if (filterDate) {
        filterDate.addEventListener('change', loadAndDisplayRecords);
    }

    if (filterHabit) {
        filterHabit.addEventListener('change', loadAndDisplayRecords);
    }

    // Charger les enregistrements au démarrage
    loadAndDisplayRecords();
}

// ===== Exécuter l'initialisation =====

// Vérifier si nous sommes sur la page des enregistrements
if (document.getElementById('recordsTable')) {
    document.addEventListener('DOMContentLoaded', initRecordsPage);
}
