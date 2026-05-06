import { NextResponse } from "next/server";

import { saveUploadedFile } from "@/services/upload.service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File not received" },
        { status: 400 }
      );
    }

    const fileUrl = await saveUploadedFile(file);

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
