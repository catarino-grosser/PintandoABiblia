// CATÁLOGO PÚBLICO DO SITE
// Para adicionar livros: coloque capa e PDF na raiz, cadastre aqui e também em netlify/functions/_products.js.
const LIVROS=[
{id:"jesus",titulo:"A Luz do Mundo",subtitulo:"A História de Jesus, o Filho de Deus",descricao:"Uma história infantil sobre o nascimento, os ensinamentos, o amor, a morte e a ressurreição de Jesus. Um livro para apresentar às crianças a luz de Deus de forma simples e emocionante.",capa:"AluznoMundo.png",arquivo:"ebook-jesus.pdf",preco:9.90,paginas:18,categoria:"Jesus",destaque:true,ativo:true},
{id:"adao-e-eva",titulo:"Adão e Eva",subtitulo:"No Jardim do Éden",descricao:"A criação, o Jardim do Éden, a escolha de Adão e Eva e a promessa de Deus contadas em linguagem infantil, com ilustrações para colorir.",capa:"AdaoEva.png",arquivo:"ebook-adao.pdf",preco:9.90,paginas:28,categoria:"Antigo Testamento",destaque:true,ativo:true},
{id:"jose",titulo:"José",subtitulo:"O Sonho de um Governador",descricao:"A jornada de José, seus sonhos, as dificuldades, o perdão e a providência de Deus em uma história inspiradora para crianças.",capa:"JoseGovernador.png",arquivo:"ebook-jose.pdf",preco:9.90,paginas:28,categoria:"Antigo Testamento",destaque:true,ativo:true},
{id:"moises",titulo:"Moisés",subtitulo:"O menino salvo das águas",descricao:"Espaço preparado para um futuro livro da coleção.",capa:"placeholder-livro.png",arquivo:"ebook-moises.pdf",preco:9.90,paginas:0,categoria:"Em breve",destaque:false,ativo:false},
{id:"noe",titulo:"Noé",subtitulo:"A arca da salvação",descricao:"Espaço preparado para um futuro livro da coleção.",capa:"placeholder-livro.png",arquivo:"ebook-noe.pdf",preco:9.90,paginas:0,categoria:"Em breve",destaque:false,ativo:false},
{id:"davi",titulo:"Davi",subtitulo:"O pequeno pastor corajoso",descricao:"Espaço preparado para um futuro livro da coleção.",capa:"placeholder-livro.png",arquivo:"ebook-davi.pdf",preco:9.90,paginas:0,categoria:"Em breve",destaque:false,ativo:false},
{id:"daniel",titulo:"Daniel",subtitulo:"Na cova dos leões",descricao:"Espaço preparado para um futuro livro da coleção.",capa:"placeholder-livro.png",arquivo:"ebook-daniel.pdf",preco:9.90,paginas:0,categoria:"Em breve",destaque:false,ativo:false},
{id:"jonas",titulo:"Jonas",subtitulo:"A grande missão",descricao:"Espaço preparado para um futuro livro da coleção.",capa:"placeholder-livro.png",arquivo:"ebook-jonas.pdf",preco:9.90,paginas:0,categoria:"Em breve",destaque:false,ativo:false},
{id:"ester",titulo:"Ester",subtitulo:"Coragem para salvar seu povo",descricao:"Espaço preparado para um futuro livro da coleção.",capa:"placeholder-livro.png",arquivo:"ebook-ester.pdf",preco:9.90,paginas:0,categoria:"Em breve",destaque:false,ativo:false},
{id:"samuel",titulo:"Samuel",subtitulo:"O menino que ouviu Deus",descricao:"Espaço preparado para um futuro livro da coleção.",capa:"placeholder-livro.png",arquivo:"ebook-samuel.pdf",preco:9.90,paginas:0,categoria:"Em breve",destaque:false,ativo:false}
];

const COMBO={id:"combo",titulo:"Coleção Pintando a Bíblia",preco:14.90,ativo:true};
function activeBooks(){return LIVROS.filter(b=>b.ativo)}
function getProductFromPayload(payload){if(!payload||!payload.id)return null;if(payload.id==="combo")return{id:COMBO.id,titulo:COMBO.titulo,preco:COMBO.preco,tipo:"combo",itens:activeBooks().map(b=>b.id)};const book=activeBooks().find(b=>b.id===payload.id);return book?{id:book.id,titulo:book.titulo,preco:book.preco,tipo:"livro",itens:[book.id]}:null}
function getProductById(id){if(id==="combo")return{id:COMBO.id,titulo:COMBO.titulo,preco:COMBO.preco,tipo:"combo",itens:activeBooks().map(b=>b.id)};const book=activeBooks().find(b=>b.id===id);return book?{id:book.id,titulo:book.titulo,preco:book.preco,tipo:"livro",itens:[book.id]}:null}
function getBooksByIds(ids){return activeBooks().filter(b=>ids.includes(b.id))}
module.exports={getProductFromPayload,getProductById,getBooksByIds};
