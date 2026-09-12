import { useState, useEffect, useRef } from "react";
import {
  FileText,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ChapterDocumentViewerProps {
  url: string;
  title: string;
  chapterNo?: number | undefined;
}

export function ChapterDocumentViewer({ url, title, chapterNo }: ChapterDocumentViewerProps) {
  const isPdf = /\.pdf(\?.*)?$/i.test(url);
  const isCloudinary = url.includes("res.cloudinary.com");

  // For Cloudinary PDFs, convert to high-resolution rasterized image URL
  const resolvedPdfImageUrl = isCloudinary && isPdf
    ? url.replace(/\.pdf(\?.*)?$/i, ".jpg$1")
    : url;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [page, setPage] = useState(1);
  // Highest page number we have actually RENDERED successfully.
  // Once >= 2, we permanently know this is a multi-page document.
  const [maxPageVisited, setMaxPageVisited] = useState(1);
  // Tracks whether the next page exists:
  //   null  = not yet checked (preload in-flight)
  //   true  = next page confirmed by background preload
  //   false = next page confirmed missing (navigation error or preload 404)
  const [nextPageExists, setNextPageExists] = useState<boolean | null>(null);
  // The highest page we have successfully NAVIGATED to (not just preloaded)
  const [confirmedLastPage, setConfirmedLastPage] = useState<number | null>(null);
  const preloadRef = useRef<HTMLImageElement | null>(null);

  // For multi-page Cloudinary PDFs
  const getPageUrl = (pageNum: number) => {
    if (!isCloudinary || !isPdf) return resolvedPdfImageUrl;
    if (pageNum === 1) return resolvedPdfImageUrl;
    return url
      .replace(/\/upload\/(v\d+\/)?/, `/upload/pg_${pageNum},q_auto,f_auto/$1`)
      .replace(/\.pdf(\?.*)?$/i, ".jpg$1");
  };

  // Eagerly preload the NEXT page whenever current page changes.
  // Only sets nextPageExists — never hides the pagination bar.
  useEffect(() => {
    if (!isPdf || !isCloudinary) return;
    // Reset while in-flight
    setNextPageExists(null);
    const nextUrl = getPageUrl(page + 1);
    const img = new Image();
    img.src = nextUrl;
    preloadRef.current = img;
    img.onload = () => setNextPageExists(true);
    img.onerror = () => setNextPageExists(false);
    return () => { img.src = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Sanitized title for attachment filename
  const cleanTitle = (title || "document").replace(/[^a-zA-Z0-9_\-]/g, "_");

  // Cloudinary direct download URL using fl_attachment flag
  const downloadUrl = isCloudinary
    ? isPdf
      ? url
          .replace(/\/upload\/(v\d+\/)?/, `/upload/fl_attachment:${cleanTitle}/$1`)
          .replace(/\.pdf(\?.*)?$/i, ".jpg$1")
      : url.replace(/\/upload\/(v\d+\/)?/, `/upload/fl_attachment:${cleanTitle}/$1`)
    : (isPdf ? resolvedPdfImageUrl : url);

  const currentDisplayUrl = getPageUrl(page);

  const handleImageError = () => {
    setIsLoading(false);
    if (page > 1) {
      // Navigated to a page that doesn't exist — step back
      setConfirmedLastPage(page - 1);
      setNextPageExists(false);
      setPage((p) => p - 1);
    } else {
      setHasError(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setMaxPageVisited((prev) => Math.max(prev, page));
  };

  // Next page is disabled only when:
  //  - preload confirmed no next page AND we've never visited beyond current page
  //  - OR navigation error confirmed the last page
  const isLastPage =
    (nextPageExists === false && maxPageVisited <= page) ||
    (confirmedLastPage !== null && page >= confirmedLastPage);

  const goToPrevPage = () => {
    if (page <= 1 || isLoading) return;
    setPage((p) => Math.max(1, p - 1));
    setIsLoading(true);
  };

  const goToNextPage = () => {
    if (isLastPage || isLoading) return;
    setPage((p) => p + 1);
    setIsLoading(true);
  };

  // Always show pagination for Cloudinary PDFs (no fatal error).
  // Hide ONLY when confirmed single-page: preload failed, still on page 1,
  // and we have NEVER successfully rendered any page beyond page 1.
  const showPagination = isPdf && isCloudinary && !hasError &&
    !(nextPageExists === false && page === 1 && maxPageVisited === 1 && confirmedLastPage === null);

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all">
      {/* Top Document Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-muted/40 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-vermilion/10 text-vermilion font-medium">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span>{isPdf ? "पीडीएफ दस्तावेज़" : "चित्र"}</span>
              {chapterNo && (
                <span className="font-mono text-ink-soft">· अध्याय {chapterNo}</span>
              )}
            </div>
            <p className="text-[11px] text-ink-soft truncate max-w-[200px] sm:max-w-[320px]">
              {title}
            </p>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex items-center gap-1 rounded-full border border-input bg-background px-2.5 py-1 text-ink-soft transition-colors hover:text-foreground hover:bg-muted"
            title={isZoomed ? "सामान्य आकार" : "बड़ा करें"}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="h-3 w-3" />
                <span className="hidden sm:inline">छोटा करें</span>
              </>
            ) : (
              <>
                <ZoomIn className="h-3 w-3" />
                <span className="hidden sm:inline">बड़ा करें</span>
              </>
            )}
          </button>

          {/* Open In New Tab */}
          <a
            href={isPdf ? resolvedPdfImageUrl : url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full border border-input bg-background px-2.5 py-1 text-ink-soft transition-colors hover:text-foreground hover:bg-muted"
            title="पूर्ण पृष्ठ में देखें"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">नया टैब</span>
          </a>

          {/* Download Link */}
          <a
            href={downloadUrl}
            download={`${cleanTitle}.jpg`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-primary-foreground transition-transform hover:-translate-y-0.5"
            title="डाउनलोड करें"
          >
            <Download className="h-3 w-3" />
            <span>सहेजें</span>
          </a>
        </div>
      </div>

      {/* Main Document Content Canvas */}
      <div
        className={`relative flex flex-col items-center justify-center p-3 sm:p-6 transition-all duration-300 ${
          isZoomed ? "bg-muted/30 max-h-none overflow-x-auto" : "bg-muted/15 max-h-[700px] overflow-hidden"
        }`}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-xs gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-vermilion" />
            <span className="text-xs text-ink-soft">दस्तावेज़ लोड हो रहा है...</span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError ? (
          <div className="my-8 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive/80 mb-2" />
            <p className="font-display text-base text-foreground">
              दस्तावेज़ पूर्वावलोकन लोड नहीं हो सका
            </p>
            <p className="text-xs text-ink-soft mt-1 max-w-sm">
              सीधे नए टैब में खोलकर या डाउनलोड करके देखें।
            </p>
            <a
              href={resolvedPdfImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              दस्तावेज़ खोलें
            </a>
          </div>
        ) : (
          <div
            className={`relative rounded-xl border border-border/80 bg-background shadow-lg transition-all ${
              isZoomed ? "w-full max-w-4xl" : "w-auto max-w-full"
            }`}
          >
            <img
              key={currentDisplayUrl}
              src={currentDisplayUrl}
              alt={title}
              loading="eager"
              decoding="async"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`rounded-xl object-contain mx-auto transition-all ${
                isZoomed
                  ? "w-full h-auto max-h-none"
                  : "w-auto max-h-[580px]"
              }`}
            />
          </div>
        )}
      </div>

      {/* Multi-page pagination controls */}
      {showPagination && (
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2 text-xs text-ink-soft">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={goToPrevPage}
            className="hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← पिछला पृष्ठ
          </button>

          <span className="font-mono">
            पृष्ठ {page}{confirmedLastPage ? ` / ${confirmedLastPage}` : ""}
          </span>

          <button
            type="button"
            disabled={isLastPage || isLoading}
            onClick={goToNextPage}
            className="text-vermilion hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
          >
            अगला पृष्ठ →
          </button>
        </div>
      )}
    </div>
  );
}
