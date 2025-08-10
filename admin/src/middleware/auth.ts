import { Request, Response, NextFunction } from "express";

export function requireLogin(req: Request, res: Response, next: NextFunction) {
  const anyReq = req as any;
  if (anyReq.session && anyReq.session.adminUserId) {
    return next();
  }
  return res.redirect("/login");
}

export function attachLocals(req: Request, res: Response, next: NextFunction) {
  const anyReq = req as any;
  res.locals.currentAdminUserId = anyReq.session ? anyReq.session.adminUserId : undefined;
  next();
} 