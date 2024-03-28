import { Measure } from "./measure";

export interface Staff {
  stavesOrder: number,
  metadata: string | null,
  measures: Measure[],
}
