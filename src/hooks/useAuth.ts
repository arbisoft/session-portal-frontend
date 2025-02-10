import { useEffect } from "react";

import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import { selectAccessToken } from "@/redux/login/selectors";
import useLanguage from "@/services/i18n/use-language";

const useAuth = () => {
  const language = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const token = useSelector(selectAccessToken);

  useEffect(() => {
    const isRootOrLoginPage = pathname === `/${language}` || pathname === `/${language}/login`;

    if (token && isRootOrLoginPage) {
      router.push(`/${language}/videos`);
    } else if (!token) {
      router.push(`/${language}/login`);
    }
  }, [router, language, token, pathname]);
};

export default useAuth;
