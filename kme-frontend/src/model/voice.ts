import type { Grouping } from "./grouping";

export interface Voice {
  metadata: string | null;
  groupings: Grouping[];
}
