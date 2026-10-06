import { pool } from "../../db/client";
import { hashPassword, comparePassword } from "../../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { RegisterBody, LoginBody } from "./auth.types";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

/** Register a new user and return token pair. */
export async function register(body: RegisterBody) {
  const { email, password, firstName, lastName, role = "student" } = body;

  // Check duplicate email
  const exists = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  if (exists.rowCount && exists.rowCount > 0) {
    throw Object.assign(new Error("Email already registered"), { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, role`,
    [email.toLowerCase(), passwordHash, firstName, lastName, role]
  );

  const user = result.rows[0];
  return buildTokenResponse(user);
}

/** Validate credentials and return token pair. */
export async function login(body: LoginBody) {
  const { email, password } = body;

  const result = await pool.query<UserRow>(
    "SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1",
    [email.toLowerCase()]
  );

  const user = result.rows[0];
  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }
  if (!user.is_active) {
    throw Object.assign(new Error("Account is deactivated"), { status: 403 });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }

  return buildTokenResponse(user);
}

/** Issue a new access token from a valid refresh token. */
export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw Object.assign(new Error("Refresh token expired or invalid"), { status: 401 });
  }

  // Confirm user still exists and is active
  const result = await pool.query<UserRow>(
    "SELECT id, email, role, is_active FROM users WHERE id = $1",
    [payload.sub]
  );
  const user = result.rows[0];
  if (!user || !user.is_active) {
    throw Object.assign(new Error("User not found or inactive"), { status: 401 });
  }

  const jwtPayload = { sub: user.id, email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(jwtPayload),
  };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function buildTokenResponse(user: Pick<UserRow, "id" | "email" | "first_name" | "last_name" | "role">) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return {
    accessToken:  signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id:        user.id,
      email:     user.email,
      firstName: user.first_name,
      lastName:  user.last_name,
      role:      user.role,
    },
  };
}
