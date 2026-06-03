/**
 * SentenceService - Gera frases contextuais para cada palavra do ditado.
 * A frase usa a palavra mas NÃO a soletra — ajuda a entender o contexto
 * sem revelar a grafia da palavra.
 *
 * Estratégia: banco de frases prontas por palavra. Para palavras sem frase
 * cadastrada, usa um template genérico que coloca a palavra em contexto simples.
 */
class SentenceService {
  constructor() {
    // Frases prontas para palavras de maior dificuldade de compreensão auditiva
    this._bank = {
      'amizade':       'A amizade é muito importante na vida.',
      'biblioteca':    'Eu fui até a biblioteca pegar um livro.',
      'borboleta':     'A borboleta pousou na flor do jardim.',
      'cachorro':      'O cachorro latiu quando ouviu o barulho.',
      'caderno':       'Eu escrevi a lição no caderno.',
      'caminhão':      'O caminhão passou pela estrada.',
      'canção':        'Ela cantou uma linda canção.',
      'coração':       'O coração bate mais rápido quando corremos.',
      'escola':        'Hoje eu fui para a escola bem cedo.',
      'família':       'A minha família se reuniu no final de semana.',
      'floresta':      'A floresta é cheia de animais e árvores.',
      'fotossíntese':  'A fotossíntese é o processo que as plantas usam para fazer comida.',
      'galinha':       'A galinha botou um ovo hoje de manhã.',
      'girassol':      'O girassol sempre vira sua face para o sol.',
      'girafa':        'A girafa tem um pescoço muito comprido.',
      'horizonte':     'O sol se pôs no horizonte ao entardecer.',
      'inverno':       'No inverno, as noites ficam mais longas e frias.',
      'janela':        'Eu olhei pela janela e vi a chuva cair.',
      'jacaré':        'O jacaré ficou parado na margem do rio.',
      'laranja':       'Eu tomei um suco de laranja fresquinho.',
      'leão':          'O leão é chamado de rei da selva.',
      'maçã':          'Eu comi uma maçã vermelha e bem doce.',
      'macarrão':      'O macarrão ficou gostoso com o molho de tomate.',
      'mariposa':      'A mariposa voa à noite atraída pela luz.',
      'montanha':      'Nós subimos a montanha pela trilha.',
      'mosquito':      'O mosquito estava zunindo perto do meu ouvido.',
      'nuvem':         'Uma nuvem branca passou pelo céu azul.',
      'oceano':        'O oceano é imenso e cheio de vida.',
      'onça':          'A onça é um felino que vive nas matas do Brasil.',
      'orquídea':      'A orquídea é uma flor muito delicada e bonita.',
      'palmeira':      'A palmeira balançava com o vento da praia.',
      'papagaio':      'O papagaio repetiu tudo o que eu disse.',
      'passarinho':    'Um passarinho cantou bem cedo pela manhã.',
      'professor':     'O professor explicou a matéria com paciência.',
      'preguiça':      'A preguiça passa o dia pendurada na árvore.',
      'princesa':      'A princesa da história vivia num castelo encantado.',
      'relâmpago':     'O relâmpago iluminou o céu durante a tempestade.',
      'rinoceronte':   'O rinoceronte tem um chifre na ponta do nariz.',
      'saudade':       'Eu sinto saudade da minha avó que morava longe.',
      'sobrinho':      'Meu sobrinho aprendeu a andar de bicicleta.',
      'tartaruga':     'A tartaruga caminha devagar, mas chega ao destino.',
      'tamanduá':      'O tamanduá usa a língua comprida para pegar formigas.',
      'telefone':      'Eu liguei no telefone para falar com minha mãe.',
      'televisão':     'Nós assistimos televisão depois do jantar.',
      'trovão':        'O trovão assustou as crianças durante a chuva.',
      'tucano':        'O tucano tem um bico enorme e colorido.',
      'uniforme':      'Eu coloquei o uniforme antes de ir para a escola.',
      'viaduto':       'O carro passou por baixo do viaduto.',
      'vizinho':       'O meu vizinho tem um jardim muito bonito.',
      'xícara':        'Minha avó bebeu café na xícara favorita dela.',
      'zoológico':     'No zoológico, eu vi muitos animais diferentes.',
    };

    // Templates genéricos usados quando a palavra não tem frase cadastrada
    this._templates = [
      w => `Escreva a palavra: ${w}.`,
      w => `A palavra que você ouviu é usada nesta frase: "Eu vi um ${w} hoje."`,
      w => `Pense bem: a palavra que você ouviu foi ${w}.`,
      w => `Complete: Hoje eu aprendi o que é ${w}.`,
      w => `A palavra começa com a letra "${w[0].toUpperCase()}".`,
    ];
  }

  /**
   * Retorna uma frase de contexto para a palavra.
   * Se a palavra estiver no banco, usa a frase cadastrada.
   * Se não, usa um template genérico — sem revelar a grafia completa.
   * @param {string} word
   * @returns {string}
   */
  getSentence(word) {
    const key = word.toLowerCase().trim();
    if (this._bank[key]) return this._bank[key];

    // Template: não usa a palavra em si na frase para não dar dica
    // Apenas diz a letra inicial
    const firstLetter = key[0].toUpperCase();
    return `Essa palavra começa com a letra "${firstLetter}". Ouça com atenção e escreva.`;
  }
}
