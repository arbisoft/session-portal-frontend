export type VideoCardProps = {
  className?: string;
  data: {
    event_time: string;
    organizer: string;
    thumbnail: string;
    title: string;
    video_duration: string;
    description?: string;
    video_file?: string;
  };
  onClick?: VoidFunction;
  variant?: "featured-card" | "search-card" | "related-card" | "normal-card";
  width?: string;
};
