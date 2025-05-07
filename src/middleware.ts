import acceptLanguage from "accept-language";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { fallbackLanguage, languages, cookieName } from "./services/i18n/config";

acceptLanguage.languages([...languages]);

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes("/api/") ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  let language;
  if (req.cookies.has(cookieName)) language = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  if (!language) language = acceptLanguage.get(req.headers.get("Accept-Language"));
  if (!language) language = fallbackLanguage;

  if (req.headers.has("referer")) {
    const refererUrl = new URL(req.headers.get("referer") ?? "");
    const languageInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`));
    const response = NextResponse.next();
    if (languageInReferer) response.cookies.set(cookieName, languageInReferer);

    return response;
  }

  return NextResponse.next();
}
