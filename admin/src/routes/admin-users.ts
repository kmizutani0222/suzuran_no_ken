import { Router } from "express";
import path from "path";
import { AdminUserRepository } from "../../../shared/src/repository";
import { AdminUserCreateInput, AdminUserUpdateInput } from "../../../shared/src/models";
import bcrypt from "bcrypt";

export const router = Router();

// 一覧表示
router.get("/", (_req, res) => {
  const items = AdminUserRepository.list();
  res.render(path.join("admin_users", "index"), { items });
});

// 新規作成フォーム表示
router.get("/new", (_req, res) => {
  res.render(path.join("admin_users", "new"));
});

// 新規作成処理
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // パスワードのハッシュ化
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const input: AdminUserCreateInput = {
      username,
      passwordHash
    };
    
    AdminUserRepository.create(input);
    res.redirect("/admin-users");
  } catch (error) {
    console.error("AdminUser作成エラー:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 編集フォーム表示
router.get("/:id/edit", (req, res) => {
  const item = AdminUserRepository.findById(req.params.id);
  if (!item) return res.status(404).send("Not Found");
  res.render(path.join("admin_users", "edit"), { item });
});

// 更新処理
router.post("/:id", async (req, res) => {
  try {
    const { username, password } = req.body;
    const input: AdminUserUpdateInput = { username };
    
    // パスワードが入力されている場合のみハッシュ化
    if (password && password.trim() !== "") {
      const saltRounds = 10;
      input.passwordHash = await bcrypt.hash(password, saltRounds);
    }
    
    AdminUserRepository.update(req.params.id, input);
    res.redirect("/admin-users");
  } catch (error) {
    console.error("AdminUser更新エラー:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 削除処理
router.post("/:id/delete", (req, res) => {
  AdminUserRepository.delete(req.params.id);
  res.redirect("/admin-users");
}); 