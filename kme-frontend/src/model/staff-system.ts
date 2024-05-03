import type { Staff } from "./staff";

export enum ConnectorType {
  None = "None",
  Brace = "Brace",
  Bracket = "Bracket",
}

export interface StaffSystemMetadata {
  connectorType: ConnectorType;
}

export interface StaffSystem {
  id: string;
  metadata: StaffSystemMetadata;
  staves: Staff[];
}
