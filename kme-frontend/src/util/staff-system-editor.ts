import type { GroupingEntry } from "../model/grouping-entry";
import { Accidental, type Note } from "../model/note";
import type { Rest } from "../model/rest";
import type { StaffSystem } from "../model/staff-system";
import { StemType } from "../model/stem";
import {
  parseNoteMetadata,
  parseRestMetadata,
  parseStaffSystemMetadata,
} from "./metadata";
import {
  getChordById,
  getCursorFromGroupingEntry,
  getCursorGroupingEntry,
  getCursorMeasure,
  getGroupingById,
  getGroupingEntries,
  getGroupingEntryById,
  getMeasureById,
  getNextCursor,
  getPreviousCursor,
  getStaffSystemMeasureCount,
  insertEmptyMeasure,
  pruneStaffSystem,
  restTypeToStemType,
  stemTypeToRestType,
  syncIds,
} from "./misc";
import { requireNotNull } from "./require-not-null";

export class StaffSystemEditor {
  private staffSystem: StaffSystem;
  private cursor: Rest | Note;

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
    if ("restId" in this.cursor) {
      const restMetadata = parseRestMetadata(this.cursor);
      restMetadata.highlight = highlight;
      this.cursor.metadataJson = JSON.stringify(restMetadata);
    } else {
      const noteMetadata = parseNoteMetadata(this.cursor);
      noteMetadata.highlight = highlight;
      this.cursor.metadataJson = JSON.stringify(noteMetadata);
    }
  }

  constructor(staffSystem: StaffSystem) {
    this.staffSystem = structuredClone(staffSystem);
    // NOTE: this was used to test performance
    // for (const staff of this.staffSystem.staves) {
    //   for (let index = 0; index < 100; index++) {
    //     staff.measures = [
    //       ...staff.measures,
    //       requireNotNull(staff.measures.at(-1)),
    //     ];
    //   }
    // }
    const groupingEntries = getGroupingEntries(this.staffSystem);
    if (groupingEntries.length === 0) {
      throw new Error("staffSystem must not be empty");
    }
    const groupingEntry = requireNotNull(groupingEntries.at(0));
    if (groupingEntry.rest != null) {
      this.cursor = groupingEntry.rest;
    } else {
      const chord = requireNotNull(
        groupingEntry.chord,
        "found an empty GroupingEntry",
      );
      this.cursor = requireNotNull(chord.notes.at(0), "found an empty Chord");
    }
    this.setCursorHightlight(true);
  }

  public getStaffSystemMeasureCount(): number {
    return getStaffSystemMeasureCount(this.staffSystem);
  }

  public increaseCursorStaff() {
    this.setCursorHightlight(false);
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const nextGroupingEntryId = structuredClone(groupingEntry.groupingEntryId);
    nextGroupingEntryId.groupingEntriesOrder = 0;
    nextGroupingEntryId.groupingId.groupingsOrder = 0;
    nextGroupingEntryId.groupingId.voiceId.voicesOrder = 0;
    nextGroupingEntryId.groupingId.voiceId.measureId.staffId.stavesOrder += 1;

    const nextGroupingEntry = getGroupingEntryById(
      this.staffSystem,
      nextGroupingEntryId,
    );

    if (nextGroupingEntry != null) {
      this.setCursorOnGroupingEntry(nextGroupingEntry);
    }

    this.setCursorHightlight(true);
  }

  public decreaseCursorStaff() {
    this.setCursorHightlight(false);
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const nextGroupingEntryId = structuredClone(groupingEntry.groupingEntryId);
    nextGroupingEntryId.groupingEntriesOrder = 0;
    nextGroupingEntryId.groupingId.groupingsOrder = 0;
    nextGroupingEntryId.groupingId.voiceId.voicesOrder = 0;
    nextGroupingEntryId.groupingId.voiceId.measureId.staffId.stavesOrder -= 1;

    const nextGroupingEntry = getGroupingEntryById(
      this.staffSystem,
      nextGroupingEntryId,
    );

    if (nextGroupingEntry != null) {
      this.setCursorOnGroupingEntry(nextGroupingEntry);
    }

    this.setCursorHightlight(true);
  }

  public increaseCursorVoice() {
    this.setCursorHightlight(false);
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const nextGroupingEntryId = structuredClone(groupingEntry.groupingEntryId);
    nextGroupingEntryId.groupingEntriesOrder = 0;
    nextGroupingEntryId.groupingId.groupingsOrder = 0;
    nextGroupingEntryId.groupingId.voiceId.voicesOrder += 1;

    const nextGroupingEntry = getGroupingEntryById(
      this.staffSystem,
      nextGroupingEntryId,
    );

    if (nextGroupingEntry != null) {
      this.setCursorOnGroupingEntry(nextGroupingEntry);
    }

    this.setCursorHightlight(true);
  }

  public decreaseCursorVoice() {
    this.setCursorHightlight(false);
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const nextGroupingEntryId = structuredClone(groupingEntry.groupingEntryId);
    nextGroupingEntryId.groupingEntriesOrder = 0;
    nextGroupingEntryId.groupingId.groupingsOrder = 0;
    nextGroupingEntryId.groupingId.voiceId.voicesOrder -= 1;

    const nextGroupingEntry = getGroupingEntryById(
      this.staffSystem,
      nextGroupingEntryId,
    );

    if (nextGroupingEntry != null) {
      this.setCursorOnGroupingEntry(nextGroupingEntry);
    }

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
  }

  public moveCursorPosition(delta: number) {
    if ("restId" in this.cursor) {
      this.cursor.position += delta;
    } else {
      const cursorPosition = this.cursor.noteId.position;
      const prevPosition = cursorPosition + delta;
      const cursorChord = requireNotNull(
        getChordById(this.staffSystem, this.cursor.noteId.chordId),
      );
      if (
        cursorChord.notes.some((note) => note.noteId.position === prevPosition)
      ) {
        return;
      }
      this.cursor.noteId.position = prevPosition;
    }
  }

  public insertRow(measureIndex: number) {
    insertEmptyMeasure(this.staffSystem, measureIndex);
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
  }

  public deleteNote() {
    const measure = getCursorMeasure(this.staffSystem, this.cursor);
    const groupingEntries = measure.voices
      .flatMap((measure) => measure.groupings)
      .flatMap((grouping) => grouping.groupingEntries);
    if (groupingEntries.length <= 1) {
      return;
    }
    const groupingEntry = getCursorGroupingEntry(this.staffSystem, this.cursor);
    const grouping = requireNotNull(
      getGroupingById(
        this.staffSystem,
        groupingEntry.groupingEntryId.groupingId,
      ),
    );
    if (!this.moveCursorLeft() && !this.moveCursorRight()) {
      throw new Error("Cursor should be able to move somewhere.");
    }
    grouping.groupingEntries.splice(
      groupingEntry.groupingEntryId.groupingEntriesOrder,
      1,
    );
    pruneStaffSystem(this.staffSystem);
  }
}
