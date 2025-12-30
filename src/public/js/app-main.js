// ==================== VARIÁVEIS GLOBAIS ====================
let diaAtual = 1;
let progressoData = {
    progresso: {}, // { dia: { completo: bool, referencias: [] } }
    referenciasLidas: {}, // { dia: [indices das refs lidas] }
    stats: { totalDias: 365, diasLidos: 0, streak: 0 }
};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar dados do backend
    if (typeof carregarProgresso === 'function') {
        await carregarProgresso();
    }

    // Carregar conquistas
    await carregarConquistasDesbloqueadas();

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

    // Resetar contexto do último livro ao trocar de dia
    if (typeof resetarUltimoLivro === 'function') {
        resetarUltimoLivro();
    }

    // Recuperar referências lidas deste dia
    const referenciasLidas = progressoData.referenciasLidas[diaAtual] || [];

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

        // Variável para controlar se está mostrando tooltip
        let tooltipTimeout = null;
        let isShowingTooltip = false;

        // Evento de toque (mobile) - mostrar tooltip sem marcar
        div.addEventListener('touchstart', (e) => {
            // Se tocar no checkbox, deixar o comportamento normal
            if (e.target === checkbox) return;

            // Prevenir clique duplo
            e.preventDefault();

            // Cancelar timeout anterior se existir
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }

            // Marcar que está mostrando tooltip
            isShowingTooltip = true;

            // Simular tooltip visual no mobile
            const livroSpan = div.querySelector('.livro-ref');
            if (livroSpan && livroSpan.dataset.tooltip) {
                // Criar tooltip temporário
                const tooltip = document.createElement('div');
                tooltip.className = 'mobile-tooltip';
                tooltip.textContent = livroSpan.dataset.tooltip;
                tooltip.style.cssText = 'position: fixed; background: var(--marrom-escuro); color: white; padding: 0.5rem 1rem; border-radius: 8px; z-index: 9999; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3); pointer-events: none;';

                // Posicionar próximo ao toque
                const touch = e.touches[0];
                tooltip.style.left = touch.clientX + 'px';
                tooltip.style.top = (touch.clientY - 60) + 'px';

                document.body.appendChild(tooltip);

                // Remover após 2 segundos
                tooltipTimeout = setTimeout(() => {
                    tooltip.remove();
                    isShowingTooltip = false;
                }, 2000);

                return; // Não marcar como lido
            }

            // Se não tem tooltip, aguardar um pouco para diferenciar de tap rápido
            tooltipTimeout = setTimeout(() => {
                isShowingTooltip = false;
            }, 300);
        });

        // Evento de fim do toque - marcar apenas se não estiver mostrando tooltip
        div.addEventListener('touchend', (e) => {
            if (e.target === checkbox) return;

            e.preventDefault();

            // Se estava mostrando tooltip, não marcar
            if (isShowingTooltip) {
                return;
            }

            // Marcar como lido apenas se foi um toque rápido
            checkbox.checked = !checkbox.checked;
            toggleReferenciaLida(index);
        });

        // Evento de clique (desktop) - marcar normalmente
        div.addEventListener('click', (e) => {
            // Ignorar se for touch device (já tratado acima)
            if ('ontouchstart' in window) return;

            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                toggleReferenciaLida(index);
            }
        });

        div.appendChild(checkbox);
        div.appendChild(textSpan);
        container.appendChild(div);
    });

    // Atualizar contador
    atualizarContadorReferencias();
}

function toggleReferenciaLida(index) {
    if (!progressoData.referenciasLidas[diaAtual]) {
        progressoData.referenciasLidas[diaAtual] = [];
    }

    const refIndex = progressoData.referenciasLidas[diaAtual].indexOf(index);
    const refItem = document.querySelector(`.ref-checkbox[data-index="${index}"]`)?.parentElement;

    if (refIndex > -1) {
        // Remover
        progressoData.referenciasLidas[diaAtual].splice(refIndex, 1);
        refItem?.classList.remove('lida');
    } else {
        // Adicionar
        progressoData.referenciasLidas[diaAtual].push(index);
        refItem?.classList.add('lida');
    }

    atualizarContadorReferencias();
    atualizarProgressoDia();
    salvarProgresso();
    verificarDiaCompleto();
}

function atualizarContadorReferencias() {
    const total = document.querySelectorAll('.ref-item').length;
    const lidas = (progressoData.referenciasLidas[diaAtual] || []).length;

    document.getElementById('contadorTotal').textContent = total;
    document.getElementById('contadorLidas').textContent = lidas;

    // Atualizar texto do botão
    const btnMarcarTodos = document.getElementById('btnMarcarTodos');
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

    const barraDia = document.getElementById('barraDia');
    const percentualDia = document.getElementById('percentualDia');

    if (barraDia && percentualDia) {
        barraDia.style.width = percentual + '%';
        percentualDia.textContent = percentual + '%';
    }
}

function verificarDiaCompleto() {
    const totalRefs = document.querySelectorAll('.ref-item').length;
    const lidas = (progressoData.referenciasLidas[diaAtual] || []).length;
    const checkbox = document.getElementById('diaCompleto');

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

    atualizarContadorReferencias();
    atualizarProgressoDia();
    salvarProgresso();
    verificarDiaCompleto();
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

// ==================== CALENDÁRIO MENSAL ====================
let mesAtualCalendario = new Date().getMonth();
let anoAtualCalendario = new Date().getFullYear();

function inicializarSeletoresCalendario() {
    // Preencher seletor de ano (ano atual ± 2 anos)
    const seletorAno = document.getElementById('seletorAno');
    const anoAtual = new Date().getFullYear();

    for (let ano = anoAtual - 2; ano <= anoAtual + 2; ano++) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        if (ano === anoAtual) option.selected = true;
        seletorAno.appendChild(option);
    }

    // Selecionar mês atual
    document.getElementById('seletorMes').value = mesAtualCalendario;
    document.getElementById('seletorAno').value = anoAtualCalendario;

    // Eventos de mudança
    document.getElementById('seletorMes').addEventListener('change', (e) => {
        mesAtualCalendario = parseInt(e.target.value);
        renderizarMesCalendario();
    });

    document.getElementById('seletorAno').addEventListener('change', (e) => {
        anoAtualCalendario = parseInt(e.target.value);
        renderizarMesCalendario();
    });

    // Eventos das setas
    document.getElementById('btnMesAnterior').addEventListener('click', () => {
        mesAtualCalendario--;
        if (mesAtualCalendario < 0) {
            mesAtualCalendario = 11;
            anoAtualCalendario--;
        }
        atualizarSeletoresCalendario();
        renderizarMesCalendario();
    });

    document.getElementById('btnMesProximo').addEventListener('click', () => {
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
    document.getElementById('seletorMes').value = mesAtualCalendario;
    document.getElementById('seletorAno').value = anoAtualCalendario;
}

function criarCalendarioHeatmap() {
    // Inicializar seletores
    inicializarSeletoresCalendario();

    // Renderizar mês atual
    renderizarMesCalendario();
}

function renderizarMesCalendario() {
    const container = document.getElementById('heatmap');
    container.innerHTML = '';

    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

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

        // Destacar dia atual
        const hoje = new Date();
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
    container.appendChild(mesDiv);

    // Atualizar destaque do dia selecionado
    destacarDiaNoHeatmap(diaAtual);
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

    // Checkbox de conclusão
    document.getElementById('diaCompleto').addEventListener('change', (e) => {
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
        if (confirm('Deseja realmente sair?')) {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    window.location.href = '/';
                } else {
                    alert('Erro ao sair. Tente novamente.');
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
            alert('A nova senha e a confirmação não coincidem!');
            return;
        }

        try {
            // Primeiro, verificar a senha atual fazendo login
            const loginResponse = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: window.currentUser.username,
                    senha: senhaAtual
                })
            });

            if (!loginResponse.ok) {
                alert('Senha atual incorreta!');
                return;
            }

            // Se a senha está correta, atualizar
            const updateResponse = await fetch(`/api/usuarios/${window.currentUser.id}/senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ novaSenha: senhaNova })
            });

            if (updateResponse.ok) {
                alert('Senha alterada com sucesso!');
                modalTrocarSenha.classList.remove('show');
                formTrocarSenha.reset();
            } else {
                const error = await updateResponse.json();
                alert('Erro ao trocar senha: ' + (error.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao trocar senha:', error);
            alert('Erro ao trocar senha. Tente novamente.');
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
