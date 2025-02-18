export type VideoCardProps = {
  className?: string;
  id: number;
  title: string;
  description: string;
  publisher: TPublisher;
  event_time: string;
  event_type: string;
  status: string;
  workstream_id: string;
  is_featured: boolean;
  tags: string[];
  thumbnail: string;
  width?: string;
};

interface TPublisher {
  id: number;
  first_name: string;
  last_name: string;
}
