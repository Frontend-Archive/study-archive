import { describe, expect, it } from "vitest";
import { formatDate, parseArchiveMarkdown } from "@/lib/archive";
import { normalizeSearch } from "@/lib/search";
const article = (author: string, body = "title: '글'\n    url: 'https://example.com'\n    tags: ['React']") => `  - author: '${author}'\n    ${body}`;
const markdown = () => `---\nid: 7\ndate: '2026-09-13'\ntitle: '스터디 7회차'\ntype: 'on-line'\narticles:\n${article("권시현")}\n${article("민준경")}\n${article("염승준")}\n${article("최승원", "title: ''\n    url: ''\n    tags: []")}\n---\n`;
describe("parseArchiveMarkdown", () => { it("게시 글과 미작성 슬롯을 구분한다", () => { const session = parseArchiveMarkdown("202609.md", markdown()); expect(session.articles.filter((item) => item.status === "published")).toHaveLength(3); expect(session.articles[3].status).toBe("pending"); }); it("부분 작성된 슬롯을 거부한다", () => { const input = markdown().replace("title: ''\n    url: ''\n    tags: []", "title: '미완성'\n    url: ''\n    tags: []"); expect(() => parseArchiveMarkdown("202609.md", input)).toThrow(/함께 작성/); }); it("파일명과 날짜 불일치를 거부한다", () => expect(() => parseArchiveMarkdown("202610.md", markdown())).toThrow(/파일명/)); it("유효하지 않은 진행 방식을 거부한다", () => expect(() => parseArchiveMarkdown("202609.md", markdown().replace("on-line", "hybrid"))).toThrow()); });
it("검색 문자열은 대소문자와 공백을 정규화한다", () => expect(normalizeSearch(" React Compiler ")).toBe("reactcompiler"));
it("날짜는 실행 환경의 시간대와 무관하게 유지한다", () => expect(formatDate("2026-08-22")).toContain("8월 22일"));
