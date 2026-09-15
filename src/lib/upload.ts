import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

// Em produção (Docker), aponte UPLOADS_DIR para um diretório persistente fora
// de `public/` — o Next.js 16 não serve mais arquivos adicionados a `public/`
// após o build, então essas imagens são servidas por src/app/uploads/[...path]/route.ts.
export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");

export async function saveUploadedImage(file: File, subfolder: "presentes" | "fotos") {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Imagem muito grande. O limite é 8MB.");
  }

  const extension = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const fileName = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(/* turbopackIgnore: true */ UPLOADS_DIR, subfolder);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(/* turbopackIgnore: true */ uploadDir, fileName), buffer);

  return `/uploads/${subfolder}/${fileName}`;
}
