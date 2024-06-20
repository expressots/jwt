import { IProvider, Report } from "@expressots/core";
import { injectable } from "inversify";
import pkg from "../package.json";
import * as jwt from "jsonwebtoken";
import { SignOptions, VerifyOptions, DecodeOptions, Secret } from "./jwt.interface";

/**
 * JwtProvider is a service that wraps the jsonwebtoken library, providing
 * enhanced error handling and a simplified API for signing, verifying, and
 * decoding JSON Web Tokens (JWT).
 */
@injectable()
export class JwtProvider implements IProvider {
  readonly name: string = pkg.name;
  readonly version: string = pkg.version;
  readonly author: string = pkg.author;
  readonly repo: string = pkg.repository.url;
  private report: Report;
  private secret: Secret | null = null;
  private defaultSignOptions?: SignOptions;
  private defaultVerifyOptions?: VerifyOptions;

  constructor() {
    this.report = new Report();
  }

  /**
   * Sets the secret key used for signing and verifying tokens.
   * @param {string} secret - The secret key.
   */
  public setSecret(secret: Secret): void {
    this.secret = secret;
  }

  /**
   * Sets the default options for signing tokens.
   * @param {SignOptions} options - The default sign options.
   */
  public setDefaultSignOptions(options: SignOptions): void {
    this.defaultSignOptions = options;
  }

  /**
   * Sets the default options for verifying tokens.
   * @param {VerifyOptions} options - The default verify options.
   */
  public setDefaultVerifyOptions(options: VerifyOptions): void {
    this.defaultVerifyOptions = options;
  }

  /**
   * Synchronously signs the given payload into a JSON Web Token string.
   * @param {string | Buffer | object} payload - The payload to sign.
   * @param {SignOptions} [options] - Additional options for signing.
   * @returns {string} - The signed JWT.
   * @throws {AppError} - If an error occurs during signing.
   */
  public sign(payload: string | Buffer | object, options?: SignOptions): string {
    if (!this.secret) {
      throw this.report.error("JWT secret not set.", 500, "JWTProvider.sign");
    }
    try {
      return jwt.sign(payload, this.secret, { ...this.defaultSignOptions, ...options });
    } catch (error) {
      throw this.report.error(
        `Failed to sign the token: ${(error as Error).message}`,
        500,
        "JWTProvider.sign",
      );
    }
  }

  /**
   * Asynchronously signs the given payload into a JSON Web Token string.
   * @param {string | Buffer | object} payload - The payload to sign.
   * @param {SignOptions} [options] - Additional options for signing.
   * @returns {Promise<string>} - A promise that resolves to the signed JWT.
   * @throws {AppError} - If an error occurs during signing.
   */
  public async signAsync(
    payload: string | Buffer | object,
    options?: SignOptions,
  ): Promise<string> {
    if (!this.secret) {
      throw this.report.error("JWT secret not set.", 500, "JWTProvider.signAsync");
    }
    try {
      return await new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          this.secret!,
          { ...this.defaultSignOptions, ...options },
          (error, token) => {
            if (error) {
              reject(
                this.report.error(
                  `Failed to sign the token: ${error.message}`,
                  500,
                  "JWTProvider.signAsync",
                ),
              );
            } else {
              resolve(token!);
            }
          },
        );
      });
    } catch (error) {
      throw this.report.error(
        `Failed to sign the token asynchronously: ${(error as Error).message}`,
        500,
        "JWTProvider.signAsync",
      );
    }
  }

  /**
   * Synchronously verifies the given JSON Web Token string.
   * @param {string} token - The JWT to verify.
   * @param {VerifyOptions} [options] - Additional options for verifying.
   * @returns {T} - The decoded payload.
   * @throws {AppError} - If an error occurs during verification.
   */
  public verify<T extends object = any>(token: string, options?: VerifyOptions): T {
    if (!this.secret) {
      throw this.report.error("JWT secret not set.", 500, "JWTProvider.verify");
    }
    try {
      return jwt.verify(token, this.secret, { ...this.defaultVerifyOptions, ...options }) as T;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw this.report.error(
          `Token expired at ${(error as jwt.TokenExpiredError).expiredAt}`,
          401,
          "JWTProvider.verify",
        );
      } else if (error instanceof jwt.NotBeforeError) {
        throw this.report.error(
          `Token not active until ${(error as jwt.NotBeforeError).date}`,
          401,
          "JWTProvider.verify",
        );
      } else {
        throw this.report.error(
          `Failed to verify the token: ${(error as jwt.JsonWebTokenError).message}`,
          500,
          "JWTProvider.verify",
        );
      }
    }
  }

  /**
   * Asynchronously verifies the given JSON Web Token string.
   * @param {string} token - The JWT to verify.
   * @param {VerifyOptions} [options] - Additional options for verifying.
   * @returns {Promise<T>} - A promise that resolves to the decoded payload.
   * @throws {AppError} - If an error occurs during verification.
   */
  public async verifyAsync<T extends object = any>(
    token: string,
    options?: VerifyOptions,
  ): Promise<T> {
    if (!this.secret) {
      throw this.report.error("JWT secret not set.", 500, "JWTProvider.verifyAsync");
    }
    try {
      return await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          this.secret!,
          { ...this.defaultVerifyOptions, ...options },
          (error, decoded) => {
            if (error) {
              if (error instanceof jwt.TokenExpiredError) {
                reject(
                  this.report.error(
                    `Token expired at ${(error as jwt.TokenExpiredError).expiredAt}`,
                    401,
                    "JWTProvider.verifyAsync",
                  ),
                );
              } else if (error instanceof jwt.NotBeforeError) {
                reject(
                  this.report.error(
                    `Token not active until ${(error as jwt.NotBeforeError).date}`,
                    401,
                    "JWTProvider.verifyAsync",
                  ),
                );
              } else {
                reject(
                  this.report.error(
                    `Failed to verify the token: ${error.message}`,
                    500,
                    "JWTProvider.verifyAsync",
                  ),
                );
              }
            } else {
              resolve(decoded as T);
            }
          },
        );
      });
    } catch (error) {
      throw this.report.error(
        `Failed to verify the token asynchronously: ${(error as Error).message}`,
        500,
        "JWTProvider.verifyAsync",
      );
    }
  }

  /**
   * Decodes the given JSON Web Token string without verifying its signature.
   * @param {string} token - The JWT to decode.
   * @param {DecodeOptions} [options] - Additional options for decoding.
   * @returns {T} - The decoded payload.
   * @throws {AppError} - If an error occurs during decoding.
   */
  public decode<T = any>(token: string, options?: DecodeOptions): T {
    try {
      return jwt.decode(token, options) as T;
    } catch (error) {
      throw this.report.error(
        `Failed to decode the token: ${(error as Error).message}`,
        500,
        "JWTProvider.decode",
      );
    }
  }
}
