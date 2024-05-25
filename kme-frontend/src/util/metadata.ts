import type { Measure } from "../model/measure";
import type { Staff } from "../model/staff";
import { ConnectorType, type StaffSystem } from "../model/staff-system";

export function parseStaffSystemMetadata(staffSystem: StaffSystem): {
  connectorType: ConnectorType;
  gap: number;
} {
  let object = null;
  try {
    object = JSON.parse(staffSystem.metadataJson);
  } catch {}

  let connectorType = ConnectorType.None;
  if (
    object != null &&
    "connectorType" in object &&
    typeof object.connectorType === "string" &&
    Object.values(ConnectorType).includes(connectorType)
  ) {
    connectorType = object.connectorType;
  }

  let gap = 20;
  if (
    object != null &&
    "gap" in object &&
    typeof object.gap === "number" &&
    object.gap >= 0
  ) {
    gap = object.gap;
  }

  return { connectorType, gap };
}

export function parseStaffMetadata(staff: Staff): {
  width: number;
} {
  let object = null;
  try {
    object = JSON.parse(staff.metadataJson);
  } catch (error) {}

  let width = 350;
  if (object != null && "width" in object && typeof object.width === "number") {
    width = object.width;
  }
  return { width };
}

export function parseMeasureMetadata(measure: Measure): {
  drawClef: boolean;
  drawKeySignature: boolean;
  drawTimeSignature: boolean;
} {
  let object = null;
  try {
    object = JSON.parse(measure.metadataJson);
  } catch (error) {}

  let drawClef = false;
  if (
    object != null &&
    "drawClef" in object &&
    typeof object.drawClef === "boolean"
  ) {
    drawClef = object.drawClef;
  }

  let drawKeySignature = false;
  if (
    object != null &&
    "drawKeySignature" in object &&
    typeof object.drawClef === "boolean"
  ) {
    drawKeySignature = object.drawKeySignature;
  }

  let drawTimeSignature = false;
  if (
    object != null &&
    "drawTimeSignature" in object &&
    typeof object.drawClef === "boolean"
  ) {
    drawTimeSignature = object.drawTimeSignature;
  }

  return { drawClef, drawKeySignature, drawTimeSignature };
}
