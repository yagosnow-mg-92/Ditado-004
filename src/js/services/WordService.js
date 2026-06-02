/**
 * WordService - Banco de palavras e criação de sessões.
 */
class WordService {
  constructor() {
    this._wordBank = [
      // Família e pessoas
      'família', 'amizade', 'criança', 'menino', 'menina', 'professor', 'professora',
      'vizinho', 'parente', 'sobrinho', 'sobrinha', 'avozinha', 'netinho',
      // Escola
      'escola', 'caderno', 'mochila', 'lápis', 'borracha', 'caneta', 'régua',
      'biblioteca', 'recreio', 'quadro', 'tesoura', 'colega', 'turma', 'aula',
      'dever', 'prova', 'nota', 'redação', 'leitura', 'silaba',
      // Natureza
      'montanha', 'floresta', 'oceano', 'jardim', 'árvore', 'florzinha', 'chuva',
      'trovão', 'relâmpago', 'nuvem', 'estrela', 'planeta', 'horizonte', 'nascente',
      'palmeira', 'caatinga', 'savana', 'serrado',
      // Animais
      'cachorro', 'gatinho', 'coelho', 'cavalo', 'galinha', 'papagaio', 'borboleta',
      'tartaruga', 'jacaré', 'abelha', 'formiga', 'beija-flor', 'tucano', 'macaco',
      'elefante', 'girafa', 'leãozinho', 'tigre', 'onça',
      // Casa e objetos
      'janela', 'cadeira', 'espelho', 'cozinha', 'banheiro', 'sofá', 'geladeira',
      'televisão', 'computador', 'telefone', 'relógio', 'travesseiro', 'cobertor',
      'armário', 'gaveta', 'corredor', 'varanda', 'quintal',
      // Brinquedos e lazer
      'brinquedo', 'boneca', 'carrinho', 'queimada', 'escorregador', 'balanço',
      'videogame', 'pintura', 'desenho', 'música', 'dança', 'futebol', 'basquete',
      'natação', 'ciclismo', 'brincadeira', 'passatempo',
      // Alimentação
      'alimento', 'maçã', 'banana', 'laranja', 'morango', 'uva', 'melão',
      'cenoura', 'batata', 'tomate', 'alface', 'feijão', 'arroz', 'macarrão',
      'sorvete', 'chocolate', 'vitamina', 'suco', 'iogurte', 'biscoito',
      // Corpo humano
      'cabeça', 'ombro', 'cotovelo', 'tornozelo', 'sobrancelha', 'mandíbula',
      'pálpebra', 'narina', 'dentista',
      // Lugares
      'cidade', 'bairro', 'parque', 'museu', 'teatro', 'cinema', 'shopping',
      'mercado', 'farmácia', 'hospital', 'delegacia', 'aeroporto', 'rodoviária',
      'praça', 'estação', 'porto',
      // Sentimentos
      'alegria', 'tristeza', 'saudade', 'carinho', 'bondade', 'coragem', 'esperança',
      'paciência', 'felicidade', 'gratidão', 'generoso', 'solidário',
      // Verbos (infinitivo)
      'brincar', 'estudar', 'aprender', 'escrever', 'desenhar', 'correr', 'pular',
      'nadar', 'voar', 'cantar', 'dançar', 'dormir', 'acordar', 'ajudar', 'cuidar',
      'crescer', 'descobrir', 'inventar', 'imaginar', 'sonhar',
      // Adjetivos
      'bonito', 'alegre', 'simpático', 'inteligente', 'corajoso', 'caprichoso',
      'cuidadoso', 'divertido', 'diferente', 'especial', 'perfeito', 'maravilhoso',
      // Palavras com dificuldade ortográfica
      'exceção', 'ação', 'canção', 'missão', 'nação', 'paixão', 'emoção',
      'instrução', 'invenção', 'construção', 'informação', 'comunicação',
      'observação', 'atenção', 'avião', 'caminhão', 'papelão', 'coração',
      'irmão', 'mão', 'pão', 'chão',
      // Palavras com lh / nh
      'trabalho', 'espelho', 'folha', 'bolha', 'molho', 'palha', 'colher',
      'mulher', 'galho', 'ilha', 'toalha', 'rolha', 'filho', 'brilho',
      'vizinho', 'banho', 'ninho', 'pinho', 'caminho', 'minhoca',
      // Palavras com ss / rr
      'passarinho', 'casaco', 'pressão', 'agressivo', 'ressalva', 'assado',
      'cachoeira', 'carrinho', 'barriga', 'corrida', 'borracha', 'serração',
      'arremesso', 'território',
      // Palavras com x
      'exemplo', 'exame', 'exercício', 'êxito', 'hexágono', 'explicar',
      'exterior', 'extraordinário', 'texto', 'contexto',
      // Ciências
      'oxigênio', 'energia', 'matéria', 'planeta', 'satélite', 'gravidade',
      'evolução', 'fotossíntese', 'nutrição', 'respiração', 'circulação',
      // Outros
      'aventura', 'descoberta', 'fantasia', 'história', 'mistério', 'surpresa',
      'tesouro', 'viagem', 'passagem', 'caminho', 'destino',
    ];
  }

  /**
   * Retorna um array embaralhado e sem repetições com `count` palavras.
   * @param {number} count
   * @returns {Word[]}
   */
  createSessionWords(count) {
    const shuffled = this._shuffle([...this._wordBank]);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    return selected.map(text => new Word(text));
  }

  /** Embaralha um array in-place usando Fisher-Yates */
  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Quantidade total de palavras no banco */
  bankSize() {
    return this._wordBank.length;
  }
}
