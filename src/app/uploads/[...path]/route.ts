import { NextRequest, NextResponse } from "next/server";
import { stat, readFile } from "fs/promises";
import path from "path";
import { UPLOADS_DIR } from "@/lib/upload";

// No Next.js 16, arquivos gravados em `public/` após o build (como os uploads
// de convidados/presentes) não são mais servidos automaticamente pelo
// servidor standalone. Esta rota assume esse papel, lendo direto do disco.
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments?.length || segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return new NextResponse(null, { status: 400 });
  }

  const contentType = CONTENT_TYPES[path.extname(segments.at(-1)!).toLowerCase()];
  if (!contentType) {
    return new NextResponse(null, { status: 400 });
  }

  const filePath = path.join(/* turbopackIgnore: true */ UPLOADS_DIR, ...segments);
  if (path.relative(UPLOADS_DIR, filePath).startsWith("..")) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error("not a file");
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stats.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
