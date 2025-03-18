import { useEventTagsQuery } from "@/redux/events/apiSlice";

const useSidebar = () => {
  const { data: tags = [], isFetching, isLoading, isUninitialized } = useEventTagsQuery();
  const isDataLoading = isFetching || isLoading || isUninitialized;

  return { sidebarItems: tags, isDataLoading };
};
export default useSidebar;
