import { ContextType } from "@smoke-trees/smoke-context";

export type Optional<T, M extends keyof T> = Pick<Partial<T>, M> & Omit<T, M>;

declare global {
  // eslint-disable-next-line
  namespace SmokeContext {
    export interface KeyValuePair {
      userId: string;
    }
  }

  // eslint-disable-next-line
  namespace Express {
    export interface Request {
      context: ContextType;
    }
  }
}
