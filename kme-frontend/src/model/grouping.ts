import type { GroupingEntry } from "./grouping-entry";

export interface Grouping {
  metadata: string | null;
  groupingEntries: GroupingEntry[];
}
