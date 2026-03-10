import { storage } from "./storage.js";

const SESSION_KEY = "ecom_session_v1";
const USERS_KEY = "ecom_users_v1";

function getUsers() {
  const raw = storage.get(USERS_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

function setUsers(users) {
  storage.set(USERS_KEY, users);
}

function sanitizeSession(value) {
  if (!value || typeof value !== "object") return { isLoggedIn: false, name: "", email: "" };
  if (value.isLoggedIn !== true) return { isLoggedIn: false, name: "", email: "" };
  if (typeof value.name !== "string" || typeof value.email !== "string") {
    return { isLoggedIn: false, name: "", email: "" };
  }
  return value;
}

export const auth = {
  getSession() {
    return sanitizeSession(storage.get(SESSION_KEY, null));
  },
  signup(name, email, password) {
    if (!name || !email || !password) return { ok: false, error: "All fields are required." };
    if (!email.includes("@")) return { ok: false, error: "Please enter a valid email." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    const users = getUsers();
    const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (exists) return { ok: false, error: "Account already exists for this email." };

    users.push({ name, email, password });
    setUsers(users);

    const session = { isLoggedIn: true, name, email };
    storage.set(SESSION_KEY, session);
    return { ok: true, session };
  },
  login(email, password) {
    if (!email || !password) return { ok: false, error: "Email and password are required." };
    const users = getUsers();
    const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session = { isLoggedIn: true, name: user.name, email: user.email };
    storage.set(SESSION_KEY, session);
    return { ok: true, session };
  },
  logout() {
    storage.remove(SESSION_KEY);
    return { isLoggedIn: false, name: "", email: "" };
  }
};
