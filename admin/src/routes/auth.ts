import { Router } from "express";
import bcrypt from "bcryptjs";
import { AdminUserRepository, ensureDefaultAdminUser } from "../../../shared/src/repository";

export const router = Router();

// Ensure default admin/admin (hash at runtime)
const defaultPasswordHash = bcrypt.hashSync("admin", 10);
ensureDefaultAdminUser("admin", defaultPasswordHash);

router.get("/login", (_req, res) => {
  res.render("login", { error: null });
});

router.post("/login", (req, res) => {
  const anyReq = req as any;
  const { username, password } = req.body as { username: string; password: string };
  const user = AdminUserRepository.findByUsername(username);
  if (!user) return res.status(401).render("login", { error: "ユーザー名またはパスワードが正しくありません" });
  if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).render("login", { error: "ユーザー名またはパスワードが正しくありません" });
  anyReq.session.adminUserId = user.id;
  res.redirect("/dashboard");
});

router.get("/logout", (req, res) => {
  const anyReq = req as any;
  if (anyReq.session) {
    anyReq.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.redirect("/login");
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/logout", (req, res) => {
  const anyReq = req as any;
  if (anyReq.session) {
    anyReq.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.redirect("/login");
    });
  } else {
    res.redirect("/login");
  }
}); 