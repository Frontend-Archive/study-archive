import { describe, expect, it } from "vitest";
import type { ArchiveSession } from "@/lib/archive";
import { formatDate, parseArchiveMarkdown } from "@/lib/archive";
import {
  filterArchiveSessions,
  normalizeSearch,
  parseTopicFilter,
} from "@/lib/search";
import {
  getTopicRecords,
  getTopicsForTags,
  OTHER_TOPIC,
  TOPICS,
} from "@/lib/topics";
const article = (author: string, body = "title: '글'\n    url: 'https://example.com'\n    tags: ['React']") => `  - author: '${author}'\n    ${body}`;
const markdown = () => `---\nid: 7\ndate: '2026-09-13'\ntitle: '스터디 7회차'\ntype: 'on-line'\narticles:\n${article("권시현")}\n${article("민준경")}\n${article("염승준")}\n${article("최승원", "title: ''\n    url: ''\n    tags: []")}\n---\n`;
describe("parseArchiveMarkdown", () => { it("게시 글과 미작성 슬롯을 구분한다", () => { const session = parseArchiveMarkdown("202609.md", markdown()); expect(session.articles.filter((item) => item.status === "published")).toHaveLength(3); expect(session.articles[3].status).toBe("pending"); }); it("부분 작성된 슬롯을 거부한다", () => { const input = markdown().replace("title: ''\n    url: ''\n    tags: []", "title: '미완성'\n    url: ''\n    tags: []"); expect(() => parseArchiveMarkdown("202609.md", input)).toThrow(/함께 작성/); }); it("파일명과 날짜 불일치를 거부한다", () => expect(() => parseArchiveMarkdown("202610.md", markdown())).toThrow(/파일명/)); it("유효하지 않은 진행 방식을 거부한다", () => expect(() => parseArchiveMarkdown("202609.md", markdown().replace("on-line", "hybrid"))).toThrow()); });
it("검색 문자열은 대소문자와 공백을 정규화한다", () => expect(normalizeSearch(" React Compiler ")).toBe("reactcompiler"));
it("날짜는 실행 환경의 시간대와 무관하게 유지한다", () => expect(formatDate("2026-08-22")).toContain("8월 22일"));

const sessions: ArchiveSession[] = [
  {
    id: 2,
    date: "2026-02-10",
    title: "스터디 2회차",
    type: "on-line",
    articles: [
      {
        status: "published",
        author: "염승준",
        title: "React Compiler 살펴보기",
        url: "https://example.com/react",
        tags: ["React", "성능 개선"],
      },
      {
        status: "pending",
        author: "최승원",
        title: "",
        url: "",
        tags: [],
      },
    ],
  },
  {
    id: 1,
    date: "2026-01-10",
    title: "스터디 1회차",
    type: "off-line",
    articles: [
      {
        status: "published",
        author: "염승준",
        title: "TypeScript 안전성",
        url: "https://example.com/typescript",
        tags: ["TS"],
      },
    ],
  },
];

describe("주제 분류", () => {
  it("현재 35개 태그를 중복 없이 여섯 주제에 매핑한다", () => {
    const tags = TOPICS.flatMap((topic) => topic.tags);
    expect(tags).toHaveLength(35);
    expect(new Set(tags)).toHaveLength(35);
    expect(getTopicsForTags(tags)).toEqual(TOPICS);
  });

  it("알 수 없는 태그를 기타 주제로 분류한다", () => {
    expect(getTopicsForTags(["새로운 기술"])).toEqual([OTHER_TOPIC]);
  });

  it("주제 기록을 최신 회차부터 반환하고 미작성 슬롯을 제외한다", () => {
    const records = getTopicRecords(sessions, "performance-reliability");
    expect(records.map(({ session }) => session.id)).toEqual([2]);
    expect(records[0].article.title).toContain("React Compiler");
  });
});

describe("아카이브 필터", () => {
  it("검색어, 작성자, 태그와 주제를 AND 조건으로 조합한다", () => {
    const filtered = filterArchiveSessions(sessions, {
      query: "react compiler",
      author: "염승준",
      tag: "React",
      topic: "performance-reliability",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].articles).toHaveLength(1);
  });

  it("주제 필터가 활성화되면 미작성 슬롯을 제외한다", () => {
    const filtered = filterArchiveSessions(sessions, {
      query: "",
      author: "",
      tag: "",
      topic: "react-framework",
    });
    expect(filtered.flatMap((session) => session.articles)).toHaveLength(1);
  });

  it("알 수 없는 topic 쿼리를 무시한다", () => {
    expect(parseTopicFilter("not-a-topic")).toBe("");
    expect(parseTopicFilter("product-ux")).toBe("product-ux");
  });
});
