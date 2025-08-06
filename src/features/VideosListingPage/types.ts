import { EventsParams } from "@/models/Events";

export const defaultTag = {
  id: 0,
  name: "All videos",
};

export const defaultParams: EventsParams = {
  event_type: "SESSION" as const,
  page: 1,
  status: "PUBLISHED",
  linked_to_events: "True",
};

type Publisher = {
  first_name: string;
  id: number;
  last_name: string;
};

export type TVideo = {
  description: string;
  event_time: string;
  event_type: string;
  id: number;
  is_featured: boolean;
  publisher: Publisher;
  status: string;
  tags: string[];
  thumbnail: string;
  title: string;
  workstream_id: string;
};

export interface ISearchEventDetail {
  searchQuery: string;
}

export type SkeletonLoaderProps = {
  count?: number;
};
