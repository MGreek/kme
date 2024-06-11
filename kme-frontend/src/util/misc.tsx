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

export function equalMeasureIds(
  firstId: MeasureId,
  secondId: MeasureId,
): boolean {
  return (
    firstId.staffId.staffSystemId.staffSystemId ===
    secondId.staffId.staffSystemId.staffSystemId &&
    firstId.staffId.stavesOrder === secondId.staffId.stavesOrder &&
    firstId.measuresOrder === secondId.measuresOrder
  );
}

export function getMeasureById(
  staffSystem: StaffSystem,
  measureId: MeasureId,
): Measure | null {
  const measures = getMeasures(staffSystem);
  return (
    measures.filter((m) => equalMeasureIds(m.measureId, measureId)).at(0) ??
    null
  );
}

export function getGroupingEntries(staffSystem: StaffSystem): GroupingEntry[] {
  const groupingEntries = staffSystem.staves
    .flatMap((staff) => staff.measures)
    .flatMap((measure) => measure.voices)
    .flatMap((voice) => voice.groupings)
    .flatMap((grouping) => grouping.groupingEntries);
  return groupingEntries;
}

export function equalGroupingEntryIds(
  firstId: GroupingEntryId,
  secondId: GroupingEntryId,
): boolean {
  // PERF: don't use deepCopy because it's too slow!!!
  return (
    firstId.groupingId.voiceId.measureId.staffId.staffSystemId.staffSystemId ===
    secondId.groupingId.voiceId.measureId.staffId.staffSystemId
      .staffSystemId &&
    firstId.groupingId.voiceId.measureId.staffId.stavesOrder ===
    secondId.groupingId.voiceId.measureId.staffId.stavesOrder &&
    firstId.groupingId.voiceId.measureId.measuresOrder ===
    secondId.groupingId.voiceId.measureId.measuresOrder &&
    firstId.groupingId.voiceId.voicesOrder ===
    secondId.groupingId.voiceId.voicesOrder &&
    firstId.groupingId.groupingsOrder === secondId.groupingId.groupingsOrder &&
    firstId.groupingEntriesOrder === secondId.groupingEntriesOrder
  );
}

export function getGroupingEntryById(
  staffSystem: StaffSystem,
  groupingEntryId: GroupingEntryId,
): GroupingEntry | null {
  const groupingEntries = getGroupingEntries(staffSystem);
  return (
    groupingEntries
      .filter((ge) =>
        equalGroupingEntryIds(ge.groupingEntryId, groupingEntryId),
      )
      .at(0) ?? null
  );
}

export function setRestHighlight(
  highlight: boolean,
  staffSystem: StaffSystem,
  groupingEntryId: GroupingEntryId,
) {
  const groupingEntry = requireNotNull(
    getGroupingEntryById(staffSystem, groupingEntryId),
    "groupingEntryId invalid",
  );
  if (groupingEntry.rest == null) {
    throw new Error("groupingEntry doesn't contain a rest");
  }
  const restMetadata = parseRestMetadata(groupingEntry.rest);
  restMetadata.highlight = highlight;
  groupingEntry.rest.metadataJson = JSON.stringify(restMetadata);
}
