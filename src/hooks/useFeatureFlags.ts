import { useSearchParams } from "next/navigation";
import { gte } from "semver";

import { FEATURE_FLAGS } from "@/constants/featureFlags";

import packageFile from "../../package.json";

type FeatureFlag = {
  enabled: boolean;
  minVersion: string;
};

type FEATURE_FLAG_KEY = keyof typeof FEATURE_FLAGS;

type FeatureFlags = Record<FEATURE_FLAG_KEY, FeatureFlag>;

export const getFeatureFlags = (query: Record<string, string | string[] | undefined>) => {
  const flags: FeatureFlags = { ...FEATURE_FLAGS };

  const isFeatureEnabled = (featureName: FEATURE_FLAG_KEY): boolean => {
    const feature = flags[featureName];

    if (!feature) return false;

    // Prioritize URL flag override
    const urlFeatureValue = query[featureName]?.toString().toLowerCase();

    if (urlFeatureValue === "true") return true;
    if (urlFeatureValue === "false") return false;

    // Check feature flag configuration and package version
    return feature.enabled && gte(packageFile.version, feature.minVersion || "0.0.0");
  };

  return { isFeatureEnabled, flags };
};

export const useFeatureFlags = () => {
  const urlParams = useSearchParams();

  return getFeatureFlags(Object.fromEntries(urlParams.entries()));
};
