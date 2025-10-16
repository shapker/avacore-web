// API для взаимодействия с Telegram ботом
class BotAPI {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.userId = this.tg.initDataUnsafe.user?.id;
        this.baseURL = 'https://your-bot-domain.com/api'; // Замените на ваш домен
    }

    // Получение данных пользователя
    async getUserData() {
        try {
            const response = await this.makeRequest('GET', `/user/${this.userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return this.getFallbackUserData();
        }
    }

    // Получение баланса
    async getBalance() {
        try {
            const response = await this.makeRequest('GET', `/user/${this.userId}/balance`);
            return response.balance || 0;
        } catch (error) {
            console.error('Error fetching balance:', error);
            return 0;
        }
    }

    // Получение настроек
    async getSettings() {
        try {
            const response = await this.makeRequest('GET', `/user/${this.userId}/settings`);
            return response.settings || {};
        } catch (error) {
            console.error('Error fetching settings:', error);
            return this.getDefaultSettings();
        }
    }

    // Сохранение настроек
    async saveSettings(settings) {
        try {
            const response = await this.makeRequest('POST', `/user/${this.userId}/settings`, settings);
            return response.success;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // Получение статистики
    async getStats() {
        try {
            const response = await this.makeRequest('GET', `/user/${this.userId}/stats`);
            return response.stats || {};
        } catch (error) {
            console.error('Error fetching stats:', error);
            return this.getFallbackStats();
        }
    }

    // Управление магазином
    async getCategories() {
        try {
            const response = await this.makeRequest('GET', '/categories');
            return response.categories || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    async addCategory(categoryData) {
        try {
            const response = await this.makeRequest('POST', '/categories', categoryData);
            return response.success;
        } catch (error) {
            console.error('Error adding category:', error);
            return false;
        }
    }

    // Платежи
    async createPayment(amount, description) {
        try {
            const response = await this.makeRequest('POST', '/payment/create', {
                user_id: this.userId,
                amount: amount,
                description: description
            });
            return response;
        } catch (error) {
            console.error('Error creating payment:', error);
            return null;
        }
    }

    // Вспомогательные методы
    async makeRequest(method, endpoint, data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-ID': this.userId,
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    getAuthToken() {
        // В реальном приложении здесь должна быть логика получения токена
        return this.tg.initData || 'web-app-token';
    }

    getFallbackUserData() {
        return {
            id: this.userId,
            name: this.tg.initDataUnsafe.user?.first_name || 'Пользователь',
            username: this.tg.initDataUnsafe.user?.username,
            balance: 0,
            subscription_active: false
        };
    }

    getDefaultSettings() {
        return {
            gpt_auto_reply: false,
            save_deleted_messages: false,
            track_edited_messages: false,
            auto_welcome: true,
            gpt_role: 'Ты должен отвечать на русском. Просто симулируй общение человека. Отвечай по возможности кратко',
            media_keyword: ':)'
        };
    }

    getFallbackStats() {
        return {
            total_messages: 0,
            active_users: 0,
            total_sales: 0,
            active_chats: 0
        };
    }
}

// Создаем глобальный экземпляр API
window.botAPI = new BotAPI();
