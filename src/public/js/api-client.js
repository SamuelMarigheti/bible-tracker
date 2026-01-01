// Cliente API para integração multi-usuário
let currentUser = null;
let deveTrocarSenha = false;

// ==================== TIMEOUT DE SESSÃO ====================
const TEMPO_INATIVIDADE = 30 * 60 * 1000; // 30 minutos em milissegundos
const TEMPO_AVISO = 2 * 60 * 1000; // Avisar 2 minutos antes
let timeoutInatividade = null;
let timeoutAviso = null;
let ultimaAtividade = Date.now();

// Atualizar última atividade
function atualizarAtividade() {
    ultimaAtividade = Date.now();
    resetarTimeouts();
}

// Resetar os timeouts
function resetarTimeouts() {
    // Limpar timeouts anteriores
    if (timeoutInatividade) clearTimeout(timeoutInatividade);
    if (timeoutAviso) clearTimeout(timeoutAviso);

    // Aviso 2 minutos antes
    timeoutAviso = setTimeout(async () => {
        const continuar = await customConfirm(
            'Sua sessão vai expirar em 2 minutos por inatividade.\n\nDeseja continuar conectado?',
            {
                title: 'Sessão Expirando',
                type: 'warning',
                confirmText: 'Continuar conectado',
                cancelText: 'Sair'
            }
        );
        if (continuar) {
            atualizarAtividade();
        }
    }, TEMPO_INATIVIDADE - TEMPO_AVISO);

    // Logout automático após 30 minutos
    timeoutInatividade = setTimeout(() => {
        showWarning('Sua sessão expirou por inatividade.\n\nVocê será redirecionado para a tela de login.');
        setTimeout(() => logout(true), 2000); // true = não perguntar confirmação
    }, TEMPO_INATIVIDADE);
}

// Detectar atividade do usuário
function iniciarDeteccaoAtividade() {
    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    eventos.forEach(evento => {
        document.addEventListener(evento, () => {
            const agora = Date.now();
            // Só atualizar se passou mais de 1 minuto desde a última atividade (evitar sobrecarga)
            if (agora - ultimaAtividade > 60000) {
                atualizarAtividade();
            }
        }, { passive: true });
    });

    // Iniciar timeouts
    resetarTimeouts();
}

// Validar senha forte
function validarSenhaForte(senha) {
    if (senha.length < 8) {
        return { valida: false, erro: 'A senha deve ter no mínimo 8 caracteres' };
    }

    const temCaractereEspecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~]/.test(senha);
    if (!temCaractereEspecial) {
        return { valida: false, erro: 'A senha deve conter pelo menos um caractere especial (!@#$%&*...)' };
    }

    return { valida: true };
}

// Verificar autenticação e redirecionar se necessário
async function checkAuth() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();

        if (!data.autenticado) {
            window.location.href = '/';
            return false;
        }

        currentUser = data.usuario;
        deveTrocarSenha = data.deveTrocarSenha || false;

        // Atualizar nome do usuário no header
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = currentUser.nome;
        }

        // Mostrar botão admin se for admin
        const btnAdmin = document.getElementById('btnAdmin');
        if (btnAdmin && currentUser.isAdmin) {
            btnAdmin.style.display = 'block';
        }

        // Verificar se deve trocar senha (primeiro login)
        if (deveTrocarSenha) {
            mostrarModalTrocarSenhaObrigatorio();
        }

        return true;
    } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        window.location.href = '/';
        return false;
    }
}

// Substituir função salvarProgresso original
const _salvarProgressoOriginal = window.salvarProgresso;
window.salvarProgresso = async function() {
    if (!currentUser) return;

    // Salvar cada dia individualmente
    for (const [dia, concluido] of Object.entries(progressoData.progresso)) {
        try {
            await fetch('/api/progresso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dia: parseInt(dia),
                    concluido: concluido
                })
            });
        } catch (err) {
            console.error('Erro ao salvar progresso:', err);
        }
    }

    verificarNovasConquistas();
    // Atualizar calendário após salvar progresso
    if (typeof criarCalendarioHeatmap === 'function') {
        criarCalendarioHeatmap();
    }
};

// Substituir função carregarProgresso original
const _carregarProgressoOriginal = window.carregarProgresso;
window.carregarProgresso = async function() {
    if (!currentUser) return;

    try {
        // Carregar progresso de dias completos
        const response = await fetch('/api/progresso');
        const dados = await response.json();

        // Carregar referências lidas individuais
        const refResponse = await fetch('/api/referencias-lidas');
        const referenciasLidas = await refResponse.json();

        if (dados && dados.length > 0) {
            progressoData.progresso = {};
            progressoData.referenciasLidas = referenciasLidas || {};

            dados.forEach(item => {
                progressoData.progresso[item.dia] = item.concluido === 1;
            });

            // Calcular estatísticas
            progressoData.stats = {
                totalDias: 365,
                diasLidos: Object.values(progressoData.progresso).filter(v => v).length,
                streak: 0
            };
        } else {
            progressoData = {
                progresso: {},
                referenciasLidas: referenciasLidas || {},
                inicio: new Date().toISOString().split('T')[0],
                stats: { totalDias: 365, diasLidos: 0, streak: 0 }
            };
        }

        // Atualizar interface
        if (typeof calcularEstatisticas === 'function') {
            calcularEstatisticas();
        }
        if (typeof criarCalendarioHeatmap === 'function') {
            criarCalendarioHeatmap();
        }
        // Atualizar visualização do dia atual se estiver na página
        if (typeof atualizarProgressoDia === 'function') {
            atualizarProgressoDia();
        }
    } catch (err) {
        console.error('Erro ao carregar progresso:', err);
        progressoData = {
            progresso: {},
            referenciasLidas: {},
            inicio: new Date().toISOString().split('T')[0],
            stats: { totalDias: 365, diasLidos: 0, streak: 0 }
        };
    }
};

// Substituir localStorage para conquistas
const _salvarConquistasOriginal = window.salvarConquistas || function() {};
window.salvarConquistas = async function(conquistaId) {
    if (!currentUser) return;

    try {
        await fetch('/api/conquistas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conquistaId })
        });
    } catch (err) {
        console.error('Erro ao salvar conquista:', err);
    }
};

const _carregarConquistasOriginal = window.carregarConquistas || function() { return []; };
window.carregarConquistas = async function() {
    if (!currentUser) return [];

    try {
        const response = await fetch('/api/conquistas');
        return await response.json();
    } catch (err) {
        console.error('Erro ao carregar conquistas:', err);
        return [];
    }
};

// Salvar referência lida individual
window.salvarReferenciaLida = async function(dia, referenciaIndex, lida) {
    if (!currentUser) return;

    try {
        await fetch('/api/referencias-lidas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dia, referenciaIndex, lida })
        });
    } catch (err) {
        console.error('Erro ao salvar referência lida:', err);
    }
};

// Salvar múltiplas referências de uma vez (bulk)
window.salvarReferenciasLidasBulk = async function(dia, indices) {
    if (!currentUser) return;

    try {
        await fetch('/api/referencias-lidas/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dia, indices })
        });
    } catch (err) {
        console.error('Erro ao salvar referências em lote:', err);
    }
};

// Função de logout
window.logout = async function(forcarSaida = false) {
    if (forcarSaida) {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
        return;
    }

    const confirmacao = await customConfirm('Tem certeza que deseja sair?', {
        title: 'Sair',
        confirmText: 'Sim, sair',
        cancelText: 'Cancelar'
    });

    if (confirmacao) {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    }
};

// Mostrar modal de troca de senha obrigatória
function mostrarModalTrocarSenhaObrigatorio() {
    const modal = document.getElementById('modalTrocarSenhaObrigatorio');
    if (!modal) return;

    modal.classList.add('show');

    // Configurar formulário
    const form = document.getElementById('formTrocarSenhaObrigatorio');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();

        const senhaAtual = document.getElementById('senhaAtualObrig').value;
        const senhaNova = document.getElementById('senhaNovaObrig').value;
        const senhaConfirma = document.getElementById('senhaConfirmaObrig').value;

        // Validar confirmação
        if (senhaNova !== senhaConfirma) {
            showError('As senhas não coincidem!');
            return;
        }

        // Validar senha forte
        const validacao = validarSenhaForte(senhaNova);
        if (!validacao.valida) {
            showError(validacao.erro);
            return;
        }

        try {
            const response = await fetch('/api/usuarios/minha-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senhaAtual, novaSenha: senhaNova })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showSuccess('Senha alterada com sucesso!\n\nA página será recarregada.');

                // Fechar modal completamente
                modal.classList.remove('show');
                modal.style.display = 'none'; // Garantir que está escondido
                form.reset();
                deveTrocarSenha = false;

                // Recarregar a página para garantir inicialização completa
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showError(data.error || 'Erro ao alterar senha');
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            showError('Erro ao alterar senha. Tente novamente.');
        }
    };
}

// ==================== SISTEMA DE AUTO-ATUALIZAÇÃO ====================
let lastProgressUpdate = Date.now();
let autoUpdateInterval = null;
const AUTO_UPDATE_INTERVAL = 60 * 1000; // Verificar a cada 60 segundos

async function verificarAtualizacoes() {
    if (!currentUser || deveTrocarSenha) return;

    try {
        // Buscar progresso atualizado
        const response = await fetch('/api/progresso');
        if (!response.ok) return;

        const dados = await response.json();

        if (dados && dados.length > 0) {
            const novoProgresso = {};
            dados.forEach(item => {
                novoProgresso[item.dia] = item.concluido === 1;
            });

            // Verificar se houve alterações
            const progressoAtualStr = JSON.stringify(progressoData.progresso);
            const novoProgressoStr = JSON.stringify(novoProgresso);

            if (progressoAtualStr !== novoProgressoStr) {
                // Atualizar dados
                progressoData.progresso = novoProgresso;
                progressoData.stats = {
                    totalDias: 365,
                    diasLidos: Object.values(novoProgresso).filter(v => v).length,
                    streak: 0
                };

                // Atualizar interface
                if (typeof atualizarTodasEstatisticas === 'function') {
                    atualizarTodasEstatisticas();
                }
                if (typeof criarCalendarioHeatmap === 'function') {
                    criarCalendarioHeatmap();
                }
                if (typeof atualizarProgressoDia === 'function') {
                    atualizarProgressoDia();
                }

                lastProgressUpdate = Date.now();
            }
        }
    } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
    }
}

function iniciarAutoAtualizacao() {
    // Limpar intervalo anterior se existir
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }

    // Iniciar polling
    autoUpdateInterval = setInterval(verificarAtualizacoes, AUTO_UPDATE_INTERVAL);
}

function pararAutoAtualizacao() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
}

// Inicializar quando a página carregar
(async function() {
    const isAuth = await checkAuth();
    if (isAuth) {
        // Iniciar detecção de atividade para timeout de sessão
        iniciarDeteccaoAtividade();

        // SEMPRE carregar progresso, mesmo se deve trocar senha
        // Isso garante que a interface não fique em branco
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                await carregarProgresso();
                // Iniciar auto-atualização SOMENTE se não deve trocar senha
                if (!deveTrocarSenha) {
                    iniciarAutoAtualizacao();
                }
            });
        } else {
            await carregarProgresso();
            // Iniciar auto-atualização SOMENTE se não deve trocar senha
            if (!deveTrocarSenha) {
                iniciarAutoAtualizacao();
            }
        }
    }
})();

// Pausar auto-atualização quando a aba não estiver visível (economia de recursos)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pararAutoAtualizacao();
    } else if (currentUser && !deveTrocarSenha) {
        iniciarAutoAtualizacao();
        // Verificar imediatamente ao voltar para a aba
        verificarAtualizacoes();
    }
});
