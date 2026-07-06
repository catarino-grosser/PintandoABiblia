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


## Correção do download da coleção

Esta versão corrige o erro:

`Function.ResponseSizeTooLarge`

O erro acontecia porque a função `download.js` tentava enviar o ZIP/PDF completo como resposta.

Agora a função:

1. Confirma o pagamento no Mercado Pago.
2. Verifica se o pagamento está aprovado.
3. Confere se o produto comprado corresponde ao produto solicitado.
4. Redireciona para o arquivo correto.

Para a coleção completa, foi criado este arquivo na raiz:

`colecao-pintando-a-biblia.zip`

Sempre que trocar ou adicionar livros no combo, recrie esse ZIP com os PDFs atualizados.


## Versão 3.1 - Downloads separados para a coleção

Nesta versão, a coleção completa não baixa mais um arquivo ZIP gigante.

Fluxo novo:

1. Cliente compra a coleção.
2. O pagamento é aprovado.
3. O botão "Baixar agora" abre uma página de downloads.
4. A página mostra um botão separado para cada livro:
   - A Luz do Mundo
   - Adão e Eva
   - José

Vantagens:

- Evita `Function.ResponseSizeTooLarge`.
- Não precisa criar ZIP de 60 MB.
- Funciona melhor no celular.
- Facilita adicionar novos livros no futuro.
- Cada PDF é baixado separadamente.

Arquivo principal alterado:

`netlify/functions/download.js`

Também foi atualizado:

`netlify/functions/_products.js`


## Versão 3.2 - Pagamento persistente

Esta versão corrige o problema de perder o Pix quando o cliente sai para o app do banco e volta para o site.

Agora, quando o Pix é gerado, o navegador salva no `localStorage`:

- produto comprado;
- paymentId do Mercado Pago;
- código Pix;
- QR Code;
- horário em que foi salvo.

Se a página for atualizada ou o cliente voltar para o site, o checkout é reaberto automaticamente e continua verificando o pagamento.

Também foram adicionados:

- botão "Já paguei, verificar agora";
- botão "Cancelar este Pix";
- mensagem avisando que o Pix em andamento foi recuperado.

O pagamento salvo expira automaticamente depois de 24 horas.
