declare global {
  namespace Express {
    interface Request {
        user?: 
    }
  }
  interface BigInt {
    toJSON(): string;
  }
}
