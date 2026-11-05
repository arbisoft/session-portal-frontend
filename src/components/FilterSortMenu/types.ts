import { SortOption } from "@/models/Events";

export interface YearOption {
  label: string;
  value: string;
}

export interface FilterSortMenuProps {
  anchorEl: HTMLElement | null;
  availableYears: YearOption[];
  id?: string;
  labelledBy?: string;
  onClear: VoidFunction;
  onClose: VoidFunction;
  onSortChange: (sort: SortOption) => void;
  onYearChange: (year: string) => void;
  sort: SortOption;
  year?: string;
}
