export type VideoCardProps = {
  className?: string;
  data: {
    event_time: string;
    organizer: string;
    thumbnail: string;
    title: string;
    video_duration: string;
  };
  onClick?: VoidFunction;
  width?: string;
};
