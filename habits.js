// ===== Gestion des habitudes =====

// Clé pour le stockage local
const HABITS_STORAGE_KEY = 'habits_app_habits';
const RECORDS_STORAGE_KEY = 'habits_app_records';

// Structure d'une habitude
/*
{
    id: string,
    title: string,
    icon: string,
    color: string,
    category: string,
    createdAt: string (date ISO)
}
*/

// Structure d'un enregistrement
/*
{
    id: string,
    habitId: string,
    date: string (date ISO),
    time: string (HH:MM),
    createdAt: string (date + heure ISO)
}
*/

// ===== Fonctions de gestion des habitudes =====

// Obtenir toutes les habitudes
function getAllHabits() {
    return loadFromLocalStorage(HABITS_STORAGE_KEY, []);
}

// Obtenir une habitude par ID
function getHabitById(habitId) {
    const habits = getAllHabits();
    return habits.find(h => h.id === habitId);
}

// Ajouter une nouvelle habitude
function addHabit(habitData) {
    const habits = getAllHabits();
    const newHabit = {
        id: generateId(),
        title: habitData.title,
        icon: habitData.icon,
        color: habitData.color,
        category: habitData.category,
        createdAt: new Date().toISOString().split('T')[0]
    };
    habits.push(newHabit);
    saveToLocalStorage(HABITS_STORAGE_KEY, habits);
    return newHabit;
}

// Mettre à jour une habitude
function updateHabit(habitId, updatedData) {
    const habits = getAllHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
        habits[index] = { ...habits[index], ...updatedData };
        saveToLocalStorage(HABITS_STORAGE_KEY, habits);
        return habits[index];
    }
    return null;
}

// Supprimer une habitude
function deleteHabit(habitId) {
    const habits = getAllHabits();
    const filteredHabits = habits.filter(h => h.id !== habitId);
    saveToLocalStorage(HABITS_STORAGE_KEY, filteredHabits);
    return filteredHabits;
}

// Obtenir la dernière exécution d'une habitude
function getLastExecution(habitId) {
    const records = getAllRecords();
    const habitRecords = records.filter(r => r.habitId === habitId);
    if (habitRecords.length === 0) return null;

    // Trier par date et heure (du plus récent au plus ancien)
    habitRecords.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
    });

    return habitRecords[0];
}

// ===== Fonctions de gestion des enregistrements =====

// Obtenir tous les enregistrements
function getAllRecords() {
    return loadFromLocalStorage(RECORDS_STORAGE_KEY, []);
}

// Obtenir les enregistrements d'une habitude
function getRecordsByHabit(habitId) {
    const records = getAllRecords();
    return records.filter(r => r.habitId === habitId);
}

// Ajouter un enregistrement
function addRecord(recordData) {
    const records = getAllRecords();
    const newRecord = {
        id: generateId(),
        habitId: recordData.habitId,
        date: recordData.date,
        time: recordData.time,
        createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    saveToLocalStorage(RECORDS_STORAGE_KEY, records);
    return newRecord;
}

// Mettre à jour un enregistrement
function updateRecord(recordId, updatedData) {
    const records = getAllRecords();
    const index = records.findIndex(r => r.id === recordId);
    if (index !== -1) {
        records[index] = { ...records[index], ...updatedData };
        saveToLocalStorage(RECORDS_STORAGE_KEY, records);
        return records[index];
    }
    return null;
}

// Supprimer un enregistrement
function deleteRecord(recordId) {
    const records = getAllRecords();
    const filteredRecords = records.filter(r => r.id !== recordId);
    saveToLocalStorage(RECORDS_STORAGE_KEY, filteredRecords);
    return filteredRecords;
}

// ===== Initialisation de la page habitudes =====

function initHabitsPage() {
    // Récupérer les éléments du DOM
    const habitForm = document.getElementById('addHabitForm');
    const habitsContainer = document.getElementById('habitsContainer');
    const recordModal = document.getElementById('recordModal');
    const customRecordForm = document.getElementById('customRecordForm');
    const modalHabitId = document.getElementById('modalHabitId');
    const recordDateInput = document.getElementById('recordDate');  // ← AJOUTÉ
    const recordTimeInput = document.getElementById('recordTime');   // ← AJOUTÉ

    // Charger et afficher les habitudes
    function loadAndDisplayHabits() {
        const habits = getAllHabits();
        displayHabits(habits);
    }

    // Afficher les habitudes
    function displayHabits(habits) {
        if (habits.length === 0) {
            habitsContainer.innerHTML = '<p class="no-data">Aucune habitude créée. Ajoutez-en une !</p>';
            return;
        }

        habitsContainer.innerHTML = '';

        habits.forEach(habit => {
            const lastExecution = getLastExecution(habit.id);

            const habitCard = document.createElement('div');
            habitCard.className = 'habit-card';
            habitCard.dataset.habitId = habit.id;

            habitCard.innerHTML = `
                <div class="habit-header">
                    <div class="habit-icon" style="border-color: ${habit.color}">
                        <i class="fas ${habit.icon}"></i>
                    </div>
                    <h3 class="habit-title">${habit.title}</h3>
                    <span class="habit-category">${habit.category}</span>
                </div>
                <div class="habit-info">
                    <p><i class="fas fa-calendar-plus"></i> Créée le: ${formatDate(habit.createdAt)}</p>
                    ${lastExecution ? `
                        <p class="last-execution"><i class="fas fa-clock"></i> Dernière exécution: ${formatDateTime(lastExecution.date, lastExecution.time)}</p>
                    ` : `
                        <p class="no-execution"><i class="fas fa-exclamation-circle"></i> Aucune exécution enregistrée</p>
                    `}
                </div>
                <div class="habit-actions">
                    <button class="btn btn-primary record-now" data-habit-id="${habit.id}">
                        <i class="fas fa-check"></i> Maintenant
                    </button>
                    <button class="btn btn-secondary record-custom" data-habit-id="${habit.id}">
                        <i class="fas fa-calendar-plus"></i> Personnalisé
                    </button>
                </div>
            `;

            habitsContainer.appendChild(habitCard);
        });

        // Ajouter les écouteurs d'événements pour les boutons
        addHabitEventListeners();
    }

    // Ajouter les écouteurs d'événements
    function addHabitEventListeners() {
        // Boutons "Maintenant"
        document.querySelectorAll('.record-now').forEach(btn => {
            btn.addEventListener('click', () => {
                const habitId = btn.dataset.habitId;
                recordNow(habitId);
            });
        });

        // Boutons "Personnalisé"
        document.querySelectorAll('.record-custom').forEach(btn => {
            btn.addEventListener('click', () => {
                const habitId = btn.dataset.habitId;
                openCustomRecordModal(habitId);
            });
        });
    }

    // Enregistrer une exécution maintenant
    function recordNow(habitId) {
        const { date, time } = getCurrentDateTime();
        addRecord({ habitId, date, time });
        loadAndDisplayHabits();
    }

    // Ouvrir la modale pour un enregistrement personnalisé
    function openCustomRecordModal(habitId) {
        console.log("modalHabitId", modalHabitId);
        console.log("recordDateInput", recordDateInput);
        console.log("recordTimeInput", recordTimeInput);
        
        if (!modalHabitId || !recordDateInput || !recordTimeInput) return;  // ← VÉRIFICATION AJOUTÉE
        
        modalHabitId.value = habitId;
        
        const { date, time } = getCurrentDateTime();
        console.log("date", date);
        console.log("time", time);
        recordDateInput.value = date;
        recordTimeInput.value = time;
        openModal('recordModal');
    }

        // Soumettre le formulaire d'ajout d'habitude
    if (habitForm) {
        habitForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('habitTitle').value;
            const icon = document.getElementById('habitIcon').value;
            const color = document.getElementById('habitColor').value;
            const category = document.getElementById('habitCategory').value;

            addHabit({ title, icon, color, category });

            // Réinitialiser le formulaire
            habitForm.reset();

            // Réinitialiser la sélection des icônes
            initIconButtons();

            // Recharger les habitudes
            loadAndDisplayHabits();
        });
    }

    // Soumettre le formulaire d'enregistrement personnalisé
    if (customRecordForm) {
        customRecordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const habitId = modalHabitId.value;
            const date = document.getElementById('recordDate').value;
            const time = document.getElementById('recordTime').value;

            addRecord({ habitId, date, time });

            // Fermer la modale
            closeModal('recordModal');

            // Recharger les habitudes
            loadAndDisplayHabits();
        });
    }

    // Initialiser les boutons d'icônes
    initIconButtons();

    // Charger les habitudes au démarrage
    loadAndDisplayHabits();
}

    // Gestion des boutons d'icônes
    function initIconButtons() {
        const iconContainer = document.getElementById('habitIconContainer');
        const hiddenIconInput = document.getElementById('habitIcon');

        if (!iconContainer || !hiddenIconInput) return;

        const iconButtons = iconContainer.querySelectorAll('.icon-btn');

        // Désélectionner tous les boutons
        iconButtons.forEach(btn => btn.classList.remove('selected'));

        // Sélectionner le premier bouton par défaut
        if (iconButtons.length > 0) {
            iconButtons[0].classList.add('selected');
            hiddenIconInput.value = iconButtons[0].dataset.icon;
        }

        // Ajouter les écouteurs d'événements
        iconButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Désélectionner tous les boutons
                iconButtons.forEach(b => b.classList.remove('selected'));

                // Sélectionner le bouton cliqué
                btn.classList.add('selected');

                // Mettre à jour le champ caché
                hiddenIconInput.value = btn.dataset.icon;
            });
        });
    }

// ===== Exécuter l'initialisation =====

// Vérifier si nous sommes sur la page des habitudes
if (document.getElementById('addHabitForm')) {
    document.addEventListener('DOMContentLoaded', initHabitsPage);
}
