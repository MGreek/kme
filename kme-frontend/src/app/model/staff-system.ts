import { Staff } from "./staff";

export interface StaffSystem {
  id: string,
  metadata: string | null,
  staves: Staff[],
}
