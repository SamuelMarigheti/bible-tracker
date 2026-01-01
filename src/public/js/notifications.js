// ==================== SISTEMA DE NOTIFICAÇÕES CUSTOMIZADAS ====================

// Armazenar último evento de clique para posicionamento inteligente
let lastClickEvent = null;
let lastActiveElement = null;

// Capturar cliques globais
document.addEventListener('click', (e) => {
    lastClickEvent = e;
    lastActiveElement = e.target;
}, true);

/**
 * Calcula a melhor posição para exibir a notificação próxima ao elemento/clique
 * @param {HTMLElement} notification - Elemento da notificação
 * @returns {object} Posição {top, left, right, bottom, arrow}
 */
function calculateNotificationPosition(notification) {
    const margin = 20; // Margem das bordas da tela
    const offset = 15; // Distância do elemento clicado

    // Verificar se é mobile
    const isMobile = window.innerWidth <= 768;

    // Em mobile, centralizar na parte inferior
    if (isMobile) {
        return {
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            right: 'auto',
            top: 'auto',
            arrow: null
        };
    }

    // Se temos um clique recente (últimos 2 segundos), usar sua posição
    if (lastClickEvent && (Date.now() - lastClickEvent.timeStamp < 2000)) {
        const clickX = lastClickEvent.clientX;
        const clickY = lastClickEvent.clientY;

        const notifWidth = 350; // Largura aproximada da notificação
        const notifHeight = 120; // Altura aproximada

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top, left, arrowDirection = null;

        // Verificar se há espaço à direita do clique
        if (clickX + notifWidth + offset + margin < viewportWidth) {
            left = clickX + offset;
            arrowDirection = 'left'; // Seta aponta para esquerda
        }
        // Se não, tentar à esquerda
        else if (clickX - notifWidth - offset > margin) {
            left = clickX - notifWidth - offset;
            arrowDirection = 'right'; // Seta aponta para direita
        }
        // Se não couber em nenhum lado, centralizar horizontalmente
        else {
            left = Math.max(margin, (viewportWidth - notifWidth) / 2);
            arrowDirection = null; // Sem seta quando centralizado
        }

        // Verificar se há espaço abaixo do clique
        if (clickY + notifHeight + offset + margin < viewportHeight) {
            top = clickY + offset;
            // Se tem seta lateral, ajustar para não ter seta no topo
        }
        // Se não, tentar acima
        else if (clickY - notifHeight - offset > margin) {
            top = clickY - notifHeight - offset;
        }
        // Se não couber, posicionar próximo ao topo
        else {
            top = margin;
        }

        return {
            top: `${top}px`,
            left: `${left}px`,
            right: 'auto',
            bottom: 'auto',
            arrow: arrowDirection
        };
    }

    // Fallback: usar último elemento ativo se disponível
    if (lastActiveElement) {
        try {
            const rect = lastActiveElement.getBoundingClientRect();
            const notifWidth = 350;
            const notifHeight = 120;

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top, left, arrowDirection = null;

            // Posicionar abaixo e à direita do elemento
            if (rect.right + notifWidth + offset < viewportWidth) {
                left = rect.right + offset;
                arrowDirection = 'left';
            } else if (rect.left - notifWidth - offset > margin) {
                left = rect.left - notifWidth - offset;
                arrowDirection = 'right';
            } else {
                left = Math.max(margin, (viewportWidth - notifWidth) / 2);
            }

            if (rect.bottom + notifHeight + offset < viewportHeight) {
                top = rect.bottom + offset;
            } else if (rect.top - notifHeight - offset > margin) {
                top = rect.top - notifHeight - offset;
            } else {
                top = margin;
            }

            return {
                top: `${top}px`,
                left: `${left}px`,
                right: 'auto',
                bottom: 'auto',
                arrow: arrowDirection
            };
        } catch (e) {
            // Se falhar, usar posição padrão
        }
    }

    // Posição padrão: canto superior direito
    return {
        top: '20px',
        right: '20px',
        left: 'auto',
        bottom: 'auto',
        arrow: null
    };
}

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

    // Calcular posição primeiro para saber se precisa de seta
    const position = calculateNotificationPosition(notification);

    // Adicionar seta se necessário
    const arrowHTML = position.arrow ? `<div class="notification-arrow arrow-${position.arrow}"></div>` : '';

    notification.innerHTML = `
        ${arrowHTML}
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

    // Aplicar posicionamento
    notification.style.top = position.top || 'auto';
    notification.style.left = position.left || 'auto';
    notification.style.right = position.right || 'auto';
    notification.style.bottom = position.bottom || 'auto';

    // Forçar reflow para animação funcionar
    notification.offsetHeight;

    // Aplicar transform após animação inicial (se necessário)
    if (position.transform) {
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.transform = position.transform + ' scale(1)';
            }
        }, 300);
    }

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
