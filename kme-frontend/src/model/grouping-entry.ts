import type { Chord } from "./chord";
import type { GroupingId } from "./grouping";
import type { Rest } from "./rest";

export interface GroupingEntryId {
  groupingId: GroupingId;
  groupingEntriesOrder: number;
}

export interface GroupingEntry {
  groupingEntryId: GroupingEntryId;
  chord: Chord | null;
  rest: Rest | null;
}
