import { JwtPayload } from "./jwt.interface";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string | object;
    }
  }
}
