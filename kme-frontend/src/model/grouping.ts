import type { GroupingEntry } from "./grouping-entry";
import type { VoiceId } from "./voice";

export interface GroupingId {
  voiceId: VoiceId;
  groupingsOrder: number;
}

export interface Grouping {
  groupingId: GroupingId;
  metadataJson: string;
  groupingEntries: GroupingEntry[];
}
