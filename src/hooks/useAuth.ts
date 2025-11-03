"use client";

import { useEffect } from "react";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

import { selectAccessToken } from "@/redux/login/selectors";
import { getQueryValue } from "@/utils/utils";

import useNavigation from "./useNavigation";

const useAuth = () => {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = useSelector(selectAccessToken);
  const { navigateTo, getPageUrl } = useNavigation();

  const videoSlug = getQueryValue(params?.videoId);
  const redirectTo = searchParams.get("redirect_to");

  useEffect(() => {
    const isRootOrLoginPage = pathname === getPageUrl("home") || pathname === getPageUrl("login");

    // 1: User is logged in & has redirect target
    if (token && redirectTo) {
      navigateTo("videoDetail", { id: redirectTo });
      return;
    }

    // 2: Logged in and currently on home or login → go to videos
    if (token && isRootOrLoginPage) {
      navigateTo("videos");
      return;
    }

    // 3: Not logged in → redirect to login, keep redirect info
    if (!token) {
      const redirectParam = videoSlug || redirectTo;
      if (redirectParam) {
        navigateTo("login", { redirect_to: redirectParam });
      } else {
        navigateTo("login");
      }
      return;
    }
  }, [token, pathname, redirectTo, videoSlug]);
};

export default useAuth;
