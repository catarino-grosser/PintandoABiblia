const state = {
  selectedProduct: null,
  paymentId: null,
  checkTimer: null,
  customer: null
};

const PENDING_PAYMENT_KEY = "pintandoBibliaPendingPayment";

const money = (value) => value.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function activeBooks() {
  return LIVROS.filter(book => book.ativo);
}

function savePendingPayment(product, paymentId, pixData = null) {
  const payload = {
    product,
    paymentId,
    pixData,
    savedAt: Date.now()
  };

  localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payload));
}

function getPendingPayment() {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw);

    // Expira depois de 24 horas para não ficar pagamento antigo salvo para sempre.
    const maxAge = 24 * 60 * 60 * 1000;
    if (!payload.savedAt || Date.now() - payload.savedAt > maxAge) {
      clearPendingPayment();
      return null;
    }

    return payload;
  } catch (error) {
    clearPendingPayment();
    return null;
  }
}

function clearPendingPayment() {
  localStorage.removeItem(PENDING_PAYMENT_KEY);
}

function renderHeroCovers() {
  const container = document.getElementById("heroCovers");
  const books = activeBooks().slice(0, 3);

  container.innerHTML = books.map((book, index) => `
    <img src="${book.capa}" alt="${book.titulo}" class="rounded-2xl w-full h-44 sm:h-64 object-cover shadow ${index === 1 ? '-translate-y-4' : ''}">
  `).join("");

  document.getElementById("heroComboPrice").textContent = money(COMBO.preco);
}

function renderBooks(list = activeBooks()) {
  const grid = document.getElementById("booksGrid");

  if (!list.length) {
    grid.innerHTML = `<p class="col-span-3 text-center text-gray-600">Nenhum livro encontrado.</p>`;
    return;
  }

  grid.innerHTML = list.map(book => `
    <article class="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition border border-amber-100 flex flex-col">
      <div class="bg-orange-100 p-4">
        <img src="${book.capa}" alt="${book.titulo}" class="w-full h-72 object-cover rounded-2xl shadow">
      </div>
      <div class="p-6 flex flex-col flex-1">
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full">${book.categoria}</span>
          <span class="text-xs text-gray-500">${book.paginas} páginas</span>
        </div>
        <h3 class="text-xl font-black text-amber-950 leading-tight">${book.titulo}</h3>
        <p class="font-bold text-orange-600 text-sm mt-1">${book.subtitulo}</p>
        <p class="text-gray-600 mt-3 text-sm leading-relaxed flex-1">${book.descricao}</p>
        <div class="mt-5">
          <div class="text-3xl font-black text-amber-950">${money(book.preco)}</div>
          <p class="text-xs text-gray-500">PDF para baixar e imprimir</p>
        </div>
        <button data-buy="${book.id}" class="buy-btn block w-full text-center mt-5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-xl shadow transition">
          Comprar este livro via Pix
        </button>
      </div>
    </article>
  `).join("");
}

function renderCombo() {
  const books = activeBooks();
  const separate = books.reduce((sum, book) => sum + book.preco, 0);
  const savings = separate - COMBO.preco;

  document.getElementById("separatePrice").textContent = money(separate);
  document.getElementById("comboPrice").textContent = money(COMBO.preco);
  document.getElementById("comboSavings").textContent = savings > 0 ? `Economia de ${money(savings)}` : "";
  document.getElementById("comboTitle").textContent = `Leve os ${books.length} livros por um preço especial.`;
  document.getElementById("comboDescription").textContent = COMBO.descricao;

  document.getElementById("comboList").innerHTML = books.map(book => `<li>✔ ${book.titulo} — ${book.subtitulo}</li>`).join("") +
    `<li>✔ Arquivos em PDF</li><li>✔ Download imediato após aprovação do Pix</li><li>✔ Impressão ilimitada para uso pessoal/educativo</li>`;
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    const filtered = activeBooks().filter(book =>
      book.titulo.toLowerCase().includes(term) ||
      book.subtitulo.toLowerCase().includes(term) ||
      book.descricao.toLowerCase().includes(term) ||
      book.categoria.toLowerCase().includes(term)
    );
    renderBooks(filtered);
  });
}

function findProduct(productId) {
  if (productId === "combo") {
    return {
      id: COMBO.id,
      titulo: COMBO.titulo,
      descricao: COMBO.subtitulo,
      preco: COMBO.preco,
      tipo: "combo",
      itens: activeBooks().map(book => book.id)
    };
  }

  const book = activeBooks().find(item => item.id === productId);
  if (!book) return null;

  return {
    id: book.id,
    titulo: book.titulo,
    descricao: book.subtitulo,
    preco: book.preco,
    tipo: "livro",
    itens: [book.id]
  };
}

function setupBuyButtons() {
  document.body.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-buy]");
    if (!btn) return;

    const productId = btn.getAttribute("data-buy");
    const product = findProduct(productId);

    if (!product) {
      alert("Produto não encontrado ou inativo.");
      return;
    }

    openCheckout(product);
  });
}

function openCheckout(product) {
  state.selectedProduct = product;
  state.paymentId = null;
  clearInterval(state.checkTimer);

  document.getElementById("checkoutModal").classList.remove("hidden");
  document.getElementById("modalTitle").textContent = product.titulo;
  document.getElementById("modalSubtitle").textContent = `${money(product.preco)} • Pagamento via Pix`;

  renderCustomerForm(product);
}

function renderCustomerForm(product) {
  document.getElementById("checkoutContent").innerHTML = `
    <form id="customerForm" class="space-y-4">
      <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p class="font-black text-amber-950">${product.titulo}</p>
        <p class="text-sm text-gray-600">${product.descricao || ""}</p>
        <p class="text-2xl font-black text-orange-500 mt-2">${money(product.preco)}</p>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Seu nome</label>
        <input id="customerName" required type="text" placeholder="Digite seu nome" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-200">
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">Seu e-mail</label>
        <input id="customerEmail" required type="email" placeholder="seuemail@exemplo.com" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-200">
        <p class="text-xs text-gray-500 mt-1">Use um e-mail real para identificação do pagamento.</p>
      </div>

      <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white font-black px-6 py-4 rounded-2xl shadow">
        Gerar Pix
      </button>
    </form>
  `;

  document.getElementById("customerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.customer = {
      name: document.getElementById("customerName").value.trim(),
      email: document.getElementById("customerEmail").value.trim()
    };

    document.getElementById("checkoutContent").innerHTML = `
      <div class="text-center">
        <div class="loader mx-auto"></div>
        <p class="mt-4 text-gray-600">Gerando Pix...</p>
      </div>
    `;

    createPix(product);
  });
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.add("hidden");
  clearInterval(state.checkTimer);
}

function setupModalClose() {
  document.body.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal]")) {
      closeCheckout();
    }
  });
}

async function createPix(product) {
  try {
    const response = await fetch("/.netlify/functions/criar-pix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...product,
        customer: state.customer
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao gerar Pix.");
    }

    state.paymentId = data.paymentId;

    savePendingPayment(product, data.paymentId, data);

    renderPix(data);
    startPaymentCheck(product, data.paymentId);

  } catch (error) {
    document.getElementById("checkoutContent").innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
        <strong>Erro ao gerar Pix.</strong>
        <p class="mt-2 text-sm">${error.message}</p>
        <p class="mt-2 text-xs">Confira se a variável MP_ACCESS_TOKEN foi configurada no Netlify.</p>
      </div>
    `;
  }
}

function renderPix(data, restored = false) {
  document.getElementById("checkoutContent").innerHTML = `
    <div class="text-center">
      ${restored ? `
        <div class="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-2xl mb-4 text-sm">
          Recuperamos seu Pix em andamento. Se você já pagou, aguarde a confirmação automática.
        </div>
      ` : ""}
      <p class="font-bold text-amber-950">Escaneie o QR Code ou copie o código Pix</p>
      ${data.qrCodeBase64 ? `<img class="qr-img mt-4" src="data:image/png;base64,${data.qrCodeBase64}" alt="QR Code Pix">` : ""}
      <div class="mt-5 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left">
        <p class="text-xs font-bold text-gray-500 mb-2">Pix copia e cola:</p>
        <p id="pixCode" class="copy-field text-xs text-gray-700">${data.qrCode || ""}</p>
      </div>
      <button id="copyPixBtn" class="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-black px-5 py-3 rounded-xl">
        Copiar código Pix
      </button>
      <p class="mt-4 text-sm text-gray-600">Após pagar, aguarde. O download será liberado automaticamente.</p>
      <button id="checkNowBtn" class="mt-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black px-5 py-3 rounded-xl">
        Já paguei, verificar agora
      </button>
      <button id="cancelPendingBtn" class="mt-3 ml-0 sm:ml-2 text-gray-500 underline text-sm">
        Cancelar este Pix
      </button>
      <div id="paymentStatusText" class="mt-4 text-xs text-gray-500">Status: aguardando pagamento...</div>
    </div>
  `;

  document.getElementById("copyPixBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText(data.qrCode || "");
    document.getElementById("copyPixBtn").textContent = "Código copiado!";
  });

  document.getElementById("checkNowBtn").addEventListener("click", () => {
    if (state.selectedProduct && state.paymentId) {
      checkPaymentOnce(state.selectedProduct, state.paymentId, true);
    }
  });

  document.getElementById("cancelPendingBtn").addEventListener("click", () => {
    clearPendingPayment();
    clearInterval(state.checkTimer);
    closeCheckout();
  });
}

function startPaymentCheck(product, paymentId) {
  clearInterval(state.checkTimer);

  checkPaymentOnce(product, paymentId, false);

  state.checkTimer = setInterval(() => {
    checkPaymentOnce(product, paymentId, false);
  }, 5000);
}

async function checkPaymentOnce(product, paymentId, manual = false) {
  try {
    const statusEl = document.getElementById("paymentStatusText");
    if (statusEl && manual) {
      statusEl.textContent = "Status: verificando pagamento agora...";
    }

    const response = await fetch(`/.netlify/functions/verificar-pagamento?paymentId=${encodeURIComponent(paymentId)}`);
    const data = await response.json();

    if (data.status === "approved") {
      clearInterval(state.checkTimer);
      clearPendingPayment();
      showDownload(product, paymentId);
      return;
    }

    if (statusEl) {
      const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      statusEl.textContent = `Status: aguardando pagamento... Última verificação: ${now}`;
    }
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
  }
}

function showDownload(product, paymentId) {
  const downloadUrl = `/.netlify/functions/download?paymentId=${encodeURIComponent(paymentId)}&productId=${encodeURIComponent(product.id)}`;

  document.getElementById("checkoutContent").innerHTML = `
    <div class="text-center">
      <div class="text-6xl">✅</div>
      <h3 class="mt-4 text-2xl font-black text-amber-950">Pagamento aprovado!</h3>
      <p class="mt-2 text-gray-600">Seu material já está liberado.</p>
      <a href="${downloadUrl}" class="inline-block mt-6 bg-green-500 hover:bg-green-600 text-white font-black px-8 py-4 rounded-2xl shadow">
        Baixar agora
      </a>
      <p class="mt-4 text-xs text-gray-500">Guarde seu arquivo em local seguro após o download.</p>
    </div>
  `;
}

function restorePendingPaymentIfExists() {
  const pending = getPendingPayment();
  if (!pending || !pending.product || !pending.paymentId) return;

  // Reabre automaticamente o modal ao recarregar/voltar para a página.
  state.selectedProduct = pending.product;
  state.paymentId = pending.paymentId;

  document.getElementById("checkoutModal").classList.remove("hidden");
  document.getElementById("modalTitle").textContent = pending.product.titulo || "Compra em andamento";
  document.getElementById("modalSubtitle").textContent = `${money(pending.product.preco)} • Pagamento via Pix`;

  if (pending.pixData) {
    renderPix(pending.pixData, true);
  } else {
    document.getElementById("checkoutContent").innerHTML = `
      <div class="text-center">
        <div class="loader mx-auto"></div>
        <p class="mt-4 text-gray-600">Recuperando pagamento...</p>
      </div>
    `;
  }

  startPaymentCheck(pending.product, pending.paymentId);
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeroCovers();
  renderBooks();
  renderCombo();
  setupSearch();
  setupBuyButtons();
  setupModalClose();
  restorePendingPaymentIfExists();
});
