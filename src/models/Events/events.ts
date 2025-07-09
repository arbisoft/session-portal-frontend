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

export interface Playlist extends Tag {}

export interface Event {
  description: string;
  event_time: string;
  event_type: string;
  id: number;
  is_featured: boolean;
  playlists: string[];
  presenters: Presenter[];
  publisher: Publisher;
  status: string;
  tags: string[];
  thumbnail: string;
  title: string;
  video_duration: number;
  workstream_id: string;
  video_file: string;
  slug: string;
}

interface Publisher {
  first_name: string;
  id: number;
  last_name: string;
}

interface Presenter extends Publisher {
  email: string;
}

export interface AllEventResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

export type OrderingField =
  | "-event_time"
  | "-event_type"
  | "-is_featured"
  | "-status"
  | "event_time"
  | "event_type"
  | "is_featured"
  | "status";

export type EventsParams = {
  event_time_after?: string;
  event_time_before?: string;
  event_type: "SESSION";
  is_featured?: boolean;
  ordering?: OrderingField[];
  page_size?: number;
  page: number;
  playlist?: string;
  search?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tag?: string;
  linked_to_events?: "True" | "False";
};

export interface Recommendation extends AllEventResponse {}

export type RecommendationParam = {
  id: string;
  page: number;
  page_size?: number;
};
