import type { Measure } from "./measure";
import type { StaffSystemId } from "./staff-system";

export interface StaffId {
  staffSystemId: StaffSystemId;
  stavesOrder: number;
}

export interface Staff {
  staffId: StaffId;
  metadataJson: string;
  measures: Measure[];
}
