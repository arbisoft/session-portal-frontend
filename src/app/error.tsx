"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <EmptyState
      heading="Something went wrong"
      text="An unexpected error occurred. You can try reloading the page or go back."
      ctas={[
        <Button key="back" variant="contained" onClick={() => router.back()}>
          Go back
        </Button>,
        <Button key="reload" variant="contained" color="primary" onClick={reset}>
          Reload
        </Button>,
      ]}
    />
  );
}
