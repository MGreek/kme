import type { Grouping } from "./grouping";
import type { MeasureId } from "./measure";

export interface VoiceId {
  measureId: MeasureId;
  voicesOrder: number;
}

export interface Voice {
  voiceId: VoiceId;
  metadataJson: string;
  groupings: Grouping[];
}
