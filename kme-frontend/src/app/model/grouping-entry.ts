import { Chord } from "./chord";
import { Rest } from "./rest";

export interface GroupingEntry {
  groupingEntriesOrder: number,
  chord: Chord | null,
  rest: Rest | null,
}
