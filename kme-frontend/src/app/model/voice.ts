import { Grouping } from "./grouping";

export interface Voice {
  voicesOrder: number,
  metadata: string | null,
  groupings: Grouping[],
}
