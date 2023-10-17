import { NextFunction, Request, Response } from "express";

export const minRequiredRank = function (minRank: number) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.session.user || req.session.user.rank < minRank) return res.status(404).render("not-found");
    else return next();
  };
};
