import { useRouter } from "next/navigation";

export const ALLOWED_PAGES = {
  get home(): string {
    return "/";
  },
  get login(): string {
    return "/login";
  },
  get videos(): string {
    return "/videos";
  },
  get searchResult(): string {
    return `${this.videos}/results`;
  },
  videoDetail(id: string) {
    return `/videos/${id}`;
  },
  get uploadVideo(): string {
    return "/upload-video";
  },
} as const;

type Page = keyof typeof ALLOWED_PAGES;

const useNavigation = () => {
  const router = useRouter();

  /**
   * Generate a dynamic URL based on the page and optional params.
   * @param page - The target page key from ALLOWED_PAGES.
   * @param params - Query parameters or required dynamic ID (for `videoDetail`).
   * @returns Fully constructed localized URL.
   */
  const getPageUrl = (page: Page, params?: Record<string, string | number>) => {
    let pageUrl = ALLOWED_PAGES[page];

    if (typeof pageUrl === "function" && params?.id) {
      pageUrl = pageUrl(String(params.id));
      delete params.id;
    }

    const queryString =
      params && Object.keys(params).length ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";

    return `${pageUrl}${queryString}`;
  };

  /**
   * Navigate to a new page dynamically.
   * @param page - The target page.
   * @param params - Query parameters or required `id` for `videoDetail`.
   */
  const navigateTo = (page: Page, params?: Record<string, string | number>) => {
    const url = getPageUrl(page, params);
    router.push(url, { scroll: true });
  };

  return { getPageUrl, navigateTo };
};

export default useNavigation;
