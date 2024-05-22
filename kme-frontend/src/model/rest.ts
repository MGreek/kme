import type { GroupingEntryId } from "./grouping-entry";

export enum RestType {
  Whole = "Whole",
  Half = "Half",
  Quarter = "Quarter",
  Eight = "Eight",
  Sixteenth = "Sixteenth",
  Thirtysecond = "Thirtysecond",
  Sixtyfourth = "Sixtyfourth",
}

export interface RestId {
  groupingEntryId: GroupingEntryId;
}

export interface Rest {
  restId: RestId;
  restType: RestType;
  position: number;
  metadataJson: string;
}
