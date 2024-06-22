import type { Grouping } from "../model/grouping";
import type { Measure } from "../model/measure";
import type { Note } from "../model/note";
import type { Rest } from "../model/rest";
import type { Staff } from "../model/staff";
import { ConnectorType, type StaffSystem } from "../model/staff-system";
import { getStaffSystemMeasureCount } from "./misc";

export const DEFAULT_STAFF_SYSTEM_GAP = 12;

export function parseStaffSystemMetadata(staffSystem: StaffSystem): {
  connectorType: ConnectorType;
  gap: number;
  rowLengths: number[];
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

  let gap = DEFAULT_STAFF_SYSTEM_GAP;
  if (
    object != null &&
    "gap" in object &&
    typeof object.gap === "number" &&
    object.gap >= 0
  ) {
    gap = object.gap;
  }

  let rowLengths = null;
  if (
    object != null &&
    "rowLengths" in object &&
    typeof Array.isArray(object.rowLengths)
  ) {
    rowLengths = object.rowLengths;
  } else {
    const baseLength = 3;
    rowLengths = [];
    const measureCount = getStaffSystemMeasureCount(staffSystem);
    for (let index = 0; index < measureCount; index += baseLength) {
      rowLengths.push(Math.min(baseLength, measureCount - index));
    }
  }

  return { connectorType, gap, rowLengths };
}

export function parseStaffMetadata(staff: Staff): {
  width: number;
} {
  let object = null;
  try {
    object = JSON.parse(staff.metadataJson);
  } catch (error) {}

  let width = 300;
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

export function parseGroupingMetadata(grouping: Grouping): {
  stemUp: boolean;
} {
  let object = null;
  try {
    object = JSON.parse(grouping.metadataJson);
  } catch (error) {}

  let stemUp = grouping.groupingId.voiceId.voicesOrder % 2 === 0;
  if (
    object != null &&
    "stemUp" in object &&
    typeof object.stemUp === "boolean"
  ) {
    stemUp = object.stemUp;
  }

  return { stemUp };
}

export function parseNoteMetadata(note: Note): {
  highlight: boolean;
  alpha: string;
} {
  let object = null;
  try {
    object = JSON.parse(note.metadataJson);
  } catch (error) {}

  let highlight = false;
  if (
    object != null &&
    "highlight" in object &&
    typeof object.highlight === "boolean"
  ) {
    highlight = object.highlight;
  }

  const hexRegex = /^[0-9a-fA-F]{2}$/;
  let alpha = "ff";
  if (
    object != null &&
    "alpha" in object &&
    typeof object.alpha === "string" &&
    hexRegex.test(object.alpha)
  ) {
    alpha = object.alpha.toLowerCase();
  }

  return { highlight, alpha };
}

export function parseRestMetadata(rest: Rest): {
  highlight: boolean;
  alpha: string;
} {
  let object = null;
  try {
    object = JSON.parse(rest.metadataJson);
  } catch (error) {}

  let highlight = false;
  if (
    object != null &&
    "highlight" in object &&
    typeof object.highlight === "boolean"
  ) {
    highlight = object.highlight;
  }

  const hexRegex = /^[0-9a-fA-F]{2}$/;
  let alpha = "ff";
  if (
    object != null &&
    "alpha" in object &&
    typeof object.alpha === "string" &&
    hexRegex.test(object.alpha)
  ) {
    alpha = object.alpha.toLowerCase();
  }

  return { highlight, alpha };
}
