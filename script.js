console.info("script.js version 0.0.2");

// ===== Fonctions utilitaires =====
// Clé pour le stockage local
const HABITS_STORAGE_KEY = 'habits_app_habits';
const RECORDS_STORAGE_KEY = 'habits_app_records';

// Générer un ID unique
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formater une date en chaîne lisible
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Formater une heure en chaîne lisible
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

// Formater une date complète (date + heure)
function formatDateTime(dateString, timeString) {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Obtenir la date et heure actuelles au format ISO
function getCurrentDateTime() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    return { date, time };
}

// ===== Gestion du stockage local =====

// Obtenir toutes les habitudes
function getAllHabits() {
    return loadFromLocalStorage(HABITS_STORAGE_KEY, []);
}

// Obtenir tous les enregistrements
function getAllRecords() {
    return loadFromLocalStorage(RECORDS_STORAGE_KEY, []);
}

// Sauvegarder les données dans localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return false;
    }
}

// Charger les données depuis localStorage
function loadFromLocalStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        return defaultValue;
    }
}

// Exporter les données en JSON
function exportData(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'habitudes_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Importer les données depuis un fichier JSON
function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        return null;
    }
}

// ===== Gestion des modales =====

// Ouvrir une modale
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Fermer une modale
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Fermer toutes les modales
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// Initialiser les modales (fermer en cliquant à l'extérieur ou sur la croix)
function initModals() {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');

        if (closeBtn) {
            closeBtn.onclick = () => {
                closeModal(modal.id);
            };
        }

        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        };
    });

    // Fermer avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ===== Initialisation =====

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    initModals();
});
