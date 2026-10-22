import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const sessionCookieName = "nook_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash || !/^[a-f0-9]{128}$/i.test(storedHash)) {
    return false;
  }
  const derivedKey = await scrypt(password, salt, 64);
  const expected = Buffer.from(storedHash, "hex");
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

function sign(payload) {
  return createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionCookie(user) {
  const payload = Buffer.from(
    JSON.stringify({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      expiresAt: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
    }),
  ).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionLifetimeSeconds}${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

export function readSession(request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`));
  if (!cookie) return null;

  try {
    const value = cookie.slice(sessionCookieName.length + 1);
    const separator = value.lastIndexOf(".");
    if (separator < 1) return null;

    const payload = value.slice(0, separator);
    const suppliedSignature = Buffer.from(value.slice(separator + 1), "base64url");
    const expectedSignature = Buffer.from(sign(payload), "base64url");
    if (
      suppliedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(suppliedSignature, expectedSignature)
    ) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      typeof session.userId !== "string" ||
      typeof session.email !== "string" ||
      typeof session.name !== "string" ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export const sessionCookie = sessionCookieName;
