// Dicionário de livros bíblicos com nomes completos
const livrosBiblia = {
    // Antigo Testamento
    "Gn": "Gênesis",
    "Gn.": "Gênesis",
    "Êx": "Êxodo",
    "Êx.": "Êxodo",
    "Ex": "Êxodo",
    "Ex.": "Êxodo",
    "Lv": "Levítico",
    "Lv.": "Levítico",
    "Nm": "Números",
    "Nm.": "Números",
    "Dt": "Deuteronômio",
    "Dt.": "Deuteronômio",
    "Js": "Josué",
    "Js.": "Josué",
    "Jz": "Juízes",
    "Jz.": "Juízes",
    "Rt": "Rute",
    "Rt.": "Rute",
    "I Sm": "1 Samuel",
    "II Sm": "2 Samuel",
    "I Rs": "1 Reis",
    "II Rs": "2 Reis",
    "I Cr": "1 Crônicas",
    "I Cr.": "1 Crônicas",
    "II Cr": "2 Crônicas",
    "II Cr.": "2 Crônicas",
    "Ed": "Esdras",
    "Ed.": "Esdras",
    "Ne": "Neemias",
    "Ne.": "Neemias",
    "Et": "Ester",
    "Et.": "Ester",
    "Jó": "Jó",
    "Sl": "Salmos",
    "Sl.": "Salmos",
    "Pv": "Provérbios",
    "Pv.": "Provérbios",
    "Ec": "Eclesiastes",
    "Ec.": "Eclesiastes",
    "Ct": "Cânticos",
    "Ct.": "Cânticos",
    "Is": "Isaías",
    "Is.": "Isaías",
    "Jr": "Jeremias",
    "Jr.": "Jeremias",
    "Lm": "Lamentações",
    "Lm.": "Lamentações",
    "Ez": "Ezequiel",
    "Ez.": "Ezequiel",
    "Dn": "Daniel",
    "Dn.": "Daniel",
    "Os": "Oséias",
    "Os.": "Oséias",
    "Jl": "Joel",
    "Jl.": "Joel",
    "Am": "Amós",
    "Am.": "Amós",
    "Ob": "Obadias",
    "Ob.": "Obadias",
    "Jn": "Jonas",
    "Jn.": "Jonas",
    "Mq": "Miquéias",
    "Mq.": "Miquéias",
    "Na": "Naum",
    "Na.": "Naum",
    "Hc": "Habacuque",
    "Hc.": "Habacuque",
    "Sf": "Sofonias",
    "Sf.": "Sofonias",
    "Ag": "Ageu",
    "Ag.": "Ageu",
    "Zc": "Zacarias",
    "Zc.": "Zacarias",
    "Ml": "Malaquias",
    "Ml.": "Malaquias",

    // Novo Testamento
    "Mt": "Mateus",
    "Mt.": "Mateus",
    "Mc": "Marcos",
    "Mc.": "Marcos",
    "Lc": "Lucas",
    "Lc.": "Lucas",
    "Jo": "João",
    "Jo.": "João",
    "João": "João",
    "At": "Atos",
    "At.": "Atos",
    "Rm": "Romanos",
    "Rm.": "Romanos",
    "I Co": "1 Coríntios",
    "I Co.": "1 Coríntios",
    "II Co": "2 Coríntios",
    "II Co.": "2 Coríntios",
    "Gl": "Gálatas",
    "Gl.": "Gálatas",
    "Ef": "Efésios",
    "Ef.": "Efésios",
    "Fp": "Filipenses",
    "Fp.": "Filipenses",
    "Cl": "Colossenses",
    "Cl.": "Colossenses",
    "I Ts": "1 Tessalonicenses",
    "I Ts.": "1 Tessalonicenses",
    "II Ts": "2 Tessalonicenses",
    "II Ts.": "2 Tessalonicenses",
    "I Tm": "1 Timóteo",
    "I Tm.": "1 Timóteo",
    "II Tm": "2 Timóteo",
    "II Tm.": "2 Timóteo",
    "Tt": "Tito",
    "Tt.": "Tito",
    "Fm": "Filemom",
    "Fm.": "Filemom",
    "Hb": "Hebreus",
    "Hb.": "Hebreus",
    "Tg": "Tiago",
    "Tg.": "Tiago",
    "I Pe": "1 Pedro",
    "I Pe.": "1 Pedro",
    "II Pe": "2 Pedro",
    "II Pe.": "2 Pedro",
    "I Jo": "1 João",
    "I Jo.": "1 João",
    "II Jo": "2 João",
    "II Jo.": "2 João",
    "III Jo": "3 João",
    "III Jo.": "3 João",
    "Jd": "Judas",
    "Jd.": "Judas",
    "Ap": "Apocalipse",
    "Ap.": "Apocalipse"
};

// Função para obter nome completo
function getNomeCompleto(abreviacao) {
    return livrosBiblia[abreviacao] || abreviacao;
}

// Variável global para manter contexto do último livro
let ultimoLivro = '';

// Função para formatar referência com tooltip e negrito em capítulos
function formatarReferencia(ref) {
    // Remover espaços extras
    ref = ref.trim();

    // Verificar se é apenas números (continuação do livro anterior)
    if (/^\d/.test(ref)) {
        if (ultimoLivro) {
            const nomeCompleto = getNomeCompleto(ultimoLivro);
            const numFormatado = formatarNumeros(ref);
            return `<span class="livro-ref" data-tooltip="${nomeCompleto}" title="${nomeCompleto}">${ultimoLivro}</span> ${numFormatado}`;
        }
        // Se não tiver livro anterior, retorna apenas os números formatados
        return formatarNumeros(ref);
    }

    // Regex mais robusta para capturar livro + capítulo/versículo
    // Captura: letras (com acentos), números romanos (I, II, III), espaços e pontos antes dos números
    const match = ref.match(/^([IVXivxA-Za-zÀ-ÿ\s\.]+?)\s*(\d+.*)/);

    if (match) {
        const livro = match[1].trim();
        const capitulo = match[2].trim();
        const nomeCompleto = getNomeCompleto(livro);

        // Atualizar último livro para referências futuras
        ultimoLivro = livro;

        // Formatar números (negrito em capítulos)
        const capituloFormatado = formatarNumeros(capitulo);

        // Se o livro foi encontrado no dicionário, adiciona tooltip
        if (nomeCompleto !== livro) {
            return `<span class="livro-ref" data-tooltip="${nomeCompleto}" title="${nomeCompleto}">${livro}</span> ${capituloFormatado}`;
        }

        // Se não encontrou, mas tem formato de livro, ainda marca como livro
        return `<span class="livro-ref" title="${livro}">${livro}</span> ${capituloFormatado}`;
    }

    // Se não conseguiu fazer match, retorna a referência original
    return ref;
}

// Função para formatar números - colocar capítulos em negrito
function formatarNumeros(texto) {
    // Padrões comuns:
    // 1.1-5 -> <b>1</b>.1-5
    // 1.1-2.5 -> <b>1</b>.1-<b>2</b>.5
    // 1-5 -> <b>1-5</b> (só capítulos)

    // Substituir padrão: número(s) seguido de ponto (capítulo.versículo)
    texto = texto.replace(/(\d+)(\.\d+)/g, '<b>$1</b>$2');

    // Para casos como "1-5" (apenas capítulos, sem versículos), colocar tudo em negrito
    if (/^\d+(-\d+)?$/.test(texto)) {
        texto = `<b>${texto}</b>`;
    }

    return texto;
}

// Função para resetar o contexto do último livro (usar ao trocar de dia)
function resetarUltimoLivro() {
    ultimoLivro = '';
}
