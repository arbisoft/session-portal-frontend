export interface EventDetail {
  duration: number;
  event: Event;
  file_size: number;
  status: string;
  thumbnail: string;
  title: string;
  video_file: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Event {
  description: string;
  event_time: string;
  event_type: string;
  id: number;
  video_duration: number;
  is_featured: boolean;
  publisher: Publisher;
  status: string;
  tags: string[];
  thumbnail: string;
  title: string;
  workstream_id: string;
}

interface Publisher {
  first_name: string;
  id: number;
  last_name: string;
}

export interface AllEventResponse {
  count: number;
  next: number | null;
  previous: number | null;
  results: Event[];
}

export type TAllEventsPyaload = {
  event_type: string;
  is_featured?: boolean;
  page: number;
  status: string;
  search?: string;
  tag?: string;
};
