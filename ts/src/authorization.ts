import { NextFunction, Request, Response } from "express";

export const adminAuthorization = function (req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.rank < 10) return res.status(404).render("not-found");
  else return next();
};
