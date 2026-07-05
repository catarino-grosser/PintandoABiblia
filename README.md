# Pintando a Bíblia V3 - Mercado Pago + Download Automático

Projeto pronto para GitHub + Netlify.

## O que já está incluído

- Página inicial com texto de vendas pronto para conversão.
- Catálogo com os 3 livros reais.
- Checkout Pix transparente via Mercado Pago.
- Download automático após Pix aprovado.
- Combo com desconto.
- Pesquisa de livros.
- Espaço preparado para novos livros.

## PDFs reais adicionados

- `ebook-jesus.pdf`
- `ebook-adao.pdf`
- `ebook-jose.pdf`

## Configurar Mercado Pago no Netlify

No painel do Netlify, configure a variável de ambiente:

```txt
MP_ACCESS_TOKEN=SEU_ACCESS_TOKEN_DO_MERCADO_PAGO
```

Nunca coloque esse token no HTML, CSS ou JavaScript público.

## Como subir no GitHub + Netlify

1. Envie todos os arquivos para um repositório GitHub.
2. Conecte o repositório ao Netlify.
3. Configure a variável `MP_ACCESS_TOKEN`.
4. Faça o deploy.

## Como adicionar novos livros

1. Coloque a capa na raiz, por exemplo: `moises.png`.
2. Coloque o PDF na raiz, por exemplo: `ebook-moises.pdf`.
3. Edite `produtos.js`.
4. Edite também `netlify/functions/_products.js`.

O cadastro duplicado é intencional: o frontend mostra os livros, e o backend valida preço/produto/arquivo por segurança.

## Atenção sobre PDFs na raiz

Você pediu os arquivos públicos na raiz para facilitar GitHub + Netlify. Esta versão segue esse padrão.

Isso significa que os PDFs podem ser acessados diretamente se alguém descobrir o nome do arquivo. O fluxo do site só mostra o download após pagamento, mas os arquivos em si ficam públicos.

Para uma versão mais protegida, use storage privado ou uma pasta fora do publish.

## Preços atuais

- Livro individual: R$ 9,90
- Combo com 3 livros: R$ 14,90

Para alterar preços, edite `produtos.js` e `netlify/functions/_products.js`.
