import { mkdirSync } from "fs";
import path from "path";

export function uploadDir() {
  const dir =
    process.env.UPLOAD_DIR ||
    (process.env.DATABASE_URL?.includes("/data/")
      ? "/data/avatars"
      : path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads", "avatars"));
  mkdirSync(dir, { recursive: true });
  return dir;
}
