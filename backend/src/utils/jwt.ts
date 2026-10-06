import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: string;
}

const ACCESS_EXPIRES  = "15m";
const REFRESH_EXPIRES = "7d";

export const signAccessToken  = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: ACCESS_EXPIRES } as SignOptions);

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: REFRESH_EXPIRES } as SignOptions);

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
