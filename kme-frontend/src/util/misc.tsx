import deepEqual from "deep-equal";
import type { GroupingEntry, GroupingEntryId } from "../model/grouping-entry";
import type { Measure, MeasureId } from "../model/measure";
import type { StaffSystem } from "../model/staff-system";
import { parseRestMetadata } from "./metadata";
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

export function getMeasures(staffSystem: StaffSystem): Measure[] {
  const measures = staffSystem.staves.flatMap((staff) => staff.measures);
  return measures;
}

export function getGroupingEntries(staffSystem: StaffSystem): GroupingEntry[] {
  const groupingEntries = staffSystem.staves
    .flatMap((staff) => staff.measures)
    .flatMap((measure) => measure.voices)
    .flatMap((voice) => voice.groupings)
    .flatMap((grouping) => grouping.groupingEntries);
  return groupingEntries;
}

export function getNextMeasureId(
  staffSystem: StaffSystem,
  measureId: MeasureId,
): MeasureId | null {
  const findMeasureId = (id: MeasureId) => {
    return measures.some((ge) => deepEqual(ge.measureId, id));
  };

  const measures = getMeasures(staffSystem);

  if (!findMeasureId(measureId)) {
    throw new Error("measureId is invalid");
  }

  const newId: MeasureId = {
    staffId: measureId.staffId,
    measuresOrder: measureId.measuresOrder + 1,
  };

  if (!findMeasureId(newId)) {
    return null;
  }

  return newId;
}

export function getNextGroupingEntryId(
  staffSystem: StaffSystem,
  groupingEntryId: GroupingEntryId,
): GroupingEntryId | null {
  const findGroupingEntryId = (id: GroupingEntryId) => {
    return groupingEntries.some((ge) => deepEqual(ge.groupingEntryId, id));
  };

  const groupingEntries = getGroupingEntries(staffSystem);

  if (!findGroupingEntryId(groupingEntryId)) {
    throw new Error("groupingEntryId is invalid");
  }

  const newId1: GroupingEntryId = {
    groupingId: groupingEntryId.groupingId,
    groupingEntriesOrder: groupingEntryId.groupingEntriesOrder + 1,
  };
  if (findGroupingEntryId(newId1)) {
    return newId1;
  }
  const nextMeasureId = getNextMeasureId(
    staffSystem,
    groupingEntryId.groupingId.voiceId.measureId,
  );
  if (nextMeasureId == null) {
    return null;
  }
  const newId2 = structuredClone(newId1);
  newId2.groupingId.voiceId.measureId = nextMeasureId;
  if (findGroupingEntryId(newId2)) {
    return newId2;
  }

  return null;
}

export function getGroupingEntryById(
  staffSystem: StaffSystem,
  groupingEntryId: GroupingEntryId,
): GroupingEntry {
  const groupingEntries = getGroupingEntries(staffSystem);
  return requireNotNull(
    groupingEntries
      .filter((ge) => deepEqual(ge.groupingEntryId, groupingEntryId))
      .at(0),
    "groupingEntryId is invalid",
  );
}

export function setRestHighlight(
  highlight: boolean,
  staffSystem: StaffSystem,
  groupingEntryId: GroupingEntryId,
) {
  const groupingEntry = getGroupingEntryById(staffSystem, groupingEntryId);
  if (groupingEntry.rest == null) {
    throw new Error("groupingEntry doesn't contain a rest");
  }
  const restMetadata = parseRestMetadata(groupingEntry.rest);
  restMetadata.highlight = highlight;
  groupingEntry.rest.metadataJson = JSON.stringify(restMetadata);
}
