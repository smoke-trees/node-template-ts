import { ContextType } from '@smoke-trees/smoke-context'

declare global {
  namespace Express {
    export interface Request {
      context: ContextType;
    }
  }
}

export {}
