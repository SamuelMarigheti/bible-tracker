// ==================== VARIÁVEIS GLOBAIS ====================
let diaAtual = 1;
// IMPORTANTE: Sempre inicializar todas as propriedades para evitar undefined
let progressoData = {
    progresso: {}, // { dia: boolean } - dia completado ou não
    referenciasLidas: {}, // { dia: [indices das refs lidas] } - CRÍTICO: sempre deve existir
    stats: { totalDias: 365, diasLidos: 0, streak: 0 }
};

// Cache da data do servidor para evitar múltiplas requisições
let serverTimeCache = null;
let serverTimeCacheExpiry = 0;
let currentServerDate = null; // Data atual do servidor como objeto Date

// Cache de elementos DOM para performance
const domCache = {};
function getCachedElement(id) {
    if (!domCache[id]) {
        domCache[id] = document.getElementById(id);
    }
    return domCache[id];
}

// Throttle para otimizar eventos frequentes
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

// Debounce para salvar progresso (evitar múltiplas chamadas)
let salvarProgressoTimeout = null;
function salvarProgressoDebounced() {
    if (salvarProgressoTimeout) clearTimeout(salvarProgressoTimeout);
    salvarProgressoTimeout = setTimeout(() => {
        if (typeof salvarProgresso === 'function') {
            salvarProgresso();
        }
    }, 300); // Aguardar 300ms antes de salvar (reduzido de 500ms para melhor responsividade)
}

// Request Animation Frame para atualizações visuais suaves
function atualizarInterfaceOtimizado(callback) {
    if ('requestAnimationFrame' in window) {
        requestAnimationFrame(callback);
    } else {
        callback();
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Buscar hora do servidor primeiro para garantir timezone correto
    await getServerTime();

    // Carregar dados do backend
    if (typeof carregarProgresso === 'function') {
        await carregarProgresso();
    }

    // Carregar conquistas
    await carregarConquistasDesbloqueadas();

    // Inicializar interface
    await irParaDiaAtual();
    atualizarTodasEstatisticas();
    criarCalendarioHeatmap();
    configurarEventos();
    atualizarDataAtual();
});

// ==================== FUNÇÕES DE DATA ====================

// Buscar hora atual do servidor (com cache de 5 minutos)
async function getServerTime() {
    const now = Date.now();

    // Usar cache se ainda válido (5 minutos)
    if (serverTimeCache && now < serverTimeCacheExpiry) {
        return serverTimeCache;
    }

    try {
        const response = await fetch('/api/server-time');
        const data = await response.json();

        // Cachear por 5 minutos
        serverTimeCache = data;
        serverTimeCacheExpiry = now + (5 * 60 * 1000);

        // Criar objeto Date a partir da data do servidor
        currentServerDate = new Date(data.timestamp);

        // Atualizar variáveis do calendário com a data do servidor
        if (typeof mesAtualCalendario !== 'undefined') {
            mesAtualCalendario = data.month;
            anoAtualCalendario = data.year;
        }

        return data;
    } catch (error) {
        console.error('Erro ao buscar hora do servidor, usando hora local:', error);
        // Fallback para hora local se falhar
        const hoje = new Date();
        const inicio = new Date(hoje.getFullYear(), 0, 1);
        const diaDoAno = Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24)) + 1;

        // Definir data atual do servidor como hora local em fallback
        currentServerDate = hoje;

        return {
            timestamp: hoje.getTime(),
            iso: hoje.toISOString(),
            timezone: 'Local',
            year: hoje.getFullYear(),
            month: hoje.getMonth(),
            date: hoje.getDate(),
            dayOfYear: diaDoAno
        };
    }
}

function atualizarDataAtual() {
    const agora = new Date();
    const opcoes = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Sao_Paulo' // Usar timezone consistente com servidor
    };
    const dataFormatada = agora.toLocaleDateString('pt-BR', opcoes);
    document.getElementById('dataAtual').textContent = dataFormatada;
}

async function irParaDiaAtual() {
    const serverTime = await getServerTime();
    diaAtual = Math.min(serverTime.dayOfYear, 365);
    exibirDia(diaAtual);
}

// ==================== EXIBIÇÃO DO DIA ====================
function exibirDia(dia) {
    diaAtual = Math.max(1, Math.min(365, dia));

    // Atualizar número do dia
    getCachedElement('numeroDia').textContent = diaAtual;
    getCachedElement('diaAtualStat').textContent = diaAtual;

    // Buscar dados do dia no planoLeitura
    const dadosDia = planoLeitura.find(d => d.dia === diaAtual);

    if (dadosDia) {
        exibirReferencias(dadosDia.referencias);
    }

    // Atualizar checkbox
    const checkbox = getCachedElement('diaCompleto');
    checkbox.checked = progressoData.progresso[diaAtual] || false;

    // Atualizar progresso do dia
    atualizarProgressoDia();

    // Destacar no heatmap
    destacarDiaNoHeatmap(diaAtual);
}

function exibirReferencias(referencias) {
    const container = getCachedElement('referencias');

    // Resetar contexto do último livro ao trocar de dia
    if (typeof resetarUltimoLivro === 'function') {
        resetarUltimoLivro();
    }

    // Garantir que referenciasLidas existe (proteção contra undefined)
    if (!progressoData.referenciasLidas) {
        progressoData.referenciasLidas = {};
    }

    // Recuperar referências lidas deste dia
    const referenciasLidas = progressoData.referenciasLidas[diaAtual] || [];

    // Usar DocumentFragment para melhor performance
    const fragment = document.createDocumentFragment();

    referencias.forEach((ref, index) => {
        const div = document.createElement('div');
        div.className = 'ref-item';
        if (referenciasLidas.includes(index)) {
            div.classList.add('lida');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'ref-checkbox';
        checkbox.checked = referenciasLidas.includes(index);
        checkbox.dataset.index = index;

        const textSpan = document.createElement('span');
        textSpan.className = 'ref-text';
        textSpan.innerHTML = formatarReferencia(ref);

        // Evento de clique no checkbox
        checkbox.addEventListener('change', () => {
            toggleReferenciaLida(index);
        });

        // Clique no item inteiro (desktop e mobile) - marcar/desmarcar leitura
        div.addEventListener('click', (e) => {
            // Se clicou no checkbox, deixar o comportamento nativo
            if (e.target === checkbox) return;

            // Se clicou na abreviação do livro, mostrar nome completo
            if (e.target.classList.contains('livro-ref')) {
                const tooltip = e.target.dataset.tooltip;
                if (tooltip) {
                    showInfo(tooltip);
                }
                return;
            }

            // Caso contrário, toggle da leitura
            checkbox.checked = !checkbox.checked;
            toggleReferenciaLida(index);
        });

        div.appendChild(checkbox);
        div.appendChild(textSpan);
        fragment.appendChild(div);
    });

    // Limpar container e adicionar tudo de uma vez (melhor performance)
    container.innerHTML = '';
    container.appendChild(fragment);

    // Atualizar contador
    atualizarContadorReferencias();
}

function toggleReferenciaLida(index) {
    if (!progressoData.referenciasLidas[diaAtual]) {
        progressoData.referenciasLidas[diaAtual] = [];
    }

    const refIndex = progressoData.referenciasLidas[diaAtual].indexOf(index);
    const refItem = document.querySelector(`.ref-checkbox[data-index="${index}"]`)?.parentElement;

    const wasLida = refIndex > -1;

    if (wasLida) {
        // Remover
        progressoData.referenciasLidas[diaAtual].splice(refIndex, 1);
        refItem?.classList.remove('lida');
    } else {
        // Adicionar
        progressoData.referenciasLidas[diaAtual].push(index);
        refItem?.classList.add('lida');
    }

    // Salvar no banco de dados
    if (typeof salvarReferenciaLida === 'function') {
        salvarReferenciaLida(diaAtual, index, !wasLida);
    }

    atualizarContadorReferencias();
    atualizarProgressoDia();
    salvarProgressoDebounced(); // Usar debounced para evitar múltiplas chamadas
    verificarDiaCompleto();
}

function atualizarContadorReferencias() {
    const total = document.querySelectorAll('.ref-item').length;
    const lidas = (progressoData.referenciasLidas[diaAtual] || []).length;

    getCachedElement('contadorTotal').textContent = total;
    getCachedElement('contadorLidas').textContent = lidas;

    // Atualizar texto do botão
    const btnMarcarTodos = getCachedElement('btnMarcarTodos');
    if (btnMarcarTodos) {
        if (lidas === total && total > 0) {
            btnMarcarTodos.innerHTML = '<i class="fas fa-times-circle"></i> Desmarcar Todos';
        } else {
            btnMarcarTodos.innerHTML = '<i class="fas fa-check-double"></i> Marcar Todos';
        }
    }
}

function atualizarProgressoDia() {
    const totalRefs = document.querySelectorAll('.ref-item').length;
    const lidas = (progressoData.referenciasLidas[diaAtual] || []).length;
    const percentual = totalRefs > 0 ? Math.round((lidas / totalRefs) * 100) : 0;

    const barraDia = getCachedElement('barraDia');
    const percentualDia = getCachedElement('percentualDia');

    // Atualizar badge de progresso
    const badgeProgressoDia = getCachedElement('badgeProgressoDia');
    const badgeTexto = getCachedElement('badgeTexto');
    const badgePercentual = getCachedElement('badgePercentual');

    if (barraDia && percentualDia) {
        // Usar requestAnimationFrame para animação suave
        atualizarInterfaceOtimizado(() => {
            barraDia.style.width = percentual + '%';
            percentualDia.textContent = percentual + '%';

            // Atualizar badge
            if (badgeTexto && badgePercentual && badgeProgressoDia) {
                badgeTexto.textContent = `${lidas}/${totalRefs} leituras`;
                badgePercentual.textContent = `${percentual}%`;

                // Adicionar animação de pulso
                badgeProgressoDia.classList.remove('pulse-animation');
                void badgeProgressoDia.offsetWidth; // Forçar reflow
                badgeProgressoDia.classList.add('pulse-animation');

                // Remover classe após a animação
                setTimeout(() => {
                    badgeProgressoDia.classList.remove('pulse-animation');
                }, 500);

                // Adicionar classe 'completo' quando 100%
                if (percentual === 100) {
                    badgeProgressoDia.classList.add('completo');
                } else {
                    badgeProgressoDia.classList.remove('completo');
                }
            }
        });
    }
}

function verificarDiaCompleto() {
    const totalRefs = document.querySelectorAll('.ref-item').length;
    const lidas = (progressoData.referenciasLidas[diaAtual] || []).length;
    const checkbox = getCachedElement('diaCompleto');

    if (totalRefs > 0 && lidas === totalRefs) {
        checkbox.checked = true;
        if (!progressoData.progresso[diaAtual]) {
            marcarDiaCompleto(true);
        }
    } else if (lidas === 0) {
        checkbox.checked = false;
        if (progressoData.progresso[diaAtual]) {
            marcarDiaCompleto(false);
        }
    }
}

function marcarDiaCompleto(completo) {
    progressoData.progresso[diaAtual] = completo;

    if (typeof salvarProgresso === 'function') {
        salvarProgresso();
    }

    atualizarTodasEstatisticas();
    criarCalendarioHeatmap();
    atualizarProgressoDia();

    // Verificar novas conquistas quando completar um dia
    if (completo) {
        verificarNovasConquistas();
    }
}

function marcarTodasReferencias() {
    const totalRefs = document.querySelectorAll('.ref-item').length;
    const jaTodasLidas = (progressoData.referenciasLidas[diaAtual] || []).length === totalRefs;

    if (jaTodasLidas) {
        // Desmarcar todas
        progressoData.referenciasLidas[diaAtual] = [];
        document.querySelectorAll('.ref-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.ref-item').forEach(item => item.classList.remove('lida'));
    } else {
        // Marcar todas
        progressoData.referenciasLidas[diaAtual] = Array.from({length: totalRefs}, (_, i) => i);
        document.querySelectorAll('.ref-checkbox').forEach(cb => cb.checked = true);
        document.querySelectorAll('.ref-item').forEach(item => item.classList.add('lida'));
    }

    // Salvar no banco de dados usando bulk update
    if (typeof salvarReferenciasLidasBulk === 'function') {
        salvarReferenciasLidasBulk(diaAtual, progressoData.referenciasLidas[diaAtual] || []);
    }

    atualizarContadorReferencias();
    atualizarProgressoDia();
    salvarProgressoDebounced(); // Usar debounced para evitar múltiplas chamadas
    verificarDiaCompleto();
}

// ==================== ESTATÍSTICAS ====================
function atualizarTodasEstatisticas() {
    const diasCompletos = Object.values(progressoData.progresso).filter(v => v).length;
    const diasRestantes = 365 - diasCompletos;
    const percentualAnual = Math.round((diasCompletos / 365) * 100);
    const sequencia = calcularSequencia();

    // Atualizar interface com requestAnimationFrame
    atualizarInterfaceOtimizado(() => {
        getCachedElement('completosStat').textContent = diasCompletos;
        getCachedElement('restantesStat').textContent = diasRestantes;
        getCachedElement('sequenciaStat').textContent = sequencia;

        const barraAnual = getCachedElement('barraAnual');
        const percentualAnualEl = getCachedElement('percentualAnual');
        barraAnual.style.width = percentualAnual + '%';
        percentualAnualEl.textContent = percentualAnual + '%';
    });
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

// ==================== CALENDÁRIO MENSAL ====================
let mesAtualCalendario = new Date().getMonth();
let anoAtualCalendario = new Date().getFullYear();
let calendarioInicializado = false; // Flag para garantir inicialização única

function inicializarEventosCalendario() {
    // Garantir que eventos sejam registrados apenas uma vez
    if (calendarioInicializado) return;
    calendarioInicializado = true;

    // Preencher seletor de ano (2026 até 2050)
    const seletorAno = getCachedElement('seletorAno');
    const anoAtual = new Date().getFullYear();
    const anoInicio = Math.max(2026, anoAtual); // Começar de 2026 ou ano atual, o que for maior

    for (let ano = anoInicio; ano <= 2050; ano++) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        if (ano === anoAtual) option.selected = true;
        seletorAno.appendChild(option);
    }

    // Selecionar mês atual
    getCachedElement('seletorMes').value = mesAtualCalendario;
    getCachedElement('seletorAno').value = anoAtualCalendario;

    // Eventos de mudança dos seletores
    getCachedElement('seletorMes').addEventListener('change', (e) => {
        mesAtualCalendario = parseInt(e.target.value);
        renderizarMesCalendario();
    });

    getCachedElement('seletorAno').addEventListener('change', (e) => {
        anoAtualCalendario = parseInt(e.target.value);
        renderizarMesCalendario();
    });

    // Eventos das setas de navegação
    getCachedElement('btnMesAnterior').addEventListener('click', () => {
        mesAtualCalendario--;
        if (mesAtualCalendario < 0) {
            mesAtualCalendario = 11;
            anoAtualCalendario--;
        }
        atualizarSeletoresCalendario();
        renderizarMesCalendario();
    });

    getCachedElement('btnMesProximo').addEventListener('click', () => {
        mesAtualCalendario++;
        if (mesAtualCalendario > 11) {
            mesAtualCalendario = 0;
            anoAtualCalendario++;
        }
        atualizarSeletoresCalendario();
        renderizarMesCalendario();
    });
}

function atualizarSeletoresCalendario() {
    getCachedElement('seletorMes').value = mesAtualCalendario;
    getCachedElement('seletorAno').value = anoAtualCalendario;
}

function criarCalendarioHeatmap() {
    // Inicializar eventos APENAS na primeira vez
    inicializarEventosCalendario();

    // Renderizar mês atual (pode ser chamado múltiplas vezes)
    renderizarMesCalendario();
}

function renderizarMesCalendario() {
    const container = getCachedElement('heatmap');

    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    // Usar DocumentFragment para melhor performance
    const fragment = document.createDocumentFragment();

    // Container do mês
    const mesDiv = document.createElement('div');
    mesDiv.className = 'mes-container-unico';

    // Grid do calendário
    const gridDiv = document.createElement('div');
    gridDiv.className = 'mes-grid';

    // Adicionar cabeçalho dos dias da semana
    diasSemana.forEach(dia => {
        const diaHeader = document.createElement('div');
        diaHeader.className = 'dia-semana-header';
        diaHeader.textContent = dia;
        gridDiv.appendChild(diaHeader);
    });

    // Obter primeiro dia do mês e quantos dias tem
    const primeiroDia = new Date(anoAtualCalendario, mesAtualCalendario, 1);
    const ultimoDia = new Date(anoAtualCalendario, mesAtualCalendario + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const primeiroDiaSemana = primeiroDia.getDay(); // 0 = Domingo

    // Adicionar espaços vazios antes do primeiro dia
    for (let i = 0; i < primeiroDiaSemana; i++) {
        const vazio = document.createElement('div');
        vazio.className = 'dia-vazio';
        gridDiv.appendChild(vazio);
    }

    // Adicionar os dias do mês
    for (let diaDoMes = 1; diaDoMes <= diasNoMes; diaDoMes++) {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'dia-mes';

        // Calcular dia do ano (1-365)
        const dataAtual = new Date(anoAtualCalendario, mesAtualCalendario, diaDoMes);
        const inicioDoAno = new Date(anoAtualCalendario, 0, 1);
        const diaDoAno = Math.floor((dataAtual - inicioDoAno) / (1000 * 60 * 60 * 24)) + 1;

        diaDiv.dataset.dia = diaDoAno;
        diaDiv.textContent = diaDoMes;

        // Verificar se o dia foi concluído
        const concluido = progressoData.progresso[diaDoAno];
        if (concluido) {
            diaDiv.classList.add('concluido');
        }

        // Destacar dia atual (usar data do servidor se disponível)
        const hoje = currentServerDate || new Date();
        if (dataAtual.toDateString() === hoje.toDateString()) {
            diaDiv.classList.add('hoje');
        }

        // Tooltip
        diaDiv.title = `Dia ${diaDoAno} do plano - ${diaDoMes}/${mesAtualCalendario + 1}/${anoAtualCalendario}`;

        // Evento de clique
        diaDiv.addEventListener('click', () => {
            exibirDia(diaDoAno);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        gridDiv.appendChild(diaDiv);
    }

    mesDiv.appendChild(gridDiv);
    fragment.appendChild(mesDiv);

    // Limpar e adicionar de uma vez (reduzir reflows)
    atualizarInterfaceOtimizado(() => {
        container.innerHTML = '';
        container.appendChild(fragment);
        // Atualizar destaque do dia selecionado
        destacarDiaNoHeatmap(diaAtual);
    });
}

function destacarDiaNoHeatmap(dia) {
    // Remover destaque anterior
    document.querySelectorAll('.dia-mes').forEach(el => {
        el.classList.remove('selecionado');
    });

    // Adicionar destaque ao dia atual
    const diaEl = document.querySelector(`.dia-mes[data-dia="${dia}"]`);
    if (diaEl) {
        diaEl.classList.add('selecionado');
        // Scroll suave até o mês do dia
        diaEl.closest('.mes-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    // Checkbox de conclusão - validar antes de permitir marcar
    document.getElementById('diaCompleto').addEventListener('change', (e) => {
        const totalRefs = document.querySelectorAll('.ref-item').length;
        const lidas = (progressoData.referenciasLidas[diaAtual] || []).length;

        // Se está tentando marcar como completo, mas nem todas as leituras foram marcadas
        if (e.target.checked && lidas < totalRefs) {
            e.target.checked = false; // Desmarcar
            showWarning(`Você precisa marcar todas as ${totalRefs} leituras antes de concluir o dia!\n\nLeituras marcadas: ${lidas}/${totalRefs}`);
            return;
        }

        // Se pode marcar ou está desmarcando
        marcarDiaCompleto(e.target.checked);
    });

    // Botão marcar todos
    document.getElementById('btnMarcarTodos')?.addEventListener('click', () => {
        marcarTodasReferencias();
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

    // Novo Ciclo
    document.getElementById('btnNovoCiclo').addEventListener('click', () => {
        abrirModalNovoCiclo();
    });

    document.getElementById('closeNovoCiclo').addEventListener('click', () => {
        document.getElementById('modalNovoCiclo').classList.remove('show');
    });

    document.getElementById('btnCancelarNovoCiclo').addEventListener('click', () => {
        document.getElementById('modalNovoCiclo').classList.remove('show');
    });

    document.getElementById('btnExportarAntes').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('btnConfirmarNovoCiclo').addEventListener('click', () => {
        confirmarNovoCiclo();
    });
}

// ==================== MODAL CONQUISTAS ====================
let conquistasDesbloqueadas = [];

function obterConquistas() {
    const diasCompletos = Object.values(progressoData.progresso).filter(v => v).length;

    return [
        { id: 'primeiro-dia', titulo: '🎯 Primeiro Dia', descricao: 'Complete o primeiro dia', requisito: 1, desbloqueada: diasCompletos >= 1 },
        { id: 'uma-semana', titulo: '📅 Uma Semana', descricao: 'Complete 7 dias', requisito: 7, desbloqueada: diasCompletos >= 7 },
        { id: 'um-mes', titulo: '🌟 Um Mês', descricao: 'Complete 30 dias', requisito: 30, desbloqueada: diasCompletos >= 30 },
        { id: 'tres-meses', titulo: '🔥 Três Meses', descricao: 'Complete 90 dias', requisito: 90, desbloqueada: diasCompletos >= 90 },
        { id: 'meio-ano', titulo: '💎 Meio Ano', descricao: 'Complete 180 dias', requisito: 180, desbloqueada: diasCompletos >= 180 },
        { id: 'completo', titulo: '🏆 Jornada Completa!', descricao: 'Complete todos os 365 dias', requisito: 365, desbloqueada: diasCompletos === 365 }
    ];
}

function verificarNovasConquistas() {
    const conquistas = obterConquistas();
    const novasConquistas = [];

    conquistas.forEach(conquista => {
        if (conquista.desbloqueada && !conquistasDesbloqueadas.includes(conquista.id)) {
            novasConquistas.push(conquista);
            conquistasDesbloqueadas.push(conquista.id);

            // Salvar no backend
            if (typeof salvarConquistas === 'function') {
                salvarConquistas(conquista.id);
            }
        }
    });

    // Mostrar notificação para novas conquistas
    novasConquistas.forEach((conquista, index) => {
        setTimeout(() => {
            mostrarNotificacaoConquista(conquista);
        }, index * 500); // Delay entre múltiplas conquistas
    });
}

function mostrarNotificacaoConquista(conquista) {
    // Criar elemento de notificação
    const notif = document.createElement('div');
    notif.className = 'conquista-toast';
    notif.innerHTML = `
        <div class="conquista-toast-icon">
            <i class="fas fa-trophy"></i>
        </div>
        <div class="conquista-toast-content">
            <strong>Conquista Desbloqueada!</strong>
            <p>${conquista.titulo}</p>
        </div>
    `;

    document.body.appendChild(notif);

    // Animar entrada
    setTimeout(() => notif.classList.add('show'), 10);

    // Remover após 4 segundos
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 4000);

    // Som (opcional - pode comentar se não quiser)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVq3j78dpHgU7k9n0xXkkBSp+y/PajDwJEmGz6OylVBMJSJ3f8rhoHgU2jdLz0Hwm');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignorar erro se não puder tocar
    } catch (e) {}
}

function abrirModalConquistas() {
    const modal = document.getElementById('modalConquistas');
    const container = document.getElementById('conquistasContainer');
    const conquistas = obterConquistas();

    container.innerHTML = conquistas.map(c => `
        <div class="conquista ${c.desbloqueada ? 'desbloqueada' : 'bloqueada'}">
            <div class="conquista-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="conquista-info">
                <h3>${c.titulo}</h3>
                <p>${c.descricao}</p>
                ${c.desbloqueada ?
                    '<span class="conquista-badge desbloqueada">✓ Desbloqueada</span>' :
                    `<span class="conquista-badge bloqueada">🔒 ${c.requisito} dias</span>`
                }
            </div>
        </div>
    `).join('');

    modal.classList.add('show');
}

// Carregar conquistas já desbloqueadas
async function carregarConquistasDesbloqueadas() {
    if (typeof carregarConquistas === 'function') {
        const ids = await carregarConquistas();
        conquistasDesbloqueadas = ids || [];
    }
}

// ==================== MODAL NOVO CICLO ====================
function abrirModalNovoCiclo() {
    const modal = document.getElementById('modalNovoCiclo');

    // Calcular estatísticas atuais
    const diasCompletos = Object.values(progressoData.progresso).filter(v => v).length;
    const progressoAnual = Math.round((diasCompletos / 365) * 100);
    const numConquistas = conquistasDesbloqueadas.length;

    // Preencher modal
    document.getElementById('modalDiasCompletos').textContent = diasCompletos;
    document.getElementById('modalProgressoAnual').textContent = progressoAnual + '%';
    document.getElementById('modalConquistas').textContent = numConquistas;

    modal.classList.add('show');
}

async function confirmarNovoCiclo() {
    // Confirmar ação
    const confirmacao = await customConfirm(
        'Você tem certeza que deseja limpar TODO o seu progresso?\n\n' +
        'Esta ação é PERMANENTE e não pode ser desfeita!\n\n' +
        'Recomendamos exportar seu progresso antes de continuar.',
        {
            title: 'Confirmar Novo Ciclo',
            type: 'danger',
            confirmText: 'Sim, limpar tudo',
            cancelText: 'Cancelar',
            danger: true
        }
    );

    if (!confirmacao) return;

    try {
        // Chamar API para limpar progresso
        const response = await fetch('/api/progresso/limpar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Erro ao limpar progresso');
        }

        // Limpar dados locais
        progressoData = {
            progresso: {},
            referenciasLidas: {},
            stats: { totalDias: 365, diasLidos: 0, streak: 0 }
        };

        conquistasDesbloqueadas = [];

        // Atualizar interface
        document.getElementById('modalNovoCiclo').classList.remove('show');
        irParaDiaAtual();
        atualizarTodasEstatisticas();
        criarCalendarioHeatmap();

        // Mostrar mensagem de sucesso
        showSuccess('Novo ciclo iniciado com sucesso!\n\nTodo o progresso foi limpo. Boa leitura!');

    } catch (error) {
        console.error('Erro ao limpar progresso:', error);
        showError('Erro ao limpar progresso. Tente novamente mais tarde.');
    }
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

// ==================== MENU DE USUÁRIO ====================
function configurarMenuUsuario() {
    const btnUserMenu = document.getElementById('btnUserMenu');
    const userDropdown = document.getElementById('userDropdown');
    const btnSair = document.getElementById('btnSair');
    const btnTrocarSenha = document.getElementById('btnTrocarSenha');
    const btnAdmin = document.getElementById('btnAdmin');
    const modalTrocarSenha = document.getElementById('modalTrocarSenha');
    const closeTrocarSenha = document.getElementById('closeTrocarSenha');
    const formTrocarSenha = document.getElementById('formTrocarSenha');

    // Toggle dropdown
    btnUserMenu?.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-user')) {
            userDropdown?.classList.remove('show');
        }
    });

    // Botão sair
    btnSair?.addEventListener('click', async () => {
        const confirmacao = await customConfirm('Deseja realmente sair?', {
            title: 'Sair',
            confirmText: 'Sim, sair',
            cancelText: 'Cancelar'
        });

        if (confirmacao) {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    window.location.href = '/';
                } else {
                    showError('Erro ao sair. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                // Mesmo com erro, redireciona
                window.location.href = '/';
            }
        }
    });

    // Botão trocar senha
    btnTrocarSenha?.addEventListener('click', () => {
        userDropdown.classList.remove('show');
        modalTrocarSenha.classList.add('show');
    });

    // Botão admin (se for admin)
    btnAdmin?.addEventListener('click', () => {
        window.location.href = '/admin';
    });

    // Fechar modal trocar senha
    closeTrocarSenha?.addEventListener('click', () => {
        modalTrocarSenha.classList.remove('show');
        formTrocarSenha.reset();
    });

    // Submit form trocar senha
    formTrocarSenha?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const senhaAtual = document.getElementById('senhaAtual').value;
        const senhaNova = document.getElementById('senhaNova').value;
        const senhaConfirma = document.getElementById('senhaConfirma').value;

        // Validar confirmação
        if (senhaNova !== senhaConfirma) {
            showError('A nova senha e a confirmação não coincidem!');
            return;
        }

        // Validar senha forte (mesma validação do api-client.js)
        if (typeof validarSenhaForte === 'function') {
            const validacao = validarSenhaForte(senhaNova);
            if (!validacao.valida) {
                showError(validacao.erro);
                return;
            }
        }

        try {
            // Usar o endpoint correto para trocar própria senha
            const response = await fetch('/api/usuarios/minha-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senhaAtual: senhaAtual,
                    novaSenha: senhaNova
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showSuccess('Senha alterada com sucesso!');
                modalTrocarSenha.classList.remove('show');
                formTrocarSenha.reset();
            } else {
                showError(data.error || 'Erro ao alterar senha');
            }
        } catch (error) {
            console.error('Erro ao trocar senha:', error);
            showError('Erro ao trocar senha. Tente novamente.');
        }
    });

    // Carregar nome do usuário
    carregarDadosUsuario();
}

async function carregarDadosUsuario() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();

        if (data.autenticado && data.usuario) {
            window.currentUser = data.usuario;
            document.getElementById('userName').textContent = data.usuario.nome || data.usuario.username;

            // Mostrar botão admin se for admin
            if (data.usuario.isAdmin) {
                document.getElementById('btnAdmin').style.display = 'flex';
            }
        } else {
            // Não autenticado, redirecionar
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        window.location.href = '/';
    }
}

// Adicionar configuração do menu de usuário à inicialização
document.addEventListener('DOMContentLoaded', () => {
    configurarMenuUsuario();
});
