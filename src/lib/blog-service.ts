import apiClient from "./api";
import { type Story, type Chapter } from "@/data/content";

export interface BlogSection {
  chapter_no: number;
  chapter_name: string;
  description: string;
  imageUrl?: string | undefined;
  _id?: string | undefined;
}

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string | undefined;
}

export interface ApiBlog {
  _id: string;
  title: string;
  content?: string | undefined;
  category: BlogCategory | string | null;
  author?: string | undefined;
  status?: string | undefined;
  tags?: string[] | undefined;
  coverImage?: string | undefined;
  header_section_img?: string[] | undefined;
  footer_section_img?: string[] | undefined;
  views?: number | undefined;
  sections?: BlogSection[] | undefined;
  slug: string;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface BlogPagination {
  total: number;
  page: number;
  limit: number;
}

export interface BlogListResponse {
  success: boolean;
  data: ApiBlog[];
  pagination?: BlogPagination | undefined;
}

export interface SingleBlogResponse {
  success: boolean;
  data: ApiBlog;
}

export interface CategoriesResponse {
  success: boolean;
  data: BlogCategory[];
}

export interface BlogQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  category?: string | undefined;
  search?: string | undefined;
}

/**
 * Transforms an API Blog object into the Story format used across the app
 */
export function apiBlogToStory(blog: ApiBlog): Story {
  // Extract category display name
  const categoryName =
    typeof blog.category === "object" && blog.category?.name
      ? blog.category.name
      : typeof blog.category === "string" && blog.category.trim()
        ? blog.category
        : "जैन कथा";

  // Compute reading duration from content and chapters
  const allText =
    (blog.content || "") +
    " " +
    (blog.sections?.map((s) => `${s.chapter_name} ${s.description}`).join(" ") || "");
  const words = allText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.round(words / 90) || 5);

  // Map sections to Chapters
  let chapters: Chapter[] = [];
  if (blog.sections && blog.sections.length > 0) {
    chapters = blog.sections
      .slice()
      .sort((a, b) => (a.chapter_no || 0) - (b.chapter_no || 0))
      .map((sec) => {
        const paras = sec.description
          ? sec.description
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean)
          : ["विवरण उपलब्ध नहीं है।"];

        return {
          title: sec.chapter_name || `अध्याय ${sec.chapter_no}`,
          paras: paras.length > 0 ? paras : [sec.description || ""],
          imageUrl: sec.imageUrl || undefined,
        };
      });
  } else if (blog.content && blog.content.trim()) {
    const paras = blog.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    chapters = [
      {
        title: "कथा विस्तार",
        paras: paras.length > 0 ? paras : [blog.content],
      },
    ];
  } else {
    chapters = [
      {
        title: "कथा परिचय",
        paras: ["कथा सामग्री शीघ्र ही उपलब्ध होगी।"],
      },
    ];
  }

  // Derive summary
  let summary = "";
  if (blog.sections && blog.sections.length > 0 && blog.sections[0]?.description) {
    summary = blog.sections[0].description.slice(0, 150) + "...";
  } else if (blog.content) {
    summary = blog.content.slice(0, 150) + "...";
  } else {
    summary = "जैन वाचनालय की पावन प्रेरणादायक कथा।";
  }

  const rawCoverUrl = blog.coverImage || blog.header_section_img?.[0];
  const coverUrl =
    rawCoverUrl && rawCoverUrl.includes("res.cloudinary.com") && /\.pdf(\?.*)?$/i.test(rawCoverUrl)
      ? rawCoverUrl.replace(/\.pdf(\?.*)?$/i, ".jpg$1")
      : rawCoverUrl;

  return {
    slug: blog.slug,
    title: blog.title,
    latin: blog.slug.replace(/-/g, " "),
    category: categoryName,
    cover: null,
    coverImage: coverUrl || undefined,
    views: typeof blog.views === "number" ? blog.views : undefined,
    author: blog.author || undefined,
    tags: blog.tags || undefined,
    content: blog.content || undefined,
    minutes,
    audio: "08:00",
    summary,
    chapters,
    related: [],
  };
}

export const blogService = {
  /**
   * Fetch blogs list with optional filters and pagination
   * GET /api/public/blog
   */
  async getBlogs(params?: BlogQueryParams): Promise<BlogListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.category) query.append("category", params.category);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/api/public/blog?${queryString}` : "/api/public/blog";

    const res = await apiClient.get<BlogListResponse>(endpoint);
    return res.data;
  },

  /**
   * Fetch single blog by slug
   * GET /api/public/blog/:slug
   */
  async getBlogBySlug(slug: string): Promise<ApiBlog | null> {
    try {
      const res = await apiClient.get<SingleBlogResponse>(`/api/public/blog/${slug}`);
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch all public categories
   * GET /api/public/categories
   */
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const res = await apiClient.get<CategoriesResponse>("/api/public/categories");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },
};
