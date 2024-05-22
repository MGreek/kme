import type { StaffSystem } from "../model/staff-system";
import { requireNotNull } from "./require-not-null";

export function getStaffSystemAtIndex(
  staffSystem: StaffSystem,
  index: number,
): StaffSystem {
  const staffSystemClone = structuredClone(staffSystem);
  staffSystemClone.staves = staffSystem.staves.map((staff) => {
    const staffClone = structuredClone(staff);
    staffClone.measures = [
      structuredClone(requireNotNull(staff.measures.at(index))),
    ];
    return staffClone;
  });
  return staffSystemClone;
}
