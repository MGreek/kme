import type { GroupingEntryId } from "./grouping-entry";
import type { Note } from "./note";
import type { Stem } from "./stem";

export interface ChordId {
  groupingEntryId: GroupingEntryId;
}

export interface Chord {
  chordId: ChordId;
  stem: Stem;
  dotCount: number;
  metadataJson: string;
  notes: Note[];
}
