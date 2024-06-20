import { KeyObject } from "crypto";

export class JsonWebTokenError extends Error {
  inner: Error;

  constructor(message: string, error?: Error) {
    super(message);
    this.inner = error;
  }
}

export class TokenExpiredError extends JsonWebTokenError {
  expiredAt: Date;

  constructor(message: string, expiredAt: Date) {
    super(message);
    this.expiredAt = expiredAt;
  }
}

export class NotBeforeError extends JsonWebTokenError {
  date: Date;

  constructor(message: string, date: Date) {
    super(message);
    this.date = date;
  }
}

export interface SignOptions {
  algorithm?: Algorithm;
  keyid?: string;
  expiresIn?: string | number;
  notBefore?: string | number;
  audience?: string | Array<string>;
  subject?: string;
  issuer?: string;
  jwtid?: string;
  mutatePayload?: boolean;
  noTimestamp?: boolean;
  header?: JwtHeader;
  encoding?: string;
  allowInsecureKeySizes?: boolean;
  allowInvalidAsymmetricKeyTypes?: boolean;
}

export interface VerifyOptions {
  algorithms?: Array<Algorithm>;
  audience?: string | RegExp | Array<string | RegExp>;
  clockTimestamp?: number;
  clockTolerance?: number;
  complete?: boolean;
  issuer?: string | Array<string>;
  ignoreExpiration?: boolean;
  ignoreNotBefore?: boolean;
  jwtid?: string;
  nonce?: string;
  subject?: string;
  maxAge?: string | number;
  allowInvalidAsymmetricKeyTypes?: boolean;
}

export interface DecodeOptions {
  complete?: boolean;
  json?: boolean;
}

export interface JwtHeader {
  alg: string | Algorithm;
  typ?: string;
  cty?: string;
  crit?: Array<string | Exclude<keyof JwtHeader, "crit">>;
  kid?: string;
  jku?: string;
  x5u?: string | Array<string>;
  "x5t#S256"?: string;
  x5t?: string;
  x5c?: string | Array<string>;
}

export interface JwtPayload {
  [key: string]: any;
  iss?: string;
  sub?: string;
  aud?: string | Array<string>;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export interface Jwt {
  header: JwtHeader;
  payload: JwtPayload | string;
  signature: string;
}

export type Algorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512"
  | "none";

export type Secret = string | Buffer | KeyObject | { key: string | Buffer; passphrase: string };
