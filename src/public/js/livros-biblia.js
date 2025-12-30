// Dicionário de livros bíblicos com nomes completos
const livrosBiblia = {
    // Antigo Testamento
    "Gn": "Gênesis",
    "Êx": "Êxodo",
    "Lv": "Levítico",
    "Nm": "Números",
    "Dt": "Deuteronômio",
    "Js": "Josué",
    "Jz": "Juízes",
    "Rt": "Rute",
    "I Sm": "1 Samuel",
    "II Sm": "2 Samuel",
    "I Rs": "1 Reis",
    "II Rs": "2 Reis",
    "I Cr": "1 Crônicas",
    "II Cr": "2 Crônicas",
    "Ed": "Esdras",
    "Ne": "Neemias",
    "Et": "Ester",
    "Jó": "Jó",
    "Sl": "Salmos",
    "Pv": "Provérbios",
    "Ec": "Eclesiastes",
    "Ct": "Cânticos",
    "Is": "Isaías",
    "Jr": "Jeremias",
    "Lm": "Lamentações",
    "Ez": "Ezequiel",
    "Dn": "Daniel",
    "Os": "Oséias",
    "Jl": "Joel",
    "Am": "Amós",
    "Ob": "Obadias",
    "Jn": "Jonas",
    "Mq": "Miquéias",
    "Na": "Naum",
    "Hc": "Habacuque",
    "Sf": "Sofonias",
    "Ag": "Ageu",
    "Zc": "Zacarias",
    "Ml": "Malaquias",

    // Novo Testamento
    "Mt": "Mateus",
    "Mc": "Marcos",
    "Lc": "Lucas",
    "Jo": "João",
    "At": "Atos",
    "Rm": "Romanos",
    "I Co": "1 Coríntios",
    "II Co": "2 Coríntios",
    "Gl": "Gálatas",
    "Ef": "Efésios",
    "Fp": "Filipenses",
    "Cl": "Colossenses",
    "I Ts": "1 Tessalonicenses",
    "II Ts": "2 Tessalonicenses",
    "I Tm": "1 Timóteo",
    "II Tm": "2 Timóteo",
    "Tt": "Tito",
    "Fm": "Filemom",
    "Hb": "Hebreus",
    "Tg": "Tiago",
    "I Pe": "1 Pedro",
    "II Pe": "2 Pedro",
    "I Jo": "1 João",
    "II Jo": "2 João",
    "III Jo": "3 João",
    "Jd": "Judas",
    "Ap": "Apocalipse",
    "Ap.": "Apocalipse"
};

// Função para obter nome completo
function getNomeCompleto(abreviacao) {
    return livrosBiblia[abreviacao] || abreviacao;
}

// Função para formatar referência com tooltip
function formatarReferencia(ref) {
    const match = ref.match(/^([A-Za-zÊêÍí\s\.]+)\s*(\d+.*)/);
    if (match) {
        const livro = match[1].trim();
        const capitulo = match[2];
        const nomeCompleto = getNomeCompleto(livro);
        return `<span class="livro-ref" data-tooltip="${nomeCompleto}">${livro}</span> ${capitulo}`;
    }
    return ref;
}

// Adicionar tooltips após carregamento do DOM
function adicionarTooltips() {
    document.querySelectorAll('.livro-ref').forEach(el => {
        const tooltip = el.getAttribute('data-tooltip');
        if (tooltip && tooltip !== el.textContent.trim()) {
            el.title = tooltip;
        }
    });
}
