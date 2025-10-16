// Основное приложение
class ShapkerWebApp {
    constructor() {
        this.api = window.botAPI;
        this.tg = window.Telegram.WebApp;
        this.currentUser = null;
        this.userSettings = {};
        this.userStats = {};
        
        this.init();
    }

    async init() {
        // Инициализация Telegram Web App
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        this.tg.BackButton.show();

        // Загрузка данных
        await this.loadUserData();
        await this.loadSettings();
        await this.loadStats();

        // Настройка навигации
        this.setupNavigation();
        
        // Настройка обработчиков событий
        this.setupEventHandlers();

        console.log('🤖 Shapker Web App initialized');
    }

    async loadUserData() {
        try {
            this.currentUser = await this.api.getUserData();
            this.updateUserInterface();
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Ошибка загрузки данных пользователя');
        }
    }

    async loadSettings() {
        try {
            this.userSettings = await this.api.getSettings();
            this.updateSettingsInterface();
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showError('Ошибка загрузки настроек');
        }
    }

    async loadStats() {
        try {
            this.userStats = await this.api.getStats();
            this.updateStatsInterface();
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showError('Ошибка загрузки статистики');
        }
    }

    updateUserInterface() {
        if (this.currentUser) {
            // Обновление информации о пользователе
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('user-status').textContent = 
                this.currentUser.username ? `@${this.currentUser.username}` : 'Пользователь';
            
            // Обновление баланса
            document.getElementById('balance-value').textContent = `${this.currentUser.balance} ₽`;
            document.getElementById('quick-balance').textContent = `${this.currentUser.balance} ₽`;
            
            // Обновление аватара
            const avatar = document.getElementById('user-avatar');
            if (this.currentUser.subscription_active) {
                avatar.className = 'fas fa-crown';
                avatar.style.color = '#f59e0b';
            }
        }
    }

    updateSettingsInterface() {
        // Обновление переключателей настроек
        document.getElementById('gpt-auto-reply').checked = this.userSettings.gpt_auto_reply;
        document.getElementById('save-deleted-messages').checked = this.userSettings.save_deleted_messages;
        document.getElementById('track-edited-messages').checked = this.userSettings.track_edited_messages;
        document.getElementById('auto-welcome').checked = this.userSettings.auto_welcome;
        document.getElementById('media-keyword').value = this.userSettings.media_keyword;

        // Обновление статусов
        document.getElementById('gpt-status').textContent = this.userSettings.gpt_auto_reply ? 'Вкл' : 'Выкл';
        document.getElementById('save-messages-status').textContent = this.userSettings.save_deleted_messages ? 'Вкл' : 'Выкл';
    }

    updateStatsInterface() {
        // Обновление статистики
        document.getElementById('total-messages').textContent = this.userStats.total_messages || 0;
        document.getElementById('active-users').textContent = this.userStats.active_users || 0;
        document.getElementById('total-sales').textContent = this.userStats.total_sales || 0;
        document.getElementById('active-chats').textContent = this.userStats.active_chats || 0;
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Убираем активный класс у всех кнопок
                navButtons.forEach(btn => btn.classList.remove('active'));
                
                // Добавляем активный класс текущей кнопке
                button.classList.add('active');
                
                // Скрываем все вкладки
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Показываем выбранную вкладку
                const tabId = button.getAttribute('data-tab') + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    setupEventHandlers() {
        // Обработчики сохранения настроек
        document.getElementById('gpt-auto-reply').addEventListener('change', (e) => {
            this.saveSetting('gpt_auto_reply', e.target.checked);
        });

        document.getElementById('save-deleted-messages').addEventListener('change', (e) => {
            this.saveSetting('save_deleted_messages', e.target.checked);
        });

        document.getElementById('track-edited-messages').addEventListener('change', (e) => {
            this.saveSetting('track_edited_messages', e.target.checked);
        });

        document.getElementById('auto-welcome').addEventListener('change', (e) => {
            this.saveSetting('auto_welcome', e.target.checked);
        });

        document.getElementById('media-keyword').addEventListener('change', (e) => {
            this.saveSetting('media_keyword', e.target.value);
        });

        // Обработчик кнопки назад
        this.tg.BackButton.onClick(() => {
            this.handleBackButton();
        });
    }

    async saveSetting(key, value) {
        try {
            this.userSettings[key] = value;
            const success = await this.api.saveSettings(this.userSettings);
            
            if (success) {
                this.showSuccess('Настройки сохранены');
                this.updateSettingsInterface();
            } else {
                this.showError('Ошибка сохранения настроек');
            }
        } catch (error) {
            console.error('Error saving setting:', error);
            this.showError('Ошибка сохранения настроек');
        }
    }

    handleBackButton() {
        const openModal = document.querySelector('.modal[style*="display: flex"]');
        if (openModal) {
            this.closeModal(openModal.id);
        } else {
            this.tg.close();
        }
    }

    // Управление модальными окнами
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
        this.tg.BackButton.onClick(() => this.closeModal(modalId));
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        this.tg.BackButton.offClick(() => this.closeModal(modalId));
    }

    // Утилиты
    showSuccess(message) {
        this.tg.showPopup({
            title: 'Успех',
            message: message,
            buttons: [{ type: 'ok' }]
        });
    }

    showError(message) {
        this.tg.showPopup({
            title: 'Ошибка',
            message: message,
            buttons: [{ type: 'ok' }]
        });
    }

    // Обновление данных в реальном времени
    startLiveUpdates() {
        setInterval(async () => {
            await this.loadStats();
            await this.loadUserData();
        }, 30000); // Обновление каждые 30 секунд
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.shapkerApp = new ShapkerWebApp();
});
