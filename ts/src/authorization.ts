import jsonwebtoken from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export interface Authorized {
  id: number;
  login: string;
  rank: number;
}

export interface AuthorizedRequest extends Request {
  authorized?: Authorized;
}

const authorization = function (req: AuthorizedRequest, res: Response, next: NextFunction) {
  if (typeof req.cookies.token !== "string") return next();
  const token = req.cookies.token;
  const isValid = jsonwebtoken.verify(token, process.env.TOKEN_SECRET as string);
  if (isValid) {
    const payload = jsonwebtoken.decode(token) as Authorized;
    req.authorized = {
      id: payload.id,
      login: payload.login,
      rank: payload.rank,
    };
  }
  return next();
};

export default authorization;
