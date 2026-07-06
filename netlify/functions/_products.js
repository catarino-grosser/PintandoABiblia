// CATÁLOGO DO BACKEND
// Este arquivo valida preço, produto e arquivo no servidor.
// Sempre que ativar um livro em produtos.js, atualize aqui também.

const LIVROS = [
  {
    id: "jesus",
    titulo: "A Luz do Mundo",
    subtitulo: "A História de Jesus, o Filho de Deus",
    arquivo: "ebook-jesus.pdf",
    preco: 1.90,
    ativo: true
  },
  {
    id: "adao-e-eva",
    titulo: "Adão e Eva",
    subtitulo: "No Jardim do Éden",
    arquivo: "ebook-adao.pdf",
    preco: 1.90,
    ativo: true
  },
  {
    id: "jose",
    titulo: "José",
    subtitulo: "O Sonho de um Governador",
    arquivo: "ebook-jose.pdf",
    preco: 1.90,
    ativo: true
  },
  { id: "moises", titulo: "Moisés", subtitulo: "O libertador do povo de deus", arquivo: "ebook-moises.pdf", preco: 1.90, ativo: true },
  { id: "noe", titulo: "Noé", subtitulo: "A arca da salvação", arquivo: "ebook-noe.pdf", preco: 9.90, ativo: false },
  { id: "davi", titulo: "Davi", subtitulo: "O pequeno pastor corajoso", arquivo: "ebook-davi.pdf", preco: 1.90, ativo: false },
  { id: "daniel", titulo: "Daniel", subtitulo: "Na cova dos leões", arquivo: "ebook-daniel.pdf", preco: 9.90, ativo: false },
  { id: "jonas", titulo: "Jonas", subtitulo: "A grande missão", arquivo: "ebook-jonas.pdf", preco: 9.90, ativo: false },
  { id: "ester", titulo: "Ester", subtitulo: "Coragem para salvar seu povo", arquivo: "ebook-ester.pdf", preco: 9.90, ativo: false },
  { id: "samuel", titulo: "Samuel", subtitulo: "O menino que ouviu Deus", arquivo: "ebook-samuel.pdf", preco: 9.90, ativo: false }
];

const COMBO = {
  id: "combo",
  titulo: "Coleção Pintando a Bíblia",
  preco: 2.90,
  ativo: true
};

function activeBooks() {
  return LIVROS.filter(book => book.ativo);
}

function getActiveBooks() {
  return activeBooks();
}

function getProductFromPayload(payload) {
  if (!payload || !payload.id) return null;

  if (payload.id === "combo") {
    return {
      id: COMBO.id,
      titulo: COMBO.titulo,
      preco: COMBO.preco,
      tipo: "combo",
      itens: activeBooks().map(book => book.id)
    };
  }

  const book = activeBooks().find(item => item.id === payload.id);
  if (!book) return null;

  return {
    id: book.id,
    titulo: book.titulo,
    preco: book.preco,
    tipo: "livro",
    itens: [book.id]
  };
}

function getProductById(id) {
  if (id === "combo") {
    return {
      id: COMBO.id,
      titulo: COMBO.titulo,
      preco: COMBO.preco,
      tipo: "combo",
      itens: activeBooks().map(book => book.id)
    };
  }

  const book = activeBooks().find(item => item.id === id);
  if (!book) return null;

  return {
    id: book.id,
    titulo: book.titulo,
    preco: book.preco,
    tipo: "livro",
    itens: [book.id]
  };
}

function getBooksByIds(ids) {
  return activeBooks().filter(book => ids.includes(book.id));
}

module.exports = {
  getProductFromPayload,
  getProductById,
  getBooksByIds,
  getActiveBooks
};
