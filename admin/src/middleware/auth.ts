import { Request, Response, NextFunction } from "express";
import { AdminUserRepository } from "../../../shared/src/repository";

export function requireLogin(req: Request, res: Response, next: NextFunction) {
  const anyReq = req as any;
  if (anyReq.session && anyReq.session.adminUserId) {
    return next();
  }
  return res.redirect("/login");
}

export function attachLocals(req: Request, res: Response, next: NextFunction) {
  const anyReq = req as any;
  const adminUserId = anyReq.session ? anyReq.session.adminUserId : undefined;
  
  if (adminUserId) {
    const user = AdminUserRepository.findById(adminUserId);
    res.locals.user = user;
  } else {
    res.locals.user = null;
  }
  
  next();
} 