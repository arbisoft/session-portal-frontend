"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import useLanguage from "@/services/i18n/use-language";

type PropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Protected route for authenticated users
export function withAuth(Component: React.ComponentType<PropsType>) {
  return function ProtectedRoute(props: PropsType) {
    const router = useRouter();
    const language = useLanguage();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace(`/${language}/signin`);
      }
    }, [isAuthenticated, isLoading, router, language]);

    // Render only if authenticated
    return isAuthenticated ? <Component {...props} /> : null;
  };
}

// Protected route for guests (not authenticated)
export function withGuest(Component: React.ComponentType<PropsType>) {
  return function GuestRoute(props: PropsType) {
    const router = useRouter();
    const language = useLanguage();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        router.replace(`/${language}/dashboard`);
      }
    }, [isAuthenticated, isLoading, router, language]);

    // Render only if not authenticated
    return !isAuthenticated ? <Component {...props} /> : null;
  };
}
