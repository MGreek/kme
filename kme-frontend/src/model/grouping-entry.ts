import type { Chord } from "./chord";
import type { Rest } from "./rest";

export interface GroupingEntry {
  chord: Chord | null;
  rest: Rest | null;
}
