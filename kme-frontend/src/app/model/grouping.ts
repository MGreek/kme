import { GroupingEntry } from "./grouping-entry";

export interface Grouping {
  groupingsOrder: number,
  metadata: string | null,
  groupingEntries: GroupingEntry[],
}
