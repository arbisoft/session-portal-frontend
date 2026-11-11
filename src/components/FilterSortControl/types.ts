import { FilterSortMenuProps } from "@/components/FilterSortMenu";

export type FilterSortControlProps = Pick<
  FilterSortMenuProps,
  "availableYears" | "onClear" | "onSortChange" | "onYearChange" | "sort" | "year"
>;
