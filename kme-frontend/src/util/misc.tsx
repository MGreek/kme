import { v4 as uuidv4 } from "uuid";
import type { Chord, ChordId } from "../model/chord";
import type { Grouping, GroupingId } from "../model/grouping";
import type { GroupingEntry, GroupingEntryId } from "../model/grouping-entry";
import {
  Clef,
  KeySignature,
  type Measure,
  type MeasureId,
  TimeSignature,
} from "../model/measure";
import type { Note, NoteId } from "../model/note";
import { type Rest, RestType, type RestId } from "../model/rest";
import type { Staff, StaffId } from "../model/staff";
import type { StaffSystem, StaffSystemId } from "../model/staff-system";
import { StemType } from "../model/stem";
import type { Voice, VoiceId } from "../model/voice";
import { parseRestMetadata, parseStaffSystemMetadata } from "./metadata";
import { requireNotNull } from "./require-not-null";

// NOTE: `syncIds` after this since the id will be a placeholder
function getWholeNoteRestInGrouping(
  groupingId: GroupingId,
  position: number,
): Grouping {
  const groupingEntryId = { groupingId, groupingEntriesOrder: 0 };
  const newGrouping: Grouping = {
    groupingId,
    metadataJson: "",
    groupingEntries: [
      {
        groupingEntryId,
        chord: null,
        rest: {
          restId: { groupingEntryId },
          restType: RestType.Whole,
          position,
          metadataJson: "",
        },
      },
    ],
  };
  return newGrouping;
}

// NOTE: `syncIds` after this since the id will be a placeholder
function getWholeNoteRestInVoice(
  voiceId: VoiceId,
  restPosition: number,
): Voice {
  const newVoice: Voice = {
    voiceId,
    metadataJson: "",
    groupings: [
      getWholeNoteRestInGrouping({ voiceId, groupingsOrder: 0 }, restPosition),
    ],
  };
  return newVoice;
}

// NOTE: `syncIds` after this since the id will be a placeholder
export function getWholeRestMeasure(
  template: Measure | null,
  staffId: StaffId,
): Measure {
  const measureId = {
    staffId,
    measuresOrder: 0,
  };
  const clef = template?.clef ?? Clef.Treble;
  let restPosition = null;
  switch (clef) {
    case Clef.Treble:
      restPosition = 8;
      break;
    case Clef.Alto:
    case Clef.Bass:
      restPosition = -6;
      break;
    default:
      throw new Error("Unknown clef");
  }
  const newMeasure: Measure = {
    measureId,
    metadataJson: "",
    keySignature: template?.keySignature ?? KeySignature.None,
    timeSignature: template?.timeSignature ?? TimeSignature.FourFour,
    clef,
    voices: [
      getWholeNoteRestInVoice(
        {
          measureId,
          voicesOrder: 0,
        },
        restPosition,
      ),
    ],
  };
  return newMeasure;
}

export function getDurationFromStemType(stemType: StemType) {
  switch (stemType) {
    case StemType.Whole:
      return 1;
    case StemType.Half:
      return 1 / 2;
    case StemType.Quarter:
      return 1 / 4;
    case StemType.Eight:
      return 1 / 8;
    case StemType.Sixteenth:
      return 1 / 16;
    case StemType.Thirtysecond:
      return 1 / 32;
    case StemType.Sixtyfourth:
      return 1 / 64;
    default:
      throw new Error("Unknown stem type");
  }
}

export function getGroupingEntryDurationShift(
  staffSystem: StaffSystem,
  groupingEntry: GroupingEntry,
) {
  const voice = requireNotNull(
    getVoiceById(staffSystem, groupingEntry.groupingEntryId.groupingId.voiceId),
  );
  let total = 0;
  for (const otherEntry of voice.groupings.flatMap(
    (grouping) => grouping.groupingEntries,
  )) {
    if (
      equalGroupingEntryIds(
        otherEntry.groupingEntryId,
        groupingEntry.groupingEntryId,
      )
    ) {
      break;
    }
    if (otherEntry.rest != null) {
      total += getDurationFromStemType(
        restTypeToStemType(otherEntry.rest.restType),
      );
    } else {
      const chord = requireNotNull(otherEntry.chord);
      total += getDurationFromStemType(chord.stem.stemType);
    }
  }
  return total;
}

export function getGroupingEntryByDurationShift(
  voice: Voice,
  durationShift: number,
) {
  let total = 0;
  const groupingEntries = voice.groupings.flatMap(
    (grouping) => grouping.groupingEntries,
  );
  for (const [index, groupingEntry] of groupingEntries.entries()) {
    const previousEntry = index === 0 ? null : groupingEntries.at(index - 1);
    if (total > durationShift) {
      return previousEntry ?? groupingEntry;
    }
    if (groupingEntry.rest != null) {
      total += getDurationFromStemType(
        restTypeToStemType(groupingEntry.rest.restType),
      );
    } else {
      const chord = requireNotNull(groupingEntry.chord);
      total += getDurationFromStemType(chord.stem.stemType);
    }
  }
  return requireNotNull(groupingEntries.at(-1), "Found an empty voice");
}

export function getNewStaffSystem(): StaffSystem {
  const staffSystemId: StaffSystemId = { staffSystemId: uuidv4() };
  const staffId: StaffId = {
    staffSystemId: staffSystemId,
    stavesOrder: 0,
  };
  const measure = getWholeRestMeasure(null, staffId);
  const staff: Staff = {
    staffId,
    metadataJson: "",
    measures: [measure],
  };
  const staffSystem: StaffSystem = {
    staffSystemId,
    metadataJson: "",
    staves: [staff],
  };
  syncIds(staffSystem);
  return staffSystem;
}

export function insertEmptyMeasure(staffSystem: StaffSystem, index: number) {
  // NOTE: fetch metadata before doing operations because they might
  // affect for example rowLengths or other fields in metadata
  const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);
  for (const staff of staffSystem.staves) {
    const previousMeasure = staff.measures.at(index - 1);
    const nextMeasure = staff.measures.at(index + 1);
    staff.measures.splice(
      index,
      0,
      getWholeRestMeasure(
        previousMeasure ?? nextMeasure ?? null,
        staff.staffId,
      ),
    );
  }
  // FIX: the lenght of the row where the measure was inserted should be updated
  // a new row must not be always created like this `push` does.
  staffSystemMetadata.rowLengths.push(1);
  staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
  syncIds(staffSystem);
}

export function appendVoice(measure: Measure) {
  let restPosition = null;
  switch (measure.clef) {
    case Clef.Treble:
      restPosition = 8;
      break;
    case Clef.Alto:
    case Clef.Bass:
      restPosition = -6;
      break;
    default:
      throw new Error("Unknown clef");
  }
  const rest: Rest = {
    restId: {
      groupingEntryId: {
        groupingId: {
          voiceId: {
            measureId: measure.measureId,
            voicesOrder: measure.voices.length,
          },
          groupingsOrder: 0,
        },
        groupingEntriesOrder: 0,
      },
    },
    restType: RestType.Whole,
    position: restPosition,
    metadataJson: "",
  };
  const groupingEntry: GroupingEntry = {
    groupingEntryId: rest.restId.groupingEntryId,
    chord: null,
    rest,
  };
  const grouping: Grouping = {
    groupingId: groupingEntry.groupingEntryId.groupingId,
    metadataJson: "",
    groupingEntries: [groupingEntry],
  };
  const voice: Voice = {
    voiceId: grouping.groupingId.voiceId,
    metadataJson: "",
    groupings: [grouping],
  };
  measure.voices.push(voice);
}

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

export function getMeasureRowIndex(
  staffSystem: StaffSystem,
  measure: Measure,
): number {
  const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);
  let index = 0;
  for (const [
    rowIndex,
    rowLength,
  ] of staffSystemMetadata.rowLengths.entries()) {
    if (
      index <= measure.measureId.measuresOrder &&
      measure.measureId.measuresOrder < index + rowLength
    ) {
      return rowIndex;
    }
    index += rowLength;
  }
  throw new Error("Measure outside of rows");
}

export function pruneStaffSystem(staffSystem: StaffSystem) {
  const measures = staffSystem.staves.flatMap((staff) => staff.measures);
  const voices = measures.flatMap((measure) => measure.voices);
  const groupings = voices.flatMap((voice) => voice.groupings);
  for (const grouping of groupings) {
    grouping.groupingEntries = grouping.groupingEntries.filter(
      (groupingEntry) =>
        groupingEntry.rest != null ||
        (groupingEntry.chord != null && groupingEntry.chord.notes.length > 0),
    );
  }
  for (const voice of voices) {
    voice.groupings = voice.groupings.filter(
      (grouping) => grouping.groupingEntries.length > 0,
    );
  }
  for (const measure of measures) {
    measure.voices = measure.voices.filter(
      (voice) => voice.groupings.length > 0,
    );
  }
  for (const staff of staffSystem.staves) {
    staff.measures = staff.measures.filter(
      (measure) => measure.voices.length > 0,
    );
  }
  staffSystem.staves = staffSystem.staves.filter(
    (staff) => staff.measures.length > 0,
  );
  syncIds(staffSystem);
}

export function syncIds(staffSystem: StaffSystem) {
  for (const [index, staff] of staffSystem.staves.entries()) {
    staff.staffId.staffSystemId = staffSystem.staffSystemId;
    staff.staffId.stavesOrder = index;

    for (const [index, measure] of staff.measures.entries()) {
      measure.measureId.staffId = staff.staffId;
      measure.measureId.measuresOrder = index;

      for (const [index, voice] of measure.voices.entries()) {
        voice.voiceId.measureId = measure.measureId;
        voice.voiceId.voicesOrder = index;

        for (const [index, grouping] of voice.groupings.entries()) {
          grouping.groupingId.voiceId = voice.voiceId;
          grouping.groupingId.groupingsOrder = index;

          for (const [
            index,
            groupingEntry,
          ] of grouping.groupingEntries.entries()) {
            groupingEntry.groupingEntryId.groupingId = grouping.groupingId;
            groupingEntry.groupingEntryId.groupingEntriesOrder = index;

            if (groupingEntry.rest != null) {
              groupingEntry.rest.restId.groupingEntryId =
                groupingEntry.groupingEntryId;
            } else {
              const chord = requireNotNull(
                groupingEntry.chord,
                "Found empty groupingEntry",
              );
              chord.chordId.groupingEntryId = groupingEntry.groupingEntryId;

              for (const note of chord.notes) {
                note.noteId.chordId = chord.chordId;
              }
              chord.notes.sort((a, b) => a.noteId.position - b.noteId.position);
            }
          }
        }
      }
    }
  }
}

export function getMeasures(staffSystem: StaffSystem): Measure[] {
  const measures = staffSystem.staves.flatMap((staff) => staff.measures);
  return measures;
}

export function getStaves(staffSystem: StaffSystem): Staff[] {
  return staffSystem.staves;
}

export function getCursorChord(staffSystem: StaffSystem, cursor: Rest | Note) {
  if ("restId" in cursor) {
    return null;
  }
  const chordId = cursor.noteId.chordId;
  return requireNotNull(getChordById(staffSystem, chordId));
}

export function getCursorGroupingEntry(
  staffSystem: StaffSystem,
  cursor: Rest | Note,
) {
  let groupingEntryId = null;
  if ("restId" in cursor) {
    groupingEntryId = cursor.restId.groupingEntryId;
  } else {
    groupingEntryId = cursor.noteId.chordId.groupingEntryId;
  }
  return requireNotNull(getGroupingEntryById(staffSystem, groupingEntryId));
}

export function getCursorGrouping(
  staffSystem: StaffSystem,
  cursor: Rest | Note,
) {
  let groupingId = null;
  if ("restId" in cursor) {
    groupingId = cursor.restId.groupingEntryId.groupingId;
  } else {
    groupingId = cursor.noteId.chordId.groupingEntryId.groupingId;
  }
  return requireNotNull(getGroupingById(staffSystem, groupingId));
}

export function getCursorVoice(staffSystem: StaffSystem, cursor: Rest | Note) {
  let voiceId = null;
  if ("restId" in cursor) {
    voiceId = cursor.restId.groupingEntryId.groupingId.voiceId;
  } else {
    voiceId = cursor.noteId.chordId.groupingEntryId.groupingId.voiceId;
  }
  return requireNotNull(getVoiceById(staffSystem, voiceId));
}

export function getCursorMeasure(
  staffSystem: StaffSystem,
  cursor: Rest | Note,
) {
  let measureId = null;
  if ("restId" in cursor) {
    measureId = cursor.restId.groupingEntryId.groupingId.voiceId.measureId;
  } else {
    measureId =
      cursor.noteId.chordId.groupingEntryId.groupingId.voiceId.measureId;
  }
  return requireNotNull(getMeasureById(staffSystem, measureId));
}

export function getCursorStaff(staffSystem: StaffSystem, cursor: Rest | Note) {
  let staffId = null;
  if ("restId" in cursor) {
    staffId =
      cursor.restId.groupingEntryId.groupingId.voiceId.measureId.staffId;
  } else {
    staffId =
      cursor.noteId.chordId.groupingEntryId.groupingId.voiceId.measureId
        .staffId;
  }
  return requireNotNull(getStaffById(staffSystem, staffId));
}

export function getCursorFromGroupingEntry(
  groupingEntry: GroupingEntry,
): Rest | Note {
  return groupingEntry.rest ?? requireNotNull(groupingEntry.chord?.notes.at(0));
}

export function getPreviousCursor(
  staffSystem: StaffSystem,
  cursor: Rest | Note,
): Rest | Note | null {
  const groupingEntry = getCursorGroupingEntry(staffSystem, cursor);
  {
    const nextGroupingEntryId = structuredClone(groupingEntry.groupingEntryId);
    nextGroupingEntryId.groupingEntriesOrder -= 1;
    const nextGroupingEntry = getGroupingEntryById(
      staffSystem,
      nextGroupingEntryId,
    );
    if (nextGroupingEntry != null) {
      return getCursorFromGroupingEntry(nextGroupingEntry);
    }
  }
  {
    const nextGroupingId = structuredClone(
      groupingEntry.groupingEntryId.groupingId,
    );
    nextGroupingId.groupingsOrder -= 1;
    const nextGrouping = getGroupingById(staffSystem, nextGroupingId);
    if (nextGrouping != null) {
      const nextGroupingEntry = requireNotNull(
        nextGrouping.groupingEntries.at(-1),
      );
      return getCursorFromGroupingEntry(nextGroupingEntry);
    }
  }
  {
    const nextMeasureId = structuredClone(
      groupingEntry.groupingEntryId.groupingId.voiceId.measureId,
    );
    nextMeasureId.measuresOrder -= 1;
    const nextMeasure = getMeasureById(staffSystem, nextMeasureId);
    if (nextMeasure != null) {
      const nextVoice =
        nextMeasure.voices.at(
          groupingEntry.groupingEntryId.groupingId.voiceId.voicesOrder,
        ) ?? requireNotNull(nextMeasure.voices.at(-1));
      const nextGroupingEntry = requireNotNull(
        nextVoice.groupings.at(-1)?.groupingEntries.at(-1),
      );
      return getCursorFromGroupingEntry(nextGroupingEntry);
    }
  }
  return null;
}

export function getNextCursor(
  staffSystem: StaffSystem,
  cursor: Rest | Note,
): Rest | Note | null {
  const groupingEntry = getCursorGroupingEntry(staffSystem, cursor);
  {
    const nextGroupingEntryId = structuredClone(groupingEntry.groupingEntryId);
    nextGroupingEntryId.groupingEntriesOrder += 1;
    const nextGroupingEntry = getGroupingEntryById(
      staffSystem,
      nextGroupingEntryId,
    );
    if (nextGroupingEntry != null) {
      return getCursorFromGroupingEntry(nextGroupingEntry);
    }
  }
  {
    const nextGroupingId = structuredClone(
      groupingEntry.groupingEntryId.groupingId,
    );
    nextGroupingId.groupingsOrder += 1;
    const nextGrouping = getGroupingById(staffSystem, nextGroupingId);
    if (nextGrouping != null) {
      const nextGroupingEntry = requireNotNull(
        nextGrouping.groupingEntries.at(0),
      );
      return getCursorFromGroupingEntry(nextGroupingEntry);
    }
  }
  {
    const nextMeasureId = structuredClone(
      groupingEntry.groupingEntryId.groupingId.voiceId.measureId,
    );
    nextMeasureId.measuresOrder += 1;
    const nextMeasure = getMeasureById(staffSystem, nextMeasureId);
    if (nextMeasure != null) {
      const nextVoice =
        nextMeasure.voices.at(
          groupingEntry.groupingEntryId.groupingId.voiceId.voicesOrder,
        ) ?? requireNotNull(nextMeasure.voices.at(-1));
      const nextGroupingEntry = requireNotNull(
        nextVoice.groupings.at(0)?.groupingEntries.at(0),
      );
      return getCursorFromGroupingEntry(nextGroupingEntry);
    }
  }
  return null;
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

export function equalStaffIds(firstId: StaffId, secondId: StaffId): boolean {
  return (
    firstId.staffSystemId.staffSystemId ===
      secondId.staffSystemId.staffSystemId &&
    firstId.stavesOrder === secondId.stavesOrder
  );
}

export function getChords(staffSystem: StaffSystem): Chord[] {
  const chords = staffSystem.staves
    .flatMap((staff) => staff.measures)
    .flatMap((measure) => measure.voices)
    .flatMap((voice) => voice.groupings)
    .flatMap((grouping) => grouping.groupingEntries)
    .filter((groupingEntry) => groupingEntry.chord != null)
    .map((groupingEntry) => requireNotNull(groupingEntry.chord));
  return chords;
}

export function getRests(staffSystem: StaffSystem): Rest[] {
  return getGroupingEntries(staffSystem)
    .filter((groupingEntry) => groupingEntry.rest != null)
    .map((groupingEntry) => requireNotNull(groupingEntry.rest));
}

export function getNotes(staffSystem: StaffSystem): Note[] {
  return getChords(staffSystem).flatMap((chord) => chord.notes);
}

export function equalRestIds(firstId: RestId, secondId: RestId) {
  return equalGroupingEntryIds(
    firstId.groupingEntryId,
    secondId.groupingEntryId,
  );
}

export function equalNoteIds(firstId: NoteId, secondId: NoteId) {
  return (
    equalChordIds(firstId.chordId, secondId.chordId) &&
    firstId.position === secondId.position
  );
}

export function equalChordIds(firstId: ChordId, secondId: ChordId) {
  return equalGroupingEntryIds(
    firstId.groupingEntryId,
    secondId.groupingEntryId,
  );
}

export function getRestById(
  staffSystem: StaffSystem,
  restId: RestId,
): Rest | null {
  const rests = getRests(staffSystem);
  return rests.filter((r) => equalRestIds(r.restId, restId)).at(0) ?? null;
}

export function getNoteById(staffSystem: StaffSystem, noteId: NoteId) {
  const notes = getNotes(staffSystem);
  return notes.filter((n) => equalNoteIds(n.noteId, noteId)).at(0) ?? null;
}

export function getChordById(
  staffSystem: StaffSystem,
  chordId: ChordId,
): Chord | null {
  const chords = getChords(staffSystem);
  return chords.filter((c) => equalChordIds(c.chordId, chordId)).at(0) ?? null;
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

export function getStaffById(
  staffSystem: StaffSystem,
  staffId: StaffId,
): Staff | null {
  const staves = getStaves(staffSystem);
  return staves.filter((s) => equalStaffIds(s.staffId, staffId)).at(0) ?? null;
}

export function getVoices(staffSystem: StaffSystem): Voice[] {
  const voices = staffSystem.staves
    .flatMap((staff) => staff.measures)
    .flatMap((measure) => measure.voices);
  return voices;
}

export function getGroupings(staffSystem: StaffSystem): Grouping[] {
  const groupings = staffSystem.staves
    .flatMap((staff) => staff.measures)
    .flatMap((measure) => measure.voices)
    .flatMap((voice) => voice.groupings);
  return groupings;
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

export function equalVoiceIds(firstId: VoiceId, secondId: VoiceId): boolean {
  return (
    firstId.measureId.staffId.staffSystemId.staffSystemId ===
      secondId.measureId.staffId.staffSystemId.staffSystemId &&
    firstId.measureId.staffId.stavesOrder ===
      secondId.measureId.staffId.stavesOrder &&
    firstId.measureId.measuresOrder === secondId.measureId.measuresOrder &&
    firstId.voicesOrder === secondId.voicesOrder
  );
}

export function equalGroupingIds(
  firstId: GroupingId,
  secondId: GroupingId,
): boolean {
  return (
    firstId.voiceId.measureId.staffId.staffSystemId.staffSystemId ===
      secondId.voiceId.measureId.staffId.staffSystemId.staffSystemId &&
    firstId.voiceId.measureId.staffId.stavesOrder ===
      secondId.voiceId.measureId.staffId.stavesOrder &&
    firstId.voiceId.measureId.measuresOrder ===
      secondId.voiceId.measureId.measuresOrder &&
    firstId.voiceId.voicesOrder === secondId.voiceId.voicesOrder &&
    firstId.groupingsOrder === secondId.groupingsOrder
  );
}

export function getVoiceById(
  staffSystem: StaffSystem,
  voiceId: VoiceId,
): Voice | null {
  const voices = getVoices(staffSystem);
  return voices.filter((v) => equalVoiceIds(v.voiceId, voiceId)).at(0) ?? null;
}

export function getGroupingById(
  staffSystem: StaffSystem,
  groupingId: GroupingId,
): Grouping | null {
  const groupings = getGroupings(staffSystem);
  return (
    groupings.filter((g) => equalGroupingIds(g.groupingId, groupingId)).at(0) ??
    null
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

export function restTypeToStemType(restType: RestType): StemType {
  switch (restType) {
    case RestType.Whole:
      return StemType.Whole;
    case RestType.Half:
      return StemType.Half;
    case RestType.Quarter:
      return StemType.Quarter;
    case RestType.Eight:
      return StemType.Eight;
    case RestType.Sixteenth:
      return StemType.Sixteenth;
    case RestType.Thirtysecond:
      return StemType.Thirtysecond;
    case RestType.Sixtyfourth:
      return StemType.Sixtyfourth;
    default:
      throw new Error("Unknown rest type");
  }
}

export function stemTypeToRestType(stemType: StemType): RestType {
  switch (stemType) {
    case StemType.Whole:
      return RestType.Whole;
    case StemType.Half:
      return RestType.Half;
    case StemType.Quarter:
      return RestType.Quarter;
    case StemType.Eight:
      return RestType.Eight;
    case StemType.Sixteenth:
      return RestType.Sixteenth;
    case StemType.Thirtysecond:
      return RestType.Thirtysecond;
    case StemType.Sixtyfourth:
      return RestType.Sixtyfourth;
    default:
      throw new Error("Unknown stem type");
  }
}
