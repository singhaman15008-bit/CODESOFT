import { products } from "./data/products.js";
import { createCart } from "./modules/cart.js";
import { applyFilters, defaultFilters } from "./modules/filters.js";
import { auth } from "./modules/auth.js";
import { placeOrder } from "./modules/checkout.js";

const cart = createCart(products);
let filters = { ...defaultFilters };
let authMode = "login";
let session = auth.getSession();

const refs = {
  products: document.getElementById("products"),
  productCount: document.getElementById("product-count"),
  empty: document.getElementById("empty-state"),
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  maxPrice: document.getElementById("max-price"),
  sort: document.getElementById("sort"),
  clearFilters: document.getElementById("clear-filters"),
  cartBadge: document.getElementById("cart-badge"),
  cartPanel: document.getElementById("cart-panel"),
  cartItems: document.getElementById("cart-items"),
  subtotal: document.getElementById("subtotal"),
  shipping: document.getElementById("shipping"),
  total: document.getElementById("total"),
  cartTrigger: document.getElementById("cart-trigger"),
  closeCart: document.getElementById("close-cart"),
  checkoutTrigger: document.getElementById("checkout-trigger"),
  authTrigger: document.getElementById("auth-trigger"),
  authModal: document.getElementById("auth-modal"),
  authForm: document.getElementById("auth-form"),
  authTitle: document.getElementById("auth-title"),
  authNameField: document.getElementById("auth-name-field"),
  authName: document.getElementById("auth-name"),
  authEmail: document.getElementById("auth-email"),
  authPassword: document.getElementById("auth-password"),
  authSubmit: document.getElementById("auth-submit"),
  authToggle: document.getElementById("auth-toggle"),
  authError: document.getElementById("auth-error"),
  checkoutModal: document.getElementById("checkout-modal"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutError: document.getElementById("checkout-error"),
  confirmModal: document.getElementById("confirm-modal"),
  confirmText: document.getElementById("confirm-text"),
  confirmClose: document.getElementById("confirm-close"),
  toast: document.getElementById("toast")
};

function dollars(value) {
  return `$${value.toFixed(2)}`;
}

function showToast(message, timeout = 2200) {
  refs.toast.textContent = message;
  refs.toast.classList.remove("hidden");
  window.setTimeout(() => refs.toast.classList.add("hidden"), timeout);
}

function categories() {
  const list = [...new Set(products.map((product) => product.category))];
  return ["All", ...list];
}

function renderCategoryOptions() {
  refs.category.innerHTML = categories()
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function renderProducts() {
  const filtered = applyFilters(products, filters);
  refs.productCount.textContent = `${filtered.length} item(s)`;
  refs.empty.classList.toggle("hidden", filtered.length > 0);

  refs.products.innerHTML = filtered
    .map(
      (product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <h4>${product.name}</h4>
        <p class="muted">${product.category}</p>
        <p class="muted">${product.description}</p>
        <p class="price">${dollars(product.price)}</p>
        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">Add to cart</button>
      </article>
    `
    )
    .join("");
}

function mapCartItemsWithProducts() {
  const items = cart.items();
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { item, product } : null;
    })
    .filter(Boolean);
}

function renderCart() {
  const mapped = mapCartItemsWithProducts();
  refs.cartBadge.textContent = String(cart.count());

  refs.cartItems.innerHTML = mapped.length
    ? mapped
        .map(
          ({ item, product }) => `
          <article class="cart-item">
            <div>
              <strong>${product.name}</strong>
              <p class="muted">${dollars(product.price)} each</p>
            </div>
            <div class="cart-controls">
              <input type="number" min="1" value="${item.quantity}" data-update-id="${item.productId}" />
              <button class="btn btn-ghost" data-remove-id="${item.productId}">Remove</button>
            </div>
          </article>
        `
        )
        .join("")
    : `<p class="muted">Your cart is empty.</p>`;

  const totals = cart.totals();
  refs.subtotal.textContent = dollars(totals.subtotal);
  refs.shipping.textContent = dollars(totals.shipping);
  refs.total.textContent = dollars(totals.total);
  refs.checkoutTrigger.disabled = mapped.length === 0;
}

function openCart() {
  refs.cartPanel.classList.remove("hidden");
  refs.cartPanel.setAttribute("aria-hidden", "false");
}

function closeCart() {
  refs.cartPanel.classList.add("hidden");
  refs.cartPanel.setAttribute("aria-hidden", "true");
}

function syncAuthButton() {
  refs.authTrigger.textContent = session.isLoggedIn ? `Logout (${session.name})` : "Login / Signup";
}

function syncAuthModal() {
  const isSignup = authMode === "signup";
  refs.authTitle.textContent = isSignup ? "Create Account" : "Login";
  refs.authNameField.classList.toggle("hidden", !isSignup);
  refs.authSubmit.textContent = isSignup ? "Create account" : "Login";
  refs.authToggle.textContent = isSignup ? "Already have an account? Login" : "Need an account? Sign up";
  refs.authError.classList.add("hidden");
  refs.authError.textContent = "";
}

function showAuthError(text) {
  refs.authError.textContent = text;
  refs.authError.classList.remove("hidden");
}

function showCheckoutError(text) {
  refs.checkoutError.textContent = text;
  refs.checkoutError.classList.remove("hidden");
}

function hideCheckoutError() {
  refs.checkoutError.textContent = "";
  refs.checkoutError.classList.add("hidden");
}

function bindEvents() {
  refs.clearFilters.addEventListener("click", () => {
    filters = { ...defaultFilters };
    refs.search.value = "";
    refs.category.value = "All";
    refs.maxPrice.value = "";
    refs.sort.value = "default";
    renderProducts();
  });

  refs.search.addEventListener("input", (event) => {
    filters.search = event.target.value;
    renderProducts();
  });

  refs.category.addEventListener("change", (event) => {
    filters.category = event.target.value;
    renderProducts();
  });

  refs.maxPrice.addEventListener("input", (event) => {
    filters.maxPrice = event.target.value;
    renderProducts();
  });

  refs.sort.addEventListener("change", (event) => {
    filters.sort = event.target.value;
    renderProducts();
  });

  refs.products.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches(".add-to-cart")) return;
    const productId = target.dataset.productId;
    if (!productId) return;
    if (cart.add(productId)) {
      renderCart();
      showToast("Item added to cart.");
    }
  });

  refs.cartItems.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const productId = target.dataset.updateId;
    if (!productId) return;
    const qty = Number(target.value);
    if (!cart.update(productId, qty)) {
      target.value = "1";
      showToast("Quantity must be at least 1.");
    }
    renderCart();
  });

  refs.cartItems.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const productId = target.dataset.removeId;
    if (!productId) return;
    cart.remove(productId);
    renderCart();
    showToast("Item removed from cart.");
  });

  refs.cartTrigger.addEventListener("click", openCart);
  refs.closeCart.addEventListener("click", closeCart);

  refs.authTrigger.addEventListener("click", () => {
    if (session.isLoggedIn) {
      session = auth.logout();
      syncAuthButton();
      showToast("Logged out.");
      return;
    }
    syncAuthModal();
    refs.authModal.showModal();
  });

  refs.authToggle.addEventListener("click", () => {
    authMode = authMode === "login" ? "signup" : "login";
    syncAuthModal();
  });

  refs.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    refs.authError.classList.add("hidden");

    const email = refs.authEmail.value.trim();
    const password = refs.authPassword.value;
    const name = refs.authName.value.trim();

    const response =
      authMode === "signup" ? auth.signup(name, email, password) : auth.login(email, password);

    if (!response.ok) {
      showAuthError(response.error);
      return;
    }

    session = response.session;
    syncAuthButton();
    refs.authForm.reset();
    refs.authModal.close();
    showToast(`Welcome ${session.name}.`);
  });

  refs.checkoutTrigger.addEventListener("click", () => {
    if (!session.isLoggedIn) {
      showToast("Please login before checkout.");
      authMode = "login";
      syncAuthModal();
      refs.authModal.showModal();
      return;
    }
    hideCheckoutError();
    refs.checkoutModal.showModal();
  });

  refs.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideCheckoutError();

    const payload = {
      fullName: document.getElementById("ship-name").value.trim(),
      address: document.getElementById("ship-address").value.trim(),
      city: document.getElementById("ship-city").value.trim(),
      email: session.email || "",
      cardNumber: document.getElementById("card-number").value.trim(),
      cardExpiry: document.getElementById("card-expiry").value.trim(),
      cardCvv: document.getElementById("card-cvv").value.trim()
    };

    const result = placeOrder(payload);
    if (!result.ok) {
      showCheckoutError(result.error);
      return;
    }

    cart.clear();
    renderCart();
    refs.checkoutForm.reset();
    refs.checkoutModal.close();

    const placedTime = new Date(result.order.placedAt).toLocaleString();
    refs.confirmText.textContent = `Order ${result.order.orderId} was placed on ${placedTime}.`;
    refs.confirmModal.showModal();
  });

  refs.confirmClose.addEventListener("click", () => {
    refs.confirmModal.close();
    closeCart();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCart();
  });
}

function init() {
  renderCategoryOptions();
  refs.category.value = "All";
  syncAuthButton();
  renderProducts();
  renderCart();
  bindEvents();
}

init();
