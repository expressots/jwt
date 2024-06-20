import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { JwtProvider } from "./jwt.provider";
import { VerifyOptions } from "./jwt.interface";
import { Report } from "@expressots/core";

@injectable()
export class JwtMiddleware {
  private jwtProvider: JwtProvider;
  private report: Report;

  constructor(@inject(JwtProvider) jwtProvider: JwtProvider) {
    this.jwtProvider = jwtProvider;
    this.report = new Report();
  }

  /**
   * Default JWT authentication middleware.
   * @param req - The express request object.
   * @param res - The express response object.
   * @param next - The next middleware function.
   */
  public default(req: Request, res: Response, next: NextFunction): void {
    const token = this.extractToken(req);

    if (!token) {
      return next(this.report.error("Authorization token missing", 401, "JwtMiddleware.default"));
    }

    try {
      const payload = this.jwtProvider.verify(token);
      req.user = payload as object;
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customizable JWT authentication middleware.
   * @param options - Custom verify options.
   * @returns The middleware function.
   */
  public customizable(options?: VerifyOptions) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const token = this.extractToken(req);

      if (!token) {
        return next(
          this.report.error("Authorization token missing", 401, "JwtMiddleware.customizable"),
        );
      }

      try {
        const payload = this.jwtProvider.verify(token, options);
        req.user = payload; // Attach the decoded payload to the request object
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Extracts the token from the Authorization header.
   * @param req - The express request object.
   * @returns The extracted token.
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }
}
