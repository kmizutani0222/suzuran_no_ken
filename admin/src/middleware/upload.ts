import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.join(process.cwd(), "..", "uploads");

if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_ROOT);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
    const fname = `${Date.now()}_${base}${ext}`;
    cb(null, fname);
  },
});

export const upload = multer({ storage });

export function toPublicPath(filename: string): string {
  return `/uploads/${filename}`;
} 