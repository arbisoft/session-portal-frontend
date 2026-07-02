"use client";

import Link from "next/link";

import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      heading="Page not found"
      text="The page you're looking for doesn't exist or has been moved."
      ctas={[
        <Button key="back" color="secondary" variant="contained" component={Link} href="/videos">
          Go back
        </Button>,
      ]}
    />
  );
}
