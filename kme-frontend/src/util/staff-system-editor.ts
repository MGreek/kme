import type { GroupingEntry } from "../model/grouping-entry";
import type { Note } from "../model/note";
import type { Rest } from "../model/rest";
import type { StaffSystem } from "../model/staff-system";
import { parseNoteMetadata, parseRestMetadata } from "./metadata";
import {
  getGroupingEntries,
  getGroupingEntryById,
  getMeasureById,
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

  public increaseCursorStaff() {
    this.setCursorHightlight(false);
    let groupingEntryId = null;
    if ("restId" in this.cursor) {
      groupingEntryId = this.cursor.restId.groupingEntryId;
    } else {
      groupingEntryId = this.cursor.noteId.chordId.groupingEntryId;
    }
    const nextGroupingEntryId = structuredClone(groupingEntryId);
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
    let groupingEntryId = null;
    if ("restId" in this.cursor) {
      groupingEntryId = this.cursor.restId.groupingEntryId;
    } else {
      groupingEntryId = this.cursor.noteId.chordId.groupingEntryId;
    }
    const nextGroupingEntryId = structuredClone(groupingEntryId);
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
    let groupingEntryId = null;
    if ("restId" in this.cursor) {
      groupingEntryId = this.cursor.restId.groupingEntryId;
    } else {
      groupingEntryId = this.cursor.noteId.chordId.groupingEntryId;
    }
    const nextGroupingEntryId = structuredClone(groupingEntryId);
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
    let groupingEntryId = null;
    if ("restId" in this.cursor) {
      groupingEntryId = this.cursor.restId.groupingEntryId;
    } else {
      groupingEntryId = this.cursor.noteId.chordId.groupingEntryId;
    }
    const nextGroupingEntryId = structuredClone(groupingEntryId);
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

  public moveCursorLeft() {
    this.setCursorHightlight(false);
    let groupingEntryId = null;
    if ("restId" in this.cursor) {
      groupingEntryId = this.cursor.restId.groupingEntryId;
    } else {
      groupingEntryId = this.cursor.noteId.chordId.groupingEntryId;
    }
    const nextGroupingEntryId = structuredClone(groupingEntryId);
    nextGroupingEntryId.groupingEntriesOrder -= 1;

    const nextGroupingEntry = getGroupingEntryById(
      this.staffSystem,
      nextGroupingEntryId,
    );

    if (nextGroupingEntry != null) {
      this.setCursorOnGroupingEntry(nextGroupingEntry);
      this.setCursorHightlight(true);
      return;
    }

    const measureId = groupingEntryId.groupingId.voiceId.measureId;
    const nextMeasureId = structuredClone(measureId);
    nextMeasureId.measuresOrder -= 1;

    const nextMeasure = getMeasureById(this.staffSystem, nextMeasureId);
    if (nextMeasure != null) {
      const lastEntry = requireNotNull(
        nextMeasure.voices
          .at(groupingEntryId.groupingId.voiceId.voicesOrder)
          ?.groupings.at(-1)
          ?.groupingEntries.at(-1) ??
        nextMeasure.voices.at(0)?.groupings.at(-1)?.groupingEntries.at(-1),
        "Found an empty measure",
      );
      this.setCursorOnGroupingEntry(lastEntry);
      this.setCursorHightlight(true);
      return;
    }

    this.setCursorHightlight(true);
  }

  public moveCursorRight() {
    this.setCursorHightlight(false);
    let groupingEntryId = null;
    if ("restId" in this.cursor) {
      groupingEntryId = this.cursor.restId.groupingEntryId;
    } else {
      groupingEntryId = this.cursor.noteId.chordId.groupingEntryId;
    }
    const nextGroupingEntryId = structuredClone(groupingEntryId);
    nextGroupingEntryId.groupingEntriesOrder += 1;

    const nextGroupingEntry = getGroupingEntryById(
      this.staffSystem,
      nextGroupingEntryId,
    );

    if (nextGroupingEntry != null) {
      this.setCursorOnGroupingEntry(nextGroupingEntry);
      this.setCursorHightlight(true);
      return;
    }

    const measureId = groupingEntryId.groupingId.voiceId.measureId;
    const nextMeasureId = structuredClone(measureId);
    nextMeasureId.measuresOrder += 1;

    const nextMeasure = getMeasureById(this.staffSystem, nextMeasureId);
    if (nextMeasure != null) {
      const firstEntry = requireNotNull(
        nextMeasure.voices
          .at(groupingEntryId.groupingId.voiceId.voicesOrder)
          ?.groupings.at(0)
          ?.groupingEntries.at(0) ??
        nextMeasure.voices.at(0)?.groupings.at(0)?.groupingEntries.at(0),
        "Found an empty measure",
      );
      this.setCursorOnGroupingEntry(firstEntry);
      this.setCursorHightlight(true);
      return;
    }

    this.setCursorHightlight(true);
  }
}
