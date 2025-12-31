// ==================== SISTEMA DE NOTIFICAÇÕES CUSTOMIZADAS ====================

/**
 * Mostra uma notificação toast customizada
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duração em ms (padrão: 4000)
 */
function showNotification(message, type = 'info', duration = 4000) {
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    const titles = {
        success: 'Sucesso',
        error: 'Erro',
        warning: 'Atenção',
        info: 'Informação'
    };

    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-header">
            <i class="fas ${icons[type]} notification-icon"></i>
            <div class="notification-title">${titles[type]}</div>
            <button class="notification-close" onclick="this.closest('.custom-notification').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="notification-message">${message}</div>
    `;

    document.body.appendChild(notification);

    // Auto remover após duration
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    return notification;
}

/**
 * Substitui alert() nativo
 * @param {string} message - Mensagem
 * @param {string} type - Tipo de alerta
 */
window.customAlert = function(message, type = 'info') {
    // Detectar tipo baseado no conteúdo da mensagem
    if (message.includes('✅') || message.toLowerCase().includes('sucesso')) {
        type = 'success';
        message = message.replace('✅', '').trim();
    } else if (message.includes('❌') || message.toLowerCase().includes('erro')) {
        type = 'error';
        message = message.replace('❌', '').trim();
    } else if (message.includes('⚠️') || message.toLowerCase().includes('atenção')) {
        type = 'warning';
        message = message.replace('⚠️', '').trim();
    }

    showNotification(message, type);
};

/**
 * Substitui confirm() nativo com modal customizado
 * @param {string} message - Mensagem de confirmação
 * @param {object} options - Opções: { title, type, confirmText, cancelText, danger }
 * @returns {Promise<boolean>}
 */
window.customConfirm = function(message, options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Confirmar',
            type = 'warning',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            danger = false
        } = options;

        const icons = {
            warning: 'fa-triangle-exclamation',
            danger: 'fa-circle-exclamation',
            info: 'fa-circle-info'
        };

        const modal = document.createElement('div');
        modal.className = 'custom-confirm-modal';
        modal.innerHTML = `
            <div class="custom-confirm-content">
                <div class="confirm-icon ${type}">
                    <i class="fas ${icons[type] || icons.warning}"></i>
                </div>
                <h3 class="confirm-title">${title}</h3>
                <div class="confirm-message">${message}</div>
                <div class="confirm-buttons">
                    <button class="confirm-btn confirm-btn-cancel" data-action="cancel">
                        ${cancelText}
                    </button>
                    <button class="confirm-btn ${danger ? 'confirm-btn-danger' : 'confirm-btn-confirm'}" data-action="confirm">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });

        modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });

        // Suporte para ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                resolve(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    });
};

// Utilitários de sucesso rápido
window.showSuccess = (message) => showNotification(message, 'success');
window.showError = (message) => showNotification(message, 'error');
window.showWarning = (message) => showNotification(message, 'warning');
window.showInfo = (message) => showNotification(message, 'info');
