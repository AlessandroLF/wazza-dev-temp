// lib/flags.ts
import { promises as fs } from "fs";
import path from "path";

export type FlagMeta = { id: string; slug: string; name: string; src: string };

/** Reads /public/flags and returns [{ id, slug, name, src }] sorted by id */
export async function getFlags(): Promise<FlagMeta[]> {
  const dir = path.join(process.cwd(), "public", "flags");
  const files = await fs.readdir(dir);
  const svgs = files.filter((f) => f.toLowerCase().endsWith(".svg"));

  const out: FlagMeta[] = [];
  for (const file of svgs) {
    const base = file.replace(/\.svg$/i, "");
    // Expect "NNN-country-name"
    const m = /^(\d{3})-(.+)$/i.exec(base);
    if (!m) continue;

    const id = m[1];
    const slug = m[2];
    const nice = slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case

    out.push({ id, slug, name: nice, src: `/flags/${file}` });
  }

  out.sort((a, b) => Number(a.id) - Number(b.id));
  return out;
}
