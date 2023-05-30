import { NextFunction, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { Authorized, AuthorizedRequest } from "../Types";

export const authorization = function (req: AuthorizedRequest, res: Response, next: NextFunction) {
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

export const adminAuthorization = function (req: AuthorizedRequest, res: Response, next: NextFunction) {
  if (req.authorized && req.authorized.rank === 10) return next();
  else return res.status(404).render("not-found");
};
