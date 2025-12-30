// ==================== VARIÁVEIS GLOBAIS ====================
let diaAtual = 1;
let progressoData = {
    progresso: {},
    stats: { totalDias: 365, diasLidos: 0, streak: 0 }
};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar dados do backend
    if (typeof carregarProgresso === 'function') {
        await carregarProgresso();
    }

    // Inicializar interface
    irParaDiaAtual();
    atualizarTodasEstatisticas();
    criarCalendarioHeatmap();
    configurarEventos();
    atualizarDataAtual();
});

// ==================== FUNÇÕES DE DATA ====================
function atualizarDataAtual() {
    const agora = new Date();
    const opcoes = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const dataFormatada = agora.toLocaleDateString('pt-BR', opcoes);
    document.getElementById('dataAtual').textContent = dataFormatada;
}

function irParaDiaAtual() {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), 0, 1);
    const diff = hoje - inicio;
    const umDia = 1000 * 60 * 60 * 24;
    const diaDoAno = Math.floor(diff / umDia) + 1;

    diaAtual = Math.min(diaDoAno, 365);
    exibirDia(diaAtual);
}

// ==================== EXIBIÇÃO DO DIA ====================
function exibirDia(dia) {
    diaAtual = Math.max(1, Math.min(365, dia));

    // Atualizar número do dia
    document.getElementById('numeroDia').textContent = diaAtual;
    document.getElementById('diaAtualStat').textContent = diaAtual;

    // Buscar dados do dia no planoLeitura
    const dadosDia = planoLeitura.find(d => d.dia === diaAtual);

    if (dadosDia) {
        exibirReferencias(dadosDia.referencias);
    }

    // Atualizar checkbox
    const checkbox = document.getElementById('diaCompleto');
    checkbox.checked = progressoData.progresso[diaAtual] || false;

    // Atualizar progresso do dia
    atualizarProgressoDia();

    // Destacar no heatmap
    destacarDiaNoHeatmap(diaAtual);
}

function exibirReferencias(referencias) {
    const container = document.getElementById('referencias');
    container.innerHTML = '';

    referencias.forEach(ref => {
        const div = document.createElement('div');
        div.className = 'ref-item';
        div.innerHTML = formatarReferencia(ref);
        container.appendChild(div);
    });

    // Adicionar tooltips
    if (typeof adicionarTooltips === 'function') {
        adicionarTooltips();
    }
}

function atualizarProgressoDia() {
    const totalRefs = document.querySelectorAll('.ref-item').length;
    const lidas = progressoData.progresso[diaAtual] ? totalRefs : 0;
    const percentual = totalRefs > 0 ? Math.round((lidas / totalRefs) * 100) : 0;

    const barraDia = document.getElementById('barraDia');
    const percentualDia = document.getElementById('percentualDia');

    barraDia.style.width = percentual + '%';
    percentualDia.textContent = percentual + '%';
}

// ==================== ESTATÍSTICAS ====================
function atualizarTodasEstatisticas() {
    const diasCompletos = Object.values(progressoData.progresso).filter(v => v).length;
    const diasRestantes = 365 - diasCompletos;
    const percentualAnual = Math.round((diasCompletos / 365) * 100);
    const sequencia = calcularSequencia();

    // Atualizar interface
    document.getElementById('completosStat').textContent = diasCompletos;
    document.getElementById('restantesStat').textContent = diasRestantes;
    document.getElementById('sequenciaStat').textContent = sequencia;

    const barraAnual = document.getElementById('barraAnual');
    const percentualAnualEl = document.getElementById('percentualAnual');
    barraAnual.style.width = percentualAnual + '%';
    percentualAnualEl.textContent = percentualAnual + '%';
}

function calcularSequencia() {
    let sequencia = 0;
    let maxSequencia = 0;

    for (let i = 1; i <= 365; i++) {
        if (progressoData.progresso[i]) {
            sequencia++;
            maxSequencia = Math.max(maxSequencia, sequencia);
        } else {
            sequencia = 0;
        }
    }

    return maxSequencia;
}

// ==================== CALENDÁRIO HEATMAP ====================
function criarCalendarioHeatmap() {
    const container = document.getElementById('heatmap');
    container.innerHTML = '';

    for (let dia = 1; dia <= 365; dia++) {
        const div = document.createElement('div');
        div.className = 'heatmap-day';
        div.dataset.dia = dia;
        div.title = `Dia ${dia}`;

        // Determinar nível (cor)
        const concluido = progressoData.progresso[dia];
        div.classList.add(concluido ? 'level-4' : 'level-0');

        // Evento de clique
        div.addEventListener('click', () => {
            exibirDia(dia);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        container.appendChild(div);
    }
}

function destacarDiaNoHeatmap(dia) {
    // Remover destaque anterior
    document.querySelectorAll('.heatmap-day').forEach(el => {
        el.style.border = 'none';
    });

    // Adicionar destaque ao dia atual
    const diaEl = document.querySelector(`.heatmap-day[data-dia="${dia}"]`);
    if (diaEl) {
        diaEl.style.border = '2px solid #ff6b6b';
        diaEl.style.transform = 'scale(1.2)';
    }
}

// ==================== EVENTOS ====================
function configurarEventos() {
    // Navegação de dias
    document.getElementById('btnAnterior').addEventListener('click', () => {
        exibirDia(diaAtual - 1);
    });

    document.getElementById('btnProximo').addEventListener('click', () => {
        exibirDia(diaAtual + 1);
    });

    // Checkbox de conclusão
    document.getElementById('diaCompleto').addEventListener('change', (e) => {
        progressoData.progresso[diaAtual] = e.target.checked;

        if (typeof salvarProgresso === 'function') {
            salvarProgresso();
        }

        atualizarTodasEstatisticas();
        criarCalendarioHeatmap();
        atualizarProgressoDia();
    });

    // Menu mobile
    const sidebar = document.getElementById('sidebar');
    const openSidebar = document.getElementById('openSidebar');
    const closeSidebar = document.getElementById('closeSidebar');

    openSidebar.addEventListener('click', () => {
        sidebar.classList.add('show');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });

    // Exportar PDF
    document.getElementById('btnExportar').addEventListener('click', () => {
        window.print();
    });

    // Conquistas
    document.getElementById('btnConquistas').addEventListener('click', () => {
        abrirModalConquistas();
    });

    // Fechar modal
    document.getElementById('closeConquistas').addEventListener('click', () => {
        document.getElementById('modalConquistas').classList.remove('show');
    });
}

// ==================== MODAL CONQUISTAS ====================
function abrirModalConquistas() {
    const modal = document.getElementById('modalConquistas');
    const container = document.getElementById('conquistasContainer');

    const conquistas = [
        { id: 'primeiro-dia', titulo: 'Primeiro Dia', descricao: 'Complete o primeiro dia', desbloqueada: progressoData.progresso[1] },
        { id: 'uma-semana', titulo: 'Uma Semana', descricao: 'Complete 7 dias', desbloqueada: Object.values(progressoData.progresso).filter(v => v).length >= 7 },
        { id: 'um-mes', titulo: 'Um Mês', descricao: 'Complete 30 dias', desbloqueada: Object.values(progressoData.progresso).filter(v => v).length >= 30 },
        { id: 'tres-meses', titulo: 'Três Meses', descricao: 'Complete 90 dias', desbloqueada: Object.values(progressoData.progresso).filter(v => v).length >= 90 },
        { id: 'meio-ano', titulo: 'Meio Ano', descricao: 'Complete 180 dias', desbloqueada: Object.values(progressoData.progresso).filter(v => v).length >= 180 },
        { id: 'completo', titulo: 'Jornada Completa!', descricao: 'Complete todos os 365 dias', desbloqueada: Object.values(progressoData.progresso).filter(v => v).length === 365 }
    ];

    container.innerHTML = conquistas.map(c => `
        <div class="conquista ${c.desbloqueada ? 'desbloqueada' : 'bloqueada'}">
            <i class="fas fa-trophy"></i>
            <h3>${c.titulo}</h3>
            <p>${c.descricao}</p>
            ${c.desbloqueada ? '<span class="badge">✓ Desbloqueada</span>' : '<span class="badge-locked">🔒 Bloqueada</span>'}
        </div>
    `).join('');

    modal.classList.add('show');
}

// ==================== UTILITÁRIOS ====================
function salvarProgresso() {
    // Esta função será sobrescrita pelo api-client.js
    // Fallback para localStorage
    if (!window.currentUser) {
        localStorage.setItem('biblia_progresso', JSON.stringify(progressoData));
    }
}

function carregarProgresso() {
    // Esta função será sobrescrita pelo api-client.js
    // Fallback para localStorage
    if (!window.currentUser) {
        const dados = localStorage.getItem('biblia_progresso');
        if (dados) {
            progressoData = JSON.parse(dados);
        }
    }
}
