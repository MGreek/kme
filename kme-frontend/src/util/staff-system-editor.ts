import type { GroupingEntry } from "../model/grouping-entry";
import type { Clef, KeySignature, TimeSignature } from "../model/measure";
import { Accidental, type Note } from "../model/note";
import type { Rest } from "../model/rest";
import type { Staff } from "../model/staff";
import type { ConnectorType, StaffSystem } from "../model/staff-system";
import type { StemType } from "../model/stem";
import {
  parseGroupingMetadata,
  parseNoteMetadata,
  parseRestMetadata,
  parseStaffSystemMetadata,
} from "./metadata";
import {
  appendVoice,
  getChordById,
  getCursorChord,
  getCursorFromGroupingEntry,
  getCursorGrouping,
  getCursorGroupingEntry,
  getCursorMeasure,
  getCursorStaff,
  getCursorVoice,
  getGroupingById,
  getGroupingEntryByDurationShift,
  getGroupingEntryById,
  getGroupingEntryDurationShift,
  getMeasureById,
  getMeasureRowIndex,
  getNextCursor,
  getNoteById,
  getPreviousCursor,
  getRestById,
  getStaffById,
  getStaffSystemMeasureCount,
  getVoiceById,
  getWholeRestMeasure,
  insertEmptyMeasure,
  pruneStaffSystem,
  restTypeToStemType,
  stemTypeToRestType,
  syncIds,
} from "./misc";
import { requireNotNull } from "./require-not-null";

export class StaffSystemEditor {
  private staffSystem: StaffSystem;

  private _cursor: Rest | Note | null = null;

  private get cursor(): Rest | Note {
    if (this._cursor == null) {
      const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
      if ("groupingEntryId" in staffSystemMetadata.cursorId) {
        this._cursor = requireNotNull(
          getRestById(this.staffSystem, staffSystemMetadata.cursorId),
        );
      } else {
        this._cursor = requireNotNull(
          getNoteById(this.staffSystem, staffSystemMetadata.cursorId),
        );
      }
    }
    return this._cursor;
  }

  private set cursor(value: Rest | Note) {
    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    if ("restId" in value) {
      staffSystemMetadata.cursorId = value.restId;
    } else {
      staffSystemMetadata.cursorId = value.noteId;
    }
    this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
    this._cursor = value;
  }

  private saveCursor() {
    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    if ("restId" in this.cursor) {
      staffSystemMetadata.cursorId = this.cursor.restId;
    } else {
      staffSystemMetadata.cursorId = this.cursor.noteId;
    }
    this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
    this._cursor = this.cursor;
  }

  public getStaffSystem(): StaffSystem {
    return structuredClone(this.staffSystem);
  }

  private setCursorOnGroupingEntry(groupingEntry: GroupingEntry) {
    if (groupingEntry.rest != null) {
      this.cursor = groupingEntry.rest;
    } else {
      const chord = requireNotNull(
        groupingEntry.chord,
        "found an empty GroupingEntry",
      );
      this.cursor = requireNotNull(chord.notes.at(0), "found an empty Chord");
    }
  }

  private setCursorHightlight(highlight: boolean) {
    const grouping = getCursorGrouping(this.staffSystem, this.cursor);
    const groupingAlpha = "32";
    for (const groupingEntry of grouping.groupingEntries) {
      if (groupingEntry.rest != null) {
        const restMetadata = parseRestMetadata(groupingEntry.rest);
        restMetadata.highlight = highlight;
        if (highlight) {
          restMetadata.alpha = groupingAlpha;
        }
        groupingEntry.rest.metadataJson = JSON.stringify(restMetadata);
      } else if (groupingEntry.chord != null) {
        for (const note of groupingEntry.chord.notes) {
          const noteMetadata = parseNoteMetadata(requireNotNull(note));
          noteMetadata.highlight = highlight;
          if (highlight) {
            noteMetadata.alpha = groupingAlpha;
          }
          note.metadataJson = JSON.stringify(noteMetadata);
        }
      }
      this.saveCursor();
    }

    if ("restId" in this.cursor) {
      const restMetadata = parseRestMetadata(this.cursor);
      restMetadata.highlight = highlight;
      if (highlight) {
        restMetadata.alpha = "ff";
      }
      this.cursor.metadataJson = JSON.stringify(restMetadata);
    } else {
      const noteMetadata = parseNoteMetadata(this.cursor);
      noteMetadata.highlight = highlight;
      if (highlight) {
        noteMetadata.alpha = "ff";
      }
      this.cursor.metadataJson = JSON.stringify(noteMetadata);
    }
  }

  constructor(staffSystem: StaffSystem) {
    this.staffSystem = structuredClone(staffSystem);
    this.setCursorHightlight(true);
  }

  public getStaffSystemMeasureCount(): number {
    return getStaffSystemMeasureCount(this.staffSystem);
  }

  public getStaffCount(): number {
    return this.staffSystem.staves.length;
  }

  public increaseCursorStaff() {
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const nextStaff = getStaffById(this.staffSystem, {
      staffSystemId:
        groupingEntry.groupingEntryId.groupingId.voiceId.measureId.staffId
          .staffSystemId,
      stavesOrder:
        groupingEntry.groupingEntryId.groupingId.voiceId.measureId.staffId
          .stavesOrder + 1,
    });
    if (nextStaff == null) {
      return;
    }
    const measureIndex =
      groupingEntry.groupingEntryId.groupingId.voiceId.measureId.measuresOrder;
    const nextMeasure = requireNotNull(
      nextStaff.measures.at(measureIndex),
      "Found staves with different number of measures",
    );
    const voiceIndex =
      groupingEntry.groupingEntryId.groupingId.voiceId.voicesOrder;
    const nextVoice = requireNotNull(
      nextMeasure.voices.at(voiceIndex) ?? nextMeasure.voices.at(-1),
      "Found an empty measure",
    );
    const nextGroupingEntry = getGroupingEntryByDurationShift(
      nextVoice,
      getGroupingEntryDurationShift(this.staffSystem, groupingEntry),
    );
    this.setCursorHightlight(false);
    this.setCursorOnGroupingEntry(nextGroupingEntry);
    this.setCursorHightlight(true);
  }

  public decreaseCursorStaff() {
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const previousStaff = getStaffById(this.staffSystem, {
      staffSystemId:
        groupingEntry.groupingEntryId.groupingId.voiceId.measureId.staffId
          .staffSystemId,
      stavesOrder:
        groupingEntry.groupingEntryId.groupingId.voiceId.measureId.staffId
          .stavesOrder - 1,
    });
    if (previousStaff == null) {
      return;
    }
    const measureIndex =
      groupingEntry.groupingEntryId.groupingId.voiceId.measureId.measuresOrder;
    const previousMeasure = requireNotNull(
      previousStaff.measures.at(measureIndex),
      "Found staves with different number of measures",
    );
    const voiceIndex =
      groupingEntry.groupingEntryId.groupingId.voiceId.voicesOrder;
    const previousVoice = requireNotNull(
      previousMeasure.voices.at(voiceIndex) ?? previousMeasure.voices.at(-1),
      "Found an empty measure",
    );
    const previousGroupingEntry = getGroupingEntryByDurationShift(
      previousVoice,
      getGroupingEntryDurationShift(this.staffSystem, groupingEntry),
    );
    this.setCursorHightlight(false);
    this.setCursorOnGroupingEntry(previousGroupingEntry);
    this.setCursorHightlight(true);
  }

  public increaseCursorNote() {
    if ("restId" in this.cursor) {
      return;
    }
    const chord = requireNotNull(
      getChordById(this.staffSystem, this.cursor.noteId.chordId),
    );
    const cursorPosition = this.cursor.noteId.position;
    const nextNote = chord.notes
      .filter((note) => note.noteId.position > cursorPosition)
      .at(0);
    if (nextNote == null) {
      return;
    }
    this.setCursorHightlight(false);
    this.cursor = nextNote;
    this.setCursorHightlight(true);
  }

  public decreaseCursorNote() {
    if ("restId" in this.cursor) {
      return;
    }
    const chord = requireNotNull(
      getChordById(this.staffSystem, this.cursor.noteId.chordId),
    );
    const cursorPosition = this.cursor.noteId.position;
    const prevNote = chord.notes
      .filter((note) => note.noteId.position < cursorPosition)
      .at(-1);
    if (prevNote == null) {
      return;
    }
    this.setCursorHightlight(false);
    this.cursor = prevNote;
    this.setCursorHightlight(true);
  }

  public increaseCursorVoice() {
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const nextVoiceId = structuredClone(
      groupingEntry.groupingEntryId.groupingId.voiceId,
    );
    nextVoiceId.voicesOrder += 1;
    const nextVoice = getVoiceById(this.staffSystem, nextVoiceId);

    if (nextVoice == null) {
      return;
    }

    const nextGroupingEntry = getGroupingEntryByDurationShift(
      nextVoice,
      getGroupingEntryDurationShift(this.staffSystem, groupingEntry),
    );

    this.setCursorHightlight(false);
    this.setCursorOnGroupingEntry(nextGroupingEntry);
    this.setCursorHightlight(true);
  }

  public decreaseCursorVoice() {
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const previousVoiceId = structuredClone(
      groupingEntry.groupingEntryId.groupingId.voiceId,
    );
    previousVoiceId.voicesOrder -= 1;
    const nextVoice = getVoiceById(this.staffSystem, previousVoiceId);

    if (nextVoice == null) {
      return;
    }

    const nextGroupingEntry = getGroupingEntryByDurationShift(
      nextVoice,
      getGroupingEntryDurationShift(this.staffSystem, groupingEntry),
    );

    this.setCursorHightlight(false);
    this.setCursorOnGroupingEntry(nextGroupingEntry);
    this.setCursorHightlight(true);
  }

  public moveCursorLeft(): boolean {
    const prevCursor = getPreviousCursor(this.staffSystem, this.cursor);
    if (prevCursor != null) {
      this.setCursorHightlight(false);
      this.cursor = prevCursor;
      this.setCursorHightlight(true);
      return true;
    }
    return false;
  }

  public moveCursorRight(): boolean {
    const nextCursor = getNextCursor(this.staffSystem, this.cursor);
    if (nextCursor != null) {
      this.setCursorHightlight(false);
      this.cursor = nextCursor;
      this.setCursorHightlight(true);
      return true;
    }
    return false;
  }

  public removeMeasures() {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    const nextMeasureId = structuredClone(measure.measureId);
    nextMeasureId.measuresOrder += 1;
    const nextMeasure = getMeasureById(this.staffSystem, nextMeasureId);

    const prevMeasureId = structuredClone(measure.measureId);
    prevMeasureId.measuresOrder -= 1;
    const prevMeasure = getMeasureById(this.staffSystem, prevMeasureId);

    if (nextMeasure != null) {
      this.setCursorHightlight(false);
      this.cursor = getCursorFromGroupingEntry(
        requireNotNull(
          nextMeasure.voices.at(0)?.groupings.at(0)?.groupingEntries.at(0),
        ),
      );
    } else if (prevMeasure != null) {
      this.setCursorHightlight(false);
      this.cursor = getCursorFromGroupingEntry(
        requireNotNull(
          prevMeasure.voices.at(0)?.groupings.at(-1)?.groupingEntries.at(-1),
        ),
      );
    } else {
      return;
    }

    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    let crtIndex = 0;
    for (const [index, length] of staffSystemMetadata.rowLengths.entries()) {
      if (crtIndex + length - 1 >= measure.measureId.measuresOrder) {
        if (staffSystemMetadata.rowLengths != null) {
          staffSystemMetadata.rowLengths[index] -= 1;
          if (staffSystemMetadata.rowLengths[index] === 0) {
            staffSystemMetadata.rowLengths.splice(index, 1);
          }
          this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
        }
        break;
      }
      crtIndex += length;
    }
    for (const staff of this.staffSystem.staves) {
      staff.measures.splice(measure.measureId.measuresOrder, 1);
    }
    syncIds(this.staffSystem);
    this.setCursorHightlight(true);
  }

  public swapMeasureLeft() {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    const staff = requireNotNull(
      this.staffSystem.staves.at(measure.measureId.staffId.stavesOrder),
    );
    const prevMeasureId = structuredClone(measure.measureId);
    prevMeasureId.measuresOrder -= 1;
    const prevMeasure = getMeasureById(this.staffSystem, prevMeasureId);
    if (prevMeasure == null) {
      return;
    }
    [
      staff.measures[measure.measureId.measuresOrder],
      staff.measures[prevMeasureId.measuresOrder],
    ] = [
      requireNotNull(staff.measures[prevMeasureId.measuresOrder]),
      requireNotNull(staff.measures[measure.measureId.measuresOrder]),
    ];
    syncIds(this.staffSystem);
    this.saveCursor();
  }

  public swapMeasureRight() {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    const staff = requireNotNull(
      this.staffSystem.staves.at(measure.measureId.staffId.stavesOrder),
    );
    const nextMeasureId = structuredClone(measure.measureId);
    nextMeasureId.measuresOrder += 1;
    const nextMeasure = getMeasureById(this.staffSystem, nextMeasureId);
    if (nextMeasure == null) {
      return;
    }
    [
      staff.measures[measure.measureId.measuresOrder],
      staff.measures[nextMeasureId.measuresOrder],
    ] = [
      requireNotNull(staff.measures[nextMeasureId.measuresOrder]),
      requireNotNull(staff.measures[measure.measureId.measuresOrder]),
    ];
    syncIds(this.staffSystem);
    this.saveCursor();
  }

  public swapStaffDown() {
    const staff = getCursorStaff(this.staffSystem, this.cursor);
    const nextStaff = getStaffById(this.staffSystem, {
      staffSystemId: staff.staffId.staffSystemId,
      stavesOrder: staff.staffId.stavesOrder + 1,
    });
    if (nextStaff == null) {
      return;
    }
    [
      this.staffSystem.staves[staff.staffId.stavesOrder],
      this.staffSystem.staves[nextStaff.staffId.stavesOrder],
    ] = [
      requireNotNull(this.staffSystem.staves[nextStaff.staffId.stavesOrder]),
      requireNotNull(this.staffSystem.staves[staff.staffId.stavesOrder]),
    ];
    syncIds(this.staffSystem);
    this.saveCursor();
  }

  public swapStaffUp() {
    const staff = getCursorStaff(this.staffSystem, this.cursor);
    const nextStaff = getStaffById(this.staffSystem, {
      staffSystemId: staff.staffId.staffSystemId,
      stavesOrder: staff.staffId.stavesOrder - 1,
    });
    if (nextStaff == null) {
      return;
    }
    [
      this.staffSystem.staves[staff.staffId.stavesOrder],
      this.staffSystem.staves[nextStaff.staffId.stavesOrder],
    ] = [
      requireNotNull(this.staffSystem.staves[nextStaff.staffId.stavesOrder]),
      requireNotNull(this.staffSystem.staves[staff.staffId.stavesOrder]),
    ];
    syncIds(this.staffSystem);
    this.saveCursor();
  }

  public moveCursorPosition(delta: number) {
    if ("restId" in this.cursor) {
      const cursorPosition = this.cursor.position;
      const nextPosition = cursorPosition + delta;
      if (
        nextPosition < StaffSystemEditor.MIN_NOTE_REST_POSITION ||
        nextPosition > StaffSystemEditor.MAX_NOTE_REST_POSITION
      ) {
        return;
      }
      this.cursor.position += delta;
    } else {
      const cursorPosition = this.cursor.noteId.position;
      const nextPosition = cursorPosition + delta;
      if (
        nextPosition < StaffSystemEditor.MIN_NOTE_REST_POSITION ||
        nextPosition > StaffSystemEditor.MAX_NOTE_REST_POSITION
      ) {
        return;
      }
      const cursorChord = requireNotNull(
        getChordById(this.staffSystem, this.cursor.noteId.chordId),
      );
      if (
        cursorChord.notes.some((note) => note.noteId.position === nextPosition)
      ) {
        return;
      }
      this.cursor.noteId.position = nextPosition;
    }
    this.saveCursor();
  }

  public insertMeasure(measureIndex: number) {
    insertEmptyMeasure(this.staffSystem, measureIndex);
    this.saveCursor();
  }

  public toggleType() {
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    if ("restId" in this.cursor) {
      groupingEntry.chord = {
        chordId: { groupingEntryId: groupingEntry.groupingEntryId },
        stem: {
          stemType: restTypeToStemType(this.cursor.restType),
          metadataJson: "",
        },
        dotCount: 0,
        metadataJson: "",
        notes: [
          {
            noteId: {
              chordId: { groupingEntryId: groupingEntry.groupingEntryId },
              position: this.cursor.position,
            },
            accidental: Accidental.None,
            metadataJson: "",
          },
        ],
      };
      groupingEntry.rest = null;
      this.cursor = requireNotNull(groupingEntry.chord.notes.at(0));
      this.setCursorHightlight(true);
    } else {
      const chord = requireNotNull(
        getChordById(this.staffSystem, this.cursor.noteId.chordId),
      );
      groupingEntry.rest = {
        restId: { groupingEntryId: groupingEntry.groupingEntryId },
        restType: stemTypeToRestType(chord.stem.stemType),
        position: this.cursor.noteId.position,
        metadataJson: "",
      };
      groupingEntry.chord = null;
      this.cursor = groupingEntry.rest;
      this.setCursorHightlight(true);
    }
    this.saveCursor();
  }

  public setDuration(stemType: StemType) {
    if ("restId" in this.cursor) {
      this.cursor.restType = stemTypeToRestType(stemType);
    } else {
      const chord = requireNotNull(
        getChordById(this.staffSystem, this.cursor.noteId.chordId),
      );
      chord.stem.stemType = stemType;
    }
    this.saveCursor();
  }

  public deleteNote() {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    const prevCursor = getPreviousCursor(this.staffSystem, this.cursor);
    const nextCursor = getNextCursor(this.staffSystem, this.cursor);
    if (
      measure.voices
        .flatMap((v) => v.groupings)
        .flatMap((g) => g.groupingEntries).length === 1
    ) {
      return;
    }
    this.setCursorHightlight(false);
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    if ("restId" in this.cursor) {
      groupingEntry.rest = null;
    } else {
      const cursorNote = this.cursor;
      const chord = requireNotNull(groupingEntry.chord);
      chord.notes = chord.notes.filter(
        (note) => note.noteId.position !== cursorNote.noteId.position,
      );
    }
    pruneStaffSystem(this.staffSystem);
    let newGroupingEntry = null;
    if ("noteId" in this.cursor) {
      const sameGroupingEntry = getGroupingEntryById(
        this.staffSystem,
        this.cursor.noteId.chordId.groupingEntryId,
      );
      if (sameGroupingEntry != null) {
        newGroupingEntry = sameGroupingEntry;
      }
    }
    if (newGroupingEntry == null) {
      newGroupingEntry = measure.voices
        .at(0)
        ?.groupings.at(0)
        ?.groupingEntries.at(0);
    }
    if (newGroupingEntry != null) {
      this.setCursorOnGroupingEntry(newGroupingEntry);
    } else {
      this.cursor =
        prevCursor ??
        requireNotNull(
          nextCursor,
          "One of prevCursor or nextCursor should exist",
        );
    }
    this.setCursorHightlight(true);
    this.saveCursor();
  }

  static readonly MAX_CHORD_NOTES = 10;

  public insertNoteBottom() {
    if ("restId" in this.cursor) {
      return;
    }

    const chord = requireNotNull(
      getChordById(this.staffSystem, this.cursor.noteId.chordId),
    );
    const bottomPosition = chord.notes
      .map((note) => note.noteId.position)
      .reduce((prev, crt) => Math.min(prev, crt));
    if (chord.notes.length < StaffSystemEditor.MAX_CHORD_NOTES) {
      this.setCursorHightlight(false);
      chord.notes.push({
        noteId: { chordId: chord.chordId, position: bottomPosition - 1 },
        accidental: Accidental.None,
        metadataJson: "",
      });
      this.setCursorHightlight(true);
    }
    syncIds(this.staffSystem);
    this.saveCursor();
  }

  public insertNoteTop() {
    if ("restId" in this.cursor) {
      return;
    }

    const chord = requireNotNull(
      getChordById(this.staffSystem, this.cursor.noteId.chordId),
    );
    const topPosition = chord.notes
      .map((note) => note.noteId.position)
      .reduce((prev, crt) => Math.max(prev, crt));
    if (chord.notes.length < StaffSystemEditor.MAX_CHORD_NOTES) {
      this.setCursorHightlight(false);
      chord.notes.push({
        noteId: { chordId: chord.chordId, position: topPosition + 1 },
        accidental: Accidental.None,
        metadataJson: "",
      });
      this.setCursorHightlight(true);
    }
    this.saveCursor();
  }

  static readonly MAX_VOICES = 4;

  public appendVoice() {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    if (measure.voices.length < StaffSystemEditor.MAX_VOICES) {
      appendVoice(measure);
    }
    this.saveCursor();
  }

  public setClef(clef: Clef) {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    measure.clef = clef;
  }

  public setKeySignature(keySignature: KeySignature) {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    measure.keySignature = keySignature;
  }

  public setTimeSignature(timeSignature: TimeSignature) {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    measure.timeSignature = timeSignature;
  }

  public splitGrouping() {
    this.setCursorHightlight(false);
    const voice = getCursorVoice(this.staffSystem, this.cursor);
    const grouping = getCursorGrouping(this.staffSystem, this.cursor);
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const firstHalf = structuredClone(grouping);
    firstHalf.groupingEntries = firstHalf.groupingEntries.filter(
      (ge) =>
        ge.groupingEntryId.groupingEntriesOrder <=
        groupingEntry.groupingEntryId.groupingEntriesOrder,
    );
    const secondHalf = structuredClone(grouping);
    secondHalf.groupingEntries = secondHalf.groupingEntries.filter(
      (ge) =>
        ge.groupingEntryId.groupingEntriesOrder >
        groupingEntry.groupingEntryId.groupingEntriesOrder,
    );
    // Now that the halves are declared set the cursor on the last element
    // of the first half
    this.setCursorOnGroupingEntry(
      requireNotNull(firstHalf.groupingEntries.at(-1)),
    );
    voice.groupings.splice(
      grouping.groupingId.groupingsOrder,
      1,
      firstHalf,
      secondHalf,
    );
    pruneStaffSystem(this.staffSystem);
    this.setCursorHightlight(true);
  }

  public mergeGrouping() {
    const voice = getCursorVoice(this.staffSystem, this.cursor);
    const firstHalf = getCursorGrouping(this.staffSystem, this.cursor);
    const secondHalf = getGroupingById(this.staffSystem, {
      voiceId: firstHalf.groupingId.voiceId,
      groupingsOrder: firstHalf.groupingId.groupingsOrder + 1,
    });
    if (secondHalf == null) {
      return;
    }
    this.setCursorHightlight(false);
    const whole = structuredClone(firstHalf);
    whole.groupingEntries.push(...secondHalf.groupingEntries);
    const groupingEntryIndex = getCursorGroupingEntry(
      this.staffSystem,
      this.cursor,
    ).groupingEntryId.groupingEntriesOrder;
    this.setCursorOnGroupingEntry(
      requireNotNull(whole.groupingEntries.at(groupingEntryIndex)),
    );
    voice.groupings.splice(firstHalf.groupingId.groupingsOrder, 2, whole);
    syncIds(this.staffSystem);
    this.setCursorHightlight(true);
  }

  public setAccidental(accidental: Accidental) {
    if ("restId" in this.cursor) {
      return;
    }
    this.cursor.accidental = accidental;
  }

  public join() {
    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    const rowLenghts = staffSystemMetadata.rowLengths;
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    const rowIndex = getMeasureRowIndex(this.staffSystem, measure);
    if (rowIndex + 1 >= rowLenghts.length) {
      return;
    }
    rowLenghts[rowIndex] += 1;
    rowLenghts[rowIndex + 1] -= 1;
    if (rowLenghts[rowIndex + 1] === 0) {
      rowLenghts.splice(rowIndex + 1, 1);
    }
    this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
  }

  public break() {
    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    const rowLenghts = staffSystemMetadata.rowLengths;
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    const rowIndex = getMeasureRowIndex(this.staffSystem, measure);
    if (rowLenghts[rowIndex] === 1) {
      return;
    }
    rowLenghts[rowIndex] -= 1;
    if (rowIndex + 1 < rowLenghts.length) {
      rowLenghts[rowIndex + 1] += 1;
    } else {
      rowLenghts.push(1);
    }
    this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
  }

  public deleteStaff() {
    if (this.staffSystem.staves.length <= 1) {
      return;
    }
    const staff = getCursorStaff(this.staffSystem, this.cursor);
    const prevStaff = getStaffById(this.staffSystem, {
      staffSystemId: staff.staffId.staffSystemId,
      stavesOrder: staff.staffId.stavesOrder - 1,
    });
    const nextStaff = getStaffById(this.staffSystem, {
      staffSystemId: staff.staffId.staffSystemId,
      stavesOrder: staff.staffId.stavesOrder + 1,
    });
    const newStaff = prevStaff ?? requireNotNull(nextStaff);
    this.setCursorHightlight(false);
    this.setCursorOnGroupingEntry(
      requireNotNull(
        newStaff.measures
          .at(0)
          ?.voices.at(0)
          ?.groupings.at(0)
          ?.groupingEntries.at(0),
      ),
    );
    this.setCursorHightlight(true);
    this.staffSystem.staves.splice(staff.staffId.stavesOrder, 1);
    syncIds(this.staffSystem);
    this.saveCursor();
  }

  static readonly MAX_STAVES = 4;

  public insertStaff(staffIndex: number) {
    if (this.staffSystem.staves.length >= StaffSystemEditor.MAX_STAVES) {
      return;
    }
    const measureCount = getStaffSystemMeasureCount(this.staffSystem);
    const staffId = {
      staffSystemId: this.staffSystem.staffSystemId,
      stavesOrder: staffIndex,
    };
    const measures = [];
    for (let index = 0; index < measureCount; index++) {
      measures.push(getWholeRestMeasure(null, staffId));
    }
    const staff: Staff = {
      staffId,
      metadataJson: "",
      measures,
    };
    this.staffSystem.staves.splice(staffIndex, 0, staff);
    syncIds(this.staffSystem);
    this.saveCursor();
  }

  static readonly MIN_STAFF_SYSTEM_GAP = 4;
  static readonly MAX_STAFF_SYSTEM_GAP = 32;

  public shiftSpaceBetweenStaves(amount: number) {
    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    const result = staffSystemMetadata.gap + amount;
    if (
      StaffSystemEditor.MIN_STAFF_SYSTEM_GAP <= result &&
      result <= StaffSystemEditor.MAX_STAFF_SYSTEM_GAP
    ) {
      staffSystemMetadata.gap = result;
    }
    this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
  }

  public setSpaceBetweenStaves(amount: number) {
    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    staffSystemMetadata.gap = amount;
    this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
  }

  public toggleGroupStemDirection() {
    const grouping = getCursorGrouping(this.staffSystem, this.cursor);
    const groupingMetadata = parseGroupingMetadata(grouping);
    groupingMetadata.stemUp = !groupingMetadata.stemUp;
    grouping.metadataJson = JSON.stringify(groupingMetadata);
  }

  public getCursorRowIndex() {
    return getMeasureRowIndex(
      this.staffSystem,
      getCursorMeasure(this.staffSystem, this.cursor),
    );
  }

  static readonly MIN_NOTE_REST_POSITION = -20;
  static readonly MAX_NOTE_REST_POSITION = 50;
  static readonly MAX_GROUPING_ENTRIES_IN_VOICE = 32;

  public insertNoteRelativeToCursor(offset: number, keepGrouping = true) {
    let voice = null;
    if ("restId" in this.cursor) {
      const finalPosition = this.cursor.position + offset;
      if (
        finalPosition < StaffSystemEditor.MIN_NOTE_REST_POSITION ||
        finalPosition > StaffSystemEditor.MAX_NOTE_REST_POSITION
      ) {
        return;
      }
      voice = requireNotNull(
        getVoiceById(
          this.staffSystem,
          this.cursor.restId.groupingEntryId.groupingId.voiceId,
        ),
      );
    } else {
      const finalPosition = this.cursor.noteId.position + offset;
      if (
        finalPosition < StaffSystemEditor.MIN_NOTE_REST_POSITION ||
        finalPosition > StaffSystemEditor.MAX_NOTE_REST_POSITION
      ) {
        return;
      }
      voice = requireNotNull(
        getVoiceById(
          this.staffSystem,
          this.cursor.noteId.chordId.groupingEntryId.groupingId.voiceId,
        ),
      );
    }
    if (
      voice.groupings.flatMap((grouping) => grouping.groupingEntries).length >=
      StaffSystemEditor.MAX_GROUPING_ENTRIES_IN_VOICE
    ) {
      return;
    }
    this.setCursorHightlight(false);
    let groupingEntry: GroupingEntry | null = null;
    const cursorGrouping = getCursorGrouping(this.staffSystem, this.cursor);
    const cursorGroupingEntry = getCursorGroupingEntry(
      this.staffSystem,
      this.cursor,
    );
    if (keepGrouping) {
      groupingEntry = {
        groupingEntryId: {
          groupingId: cursorGrouping.groupingId,
          groupingEntriesOrder: 0,
        },
        chord: null,
        rest: null,
      };
      cursorGrouping.groupingEntries.splice(
        cursorGroupingEntry.groupingEntryId.groupingEntriesOrder + 1,
        0,
        groupingEntry,
      );
    } else {
      // NOTE: use methods from this class
      // sparingly since the performance cost increases fast
      this.splitGrouping();
      this.setCursorHightlight(false);
      const cursorVoice = getCursorVoice(this.staffSystem, this.cursor);
      const newGrouping = structuredClone(cursorGrouping);
      newGrouping.metadataJson = "";
      cursorVoice.groupings.splice(
        cursorGrouping.groupingId.groupingsOrder + 1,
        0,
        newGrouping,
      );
      groupingEntry = {
        groupingEntryId: {
          groupingId: newGrouping.groupingId,
          groupingEntriesOrder: 0,
        },
        chord: null,
        rest: null,
      };
      newGrouping.groupingEntries = [groupingEntry];
    }
    if ("restId" in this.cursor) {
      const newRest: Rest = {
        restId: { groupingEntryId: groupingEntry.groupingEntryId },
        restType: this.cursor.restType,
        position: this.cursor.position + offset,
        metadataJson: "",
      };
      groupingEntry.rest = newRest;
    } else {
      const newNote: Note = {
        noteId: {
          chordId: this.cursor.noteId.chordId,
          position: this.cursor.noteId.position + offset,
        },
        accidental: Accidental.None,
        metadataJson: "",
      };
      const newChord = structuredClone(
        requireNotNull(getCursorChord(this.staffSystem, this.cursor)),
      );
      newChord.metadataJson = "";
      newChord.notes = [newNote];
      groupingEntry.chord = newChord;
    }
    syncIds(this.staffSystem);
    this.setCursorOnGroupingEntry(groupingEntry);
    this.setCursorHightlight(true);
  }

  public setStaffSystemName(name: string) {
    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    staffSystemMetadata.name = name;
    this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
  }

  public setStaffSystemConnector(connectorType: ConnectorType) {
    const staffSystemMetadata = parseStaffSystemMetadata(this.staffSystem);
    staffSystemMetadata.connectorType = connectorType;
    this.staffSystem.metadataJson = JSON.stringify(staffSystemMetadata);
  }
}
