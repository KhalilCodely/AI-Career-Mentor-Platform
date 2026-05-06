import { writeFile } from "fs/promises";
import path from "path";

export async function saveUploadedFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public/uploads");

  await writeFile(path.join(uploadDir, ".keep"), "", { flag: "a" });

  const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}
