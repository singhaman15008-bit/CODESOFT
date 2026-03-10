import { storage } from "./storage.js";

export const CART_KEY = "ecom_cart_v1";
const SHIPPING_FLAT = 8;

function safeItems(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item.productId === "string")
    .map((item) => ({
      productId: item.productId,
      quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1
    }));
}

export function createCart(products) {
  const byId = new Map(products.map((p) => [p.id, p]));
  let items = safeItems(storage.get(CART_KEY, []));

  function persist() {
    storage.set(CART_KEY, items);
  }

  return {
    items() {
      return [...items];
    },
    count() {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },
    add(productId) {
      if (!byId.has(productId)) return false;
      const existing = items.find((item) => item.productId === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({ productId, quantity: 1 });
      }
      persist();
      return true;
    },
    update(productId, quantity) {
      const qty = Number(quantity);
      if (!byId.has(productId) || !Number.isInteger(qty) || qty < 1) return false;
      const existing = items.find((item) => item.productId === productId);
      if (!existing) return false;
      existing.quantity = qty;
      persist();
      return true;
    },
    remove(productId) {
      items = items.filter((item) => item.productId !== productId);
      persist();
    },
    clear() {
      items = [];
      persist();
    },
    totals() {
      const subtotal = items.reduce((sum, item) => {
        const product = byId.get(item.productId);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);
      const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
      const total = subtotal + shipping;
      return { subtotal, shipping, total };
    }
  };
}
