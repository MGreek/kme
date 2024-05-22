import type { Staff } from "./staff";

export enum ConnectorType {
  None = "None",
  Brace = "Brace",
  Bracket = "Bracket",
}

export interface StaffSystemId {
  staffSystemId: string;
}

export interface StaffSystem {
  staffSystemId: StaffSystemId;
  metadataJson: string;
  staves: Staff[];
}
