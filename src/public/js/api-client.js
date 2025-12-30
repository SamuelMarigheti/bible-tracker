// Cliente API para integração multi-usuário
let currentUser = null;

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

        // Mostrar nome do usuário no header
        const userInfo = document.createElement('div');
        userInfo.style.cssText = 'position: fixed; top: 10px; right: 10px; background: var(--pergaminho); padding: 0.8rem 1.2rem; border: 2px solid var(--marrom); border-radius: 10px; box-shadow: 0 4px 10px var(--sombra); z-index: 1000; display: flex; gap: 1rem; align-items: center;';
        userInfo.innerHTML = `
            <span style="font-weight: 600; color: var(--marrom);">
                <i class="fas fa-user"></i> ${currentUser.nome}
            </span>
            ${currentUser.isAdmin ? `<a href="/admin" style="color: var(--dourado); text-decoration: none;"><i class="fas fa-cog"></i> Admin</a>` : ''}
            <button onclick="logout()" style="background: var(--marrom); color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">
                <i class="fas fa-sign-out-alt"></i> Sair
            </button>
        `;
        document.body.appendChild(userInfo);

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
    atualizarHeatmap();
};

// Substituir função carregarProgresso original
const _carregarProgressoOriginal = window.carregarProgresso;
window.carregarProgresso = async function() {
    if (!currentUser) return;

    try {
        const response = await fetch('/api/progresso');
        const dados = await response.json();

        if (dados && dados.length > 0) {
            progressoData.progresso = {};
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
                inicio: new Date().toISOString().split('T')[0],
                stats: { totalDias: 365, diasLidos: 0, streak: 0 }
            };
        }

        // Atualizar interface
        if (typeof calcularEstatisticas === 'function') {
            calcularEstatisticas();
        }
        if (typeof atualizarHeatmap === 'function') {
            atualizarHeatmap();
        }
    } catch (err) {
        console.error('Erro ao carregar progresso:', err);
        progressoData = {
            progresso: {},
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

// Função de logout
window.logout = async function() {
    if (confirm('Tem certeza que deseja sair?')) {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    }
};

// Inicializar quando a página carregar
(async function() {
    const isAuth = await checkAuth();
    if (isAuth) {
        // Aguardar carregamento do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                await carregarProgresso();
            });
        } else {
            await carregarProgresso();
        }
    }
})();
