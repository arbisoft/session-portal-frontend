import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

const SearchResultsPage = dynamic(() => import("@/features/SearchResultsPage"));

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getSearchTerm = async (searchParams: Props["searchParams"]) => {
  const { search } = await searchParams;
  return (Array.isArray(search) ? search[0] : search)?.trim();
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const searchTerm = await getSearchTerm(searchParams);

  const title = "Sessions Portal";

  return {
    title: searchTerm ? `${searchTerm} - ${title}` : title,
  };
}

export default async function Results({ searchParams }: Readonly<Props>) {
  const searchTerm = await getSearchTerm(searchParams);

  // An empty or whitespace-only term (shared link, edited URL, Back after clearing) has nothing to search for.
  if (!searchTerm) redirect("/videos");

  return <SearchResultsPage />;
}
