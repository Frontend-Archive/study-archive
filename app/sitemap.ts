import type { MetadataRoute } from "next";
import { getArchiveSessions, MEMBERS } from "@/lib/archive";
import { SITE_URL } from "@/lib/site";
import { ALL_TOPICS } from "@/lib/topics";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const sessions = await getArchiveSessions(); return [{ url: SITE_URL, lastModified: new Date() }, { url: `${SITE_URL}/about`, lastModified: new Date() }, ...sessions.map((session) => ({ url: `${SITE_URL}/sessions/${session.id}`, lastModified: new Date(session.date) })), ...MEMBERS.map((member) => ({ url: `${SITE_URL}/members/${member.slug}`, lastModified: new Date() })), ...ALL_TOPICS.map((topic) => ({ url: `${SITE_URL}/topics/${topic.slug}`, lastModified: new Date(sessions[0]?.date ?? Date.now()) }))]; }
