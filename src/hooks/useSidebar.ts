import { useEventTagsQuery, usePlaylistsQuery } from "@/redux/events/apiSlice";

const useSidebar = () => {
  const {
    data: tags = [],
    isFetching: isTagsFetching,
    isLoading: isTagsLoading,
    isUninitialized: isTagsUninitialized,
  } = useEventTagsQuery();

  const {
    data: playlists = [],
    isFetching: isPlaylistsFetching,
    isLoading: isPlaylistsLoading,
    isUninitialized: isPlaylistsUninitialized,
  } = usePlaylistsQuery();

  const areTagsLoading = isTagsFetching || isTagsLoading || isTagsUninitialized;
  const arePlaylistsLoading = isPlaylistsFetching || isPlaylistsLoading || isPlaylistsUninitialized;

  return { tags, areTagsLoading, arePlaylistsLoading, playlists };
};
export default useSidebar;
