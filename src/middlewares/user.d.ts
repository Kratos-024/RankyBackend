export interface UserType {
  email: string;
  name: string;
  login: string;
  id: string;
  iat: number;
  exp: number;
}
declare global {
  namespace Express {
    interface Request {
      user?: UserType;
    }
  }
}
