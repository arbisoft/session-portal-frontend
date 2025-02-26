import { useEffect } from "react";

import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import { selectAccessToken } from "@/redux/login/selectors";
import useLanguage from "@/services/i18n/use-language";

import useNavigation from "./useNavigation";

const useAuth = () => {
  const language = useLanguage();
  const pathname = usePathname();
  const token = useSelector(selectAccessToken);
  const { navigateTo, getPageUrl } = useNavigation();

  useEffect(() => {
    const isRootOrLoginPage = getPageUrl("home").includes(pathname) || pathname === getPageUrl("login");

    if (token && isRootOrLoginPage) {
      navigateTo("videos");
    } else if (!token) {
      navigateTo("login");
    }
  }, [language, token, pathname]);
};

export default useAuth;
