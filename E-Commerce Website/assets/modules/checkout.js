function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateCheckout(payload) {
  if (!payload.fullName || !payload.address || !payload.city) {
    return { ok: false, error: "Shipping details are required." };
  }
  if (!/^\d{16}$/.test(payload.cardNumber.replace(/\s+/g, ""))) {
    return { ok: false, error: "Card number must be 16 digits." };
  }
  if (!/^\d{2}\/\d{2}$/.test(payload.cardExpiry)) {
    return { ok: false, error: "Expiry must use MM/YY format." };
  }
  if (!/^\d{3}$/.test(payload.cardCvv)) {
    return { ok: false, error: "CVV must be 3 digits." };
  }
  if (!validateEmail(payload.email)) {
    return { ok: false, error: "A valid email is required." };
  }
  return { ok: true };
}

export function placeOrder(checkoutData) {
  const validation = validateCheckout(checkoutData);
  if (!validation.ok) return validation;

  const orderId = `NC-${Date.now().toString(36).toUpperCase()}`;
  return {
    ok: true,
    order: {
      orderId,
      placedAt: new Date().toISOString(),
      customer: checkoutData.fullName
    }
  };
}
