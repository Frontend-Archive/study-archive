import type { MetadataRoute } from "next";
import { getArchiveSessions, MEMBERS } from "@/lib/archive";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://frontend-archive-study.sunny-grass-6556.chatgpt.site";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const sessions = await getArchiveSessions(); return [{ url: base, lastModified: new Date() }, { url: `${base}/about`, lastModified: new Date() }, ...sessions.map((session) => ({ url: `${base}/sessions/${session.id}`, lastModified: new Date(session.date) })), ...MEMBERS.map((member) => ({ url: `${base}/members/${member.slug}`, lastModified: new Date() }))]; }
