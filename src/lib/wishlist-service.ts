import apiClient from "./api";
import { type ApiBlog } from "./blog-service";

export const WISHLIST_QUERY_KEY = ["public-wishlist"] as const;

export interface WishlistResponse {
  success?: boolean;
  data?: ApiBlog[] | { blogs?: ApiBlog[] };
}

function isBlogLike(value: unknown): value is ApiBlog {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  return typeof rec["_id"] === "string" && typeof rec["slug"] === "string";
}

function unwrapWishlistPayload(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;

  if (body && typeof body === "object") {
    const rec = body as Record<string, unknown>;
    if (Array.isArray(rec["data"])) return rec["data"];
    const nested = rec["data"];
    if (nested && typeof nested === "object" && Array.isArray((nested as { blogs?: unknown[] }).blogs)) {
      return (nested as { blogs: unknown[] }).blogs;
    }
  }

  return [];
}

export const wishlistService = {
  async getWishlist(): Promise<ApiBlog[]> {
    const response = await apiClient.get<WishlistResponse | ApiBlog[]>("/api/public/wishlist");
    const rows = unwrapWishlistPayload(response.data);

    return rows
      .map((row) => {
        if (isBlogLike(row)) return row;
        if (row && typeof row === "object" && isBlogLike((row as { blog?: unknown }).blog)) {
          return (row as { blog: ApiBlog }).blog;
        }
        return null;
      })
      .filter((blog): blog is ApiBlog => !!blog);
  },

  async toggleWishlist(blogId: string): Promise<void> {
    await apiClient.post(`/api/public/wishlist/${blogId}`, {});
  },
};
