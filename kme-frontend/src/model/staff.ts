import type { Measure } from "./measure";

export interface Staff {
  metadata: string | null;
  measures: Measure[];
}
