const { getProductById, getBooksByIds, getActiveBooks } = require("./_products");

exports.handler = async (event) => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return textResponse(500, "MP_ACCESS_TOKEN não configurado.");
    }

    const paymentId = event.queryStringParameters?.paymentId;
    const productId = event.queryStringParameters?.productId;

    if (!paymentId || !productId) {
      return textResponse(400, "paymentId e productId são obrigatórios.");
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    const payment = await mpResponse.json();

    if (!mpResponse.ok) {
      return textResponse(mpResponse.status, "Erro ao consultar pagamento.");
    }

    if (payment.status !== "approved") {
      return textResponse(403, "Pagamento ainda não aprovado.");
    }

    const paidProductId = payment.metadata?.product_id;
    const paidItems = Array.isArray(payment.metadata?.items)
      ? payment.metadata.items
      : [];

    // Compra da coleção: mostra uma página leve com botões separados.
    // Isso evita ZIP gigante e evita Function.ResponseSizeTooLarge.
    if (productId === "combo") {
      if (paidProductId !== "combo") {
        return textResponse(403, "Este pagamento não corresponde à coleção.");
      }

      const books = getBooksByIds(paidItems);
      return htmlResponse(renderComboDownloads(paymentId, books));
    }

    // Download de livro individual comprado diretamente.
    if (paidProductId === productId) {
      const product = getProductById(productId);

      if (!product || product.tipo !== "livro") {
        return textResponse(404, "Produto não encontrado.");
      }

      const book = getBooksByIds(product.itens)[0];

      if (!book || !book.arquivo) {
        return textResponse(404, "Arquivo do livro não encontrado.");
      }

      return redirectToFile(book.arquivo);
    }

    // Download de um livro incluído na coleção.
    if (paidProductId === "combo" && paidItems.includes(productId)) {
      const book = getBooksByIds([productId])[0];

      if (!book || !book.arquivo) {
        return textResponse(404, "Arquivo do livro não encontrado.");
      }

      return redirectToFile(book.arquivo);
    }

    return textResponse(403, "Produto não corresponde ao pagamento.");

  } catch (error) {
    return textResponse(500, error.message);
  }
};

function redirectToFile(filename) {
  return {
    statusCode: 302,
    headers: {
      "Location": `/${encodeURI(filename)}`,
      "Cache-Control": "no-store"
    },
    body: ""
  };
}

function renderComboDownloads(paymentId, books) {
  const buttons = books.map(book => `
    <a class="download-card" href="/.netlify/functions/download?paymentId=${encodeURIComponent(paymentId)}&productId=${encodeURIComponent(book.id)}">
      <div>
        <strong>${escapeHtml(book.titulo)}</strong>
        <span>${escapeHtml(book.subtitulo || "PDF para baixar")}</span>
      </div>
      <b>Baixar PDF</b>
    </a>
  `).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Downloads Liberados | Pintando a Bíblia</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #fff7ed;
      color: #431407;
    }
    .wrap {
      max-width: 760px;
      margin: 0 auto;
      padding: 32px 18px;
    }
    .box {
      background: white;
      border-radius: 28px;
      padding: 28px;
      box-shadow: 0 18px 45px rgba(120, 53, 15, .12);
      border: 1px solid #fed7aa;
    }
    h1 {
      margin: 0;
      font-size: 30px;
      line-height: 1.15;
    }
    p {
      color: #6b7280;
      line-height: 1.55;
    }
    .download-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      color: #431407;
      background: #fffbeb;
      border: 1px solid #fed7aa;
      border-radius: 18px;
      padding: 18px;
      margin-top: 14px;
    }
    .download-card strong {
      display: block;
      font-size: 17px;
    }
    .download-card span {
      display: block;
      color: #6b7280;
      font-size: 13px;
      margin-top: 4px;
    }
    .download-card b {
      background: #22c55e;
      color: white;
      border-radius: 12px;
      padding: 10px 14px;
      white-space: nowrap;
      font-size: 13px;
    }
    .notice {
      margin-top: 22px;
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 16px;
      padding: 14px;
      font-size: 13px;
      color: #92400e;
    }
    @media (max-width: 560px) {
      .download-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .download-card b {
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="box">
      <div style="font-size:54px">✅</div>
      <h1>Pagamento aprovado! Seus livros estão liberados.</h1>
      <p>Baixe cada PDF separadamente. Isso deixa o download mais leve no celular e evita falhas com arquivos grandes.</p>
      ${buttons}
      <div class="notice">
        Guarde seus arquivos em local seguro após baixar. Se algum download falhar, volte a esta tela e toque novamente no botão do livro.
      </div>
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlResponse(html) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: html
  };
}

function textResponse(statusCode, message) {
  return {
    statusCode,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: message
  };
}
