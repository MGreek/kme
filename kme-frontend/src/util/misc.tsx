import type { StaffSystem } from "../model/staff-system";
import { requireNotNull } from "./require-not-null";

export function getStaffSystemMeasureCount(staffSystem: StaffSystem) {
  if (staffSystem.staves.length === 0) {
    return 0;
  }

  const measureCount = requireNotNull(staffSystem.staves[0]).measures.length;

  if (
    staffSystem.staves.some((staff) => staff.measures.length !== measureCount)
  ) {
    throw new Error("All staves must have the same number of measures");
  }

  return measureCount;
}
