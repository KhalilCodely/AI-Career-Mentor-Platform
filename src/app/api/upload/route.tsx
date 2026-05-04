import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // convert file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // generate unique name
    const filename = `${uuid()}-${file.name}`;

    // save to /public/uploads
    const filePath = path.join(process.cwd(), "public/uploads", filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}