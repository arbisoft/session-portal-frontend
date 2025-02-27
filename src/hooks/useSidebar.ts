import { useEventTagsQuery } from "@/redux/events/apiSlice";

const defaultTag = { id: 0, name: "All" };

const useSidebar = () => {
  const { data: tags, isFetching, isLoading, isUninitialized } = useEventTagsQuery();
  const isDataLoading = isFetching || isLoading || isUninitialized;

  const sidebarItems = tags?.length ? [defaultTag, ...tags] : [];

  return { sidebarItems, isDataLoading };
};
export default useSidebar;
