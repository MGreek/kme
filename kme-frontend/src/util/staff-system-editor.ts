import type { GroupingEntry } from "../model/grouping-entry";
import type { Note } from "../model/note";
import type { Rest } from "../model/rest";
import type { StaffSystem } from "../model/staff-system";
import { parseNoteMetadata, parseRestMetadata } from "./metadata";
import {
  getGroupingEntries,
  getGroupingEntryById,
  getNextGroupingEntryId,
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
    for (const staff of this.staffSystem.staves) {
      for (let index = 0; index < 10; index++) {
        staff.measures = [
          ...staff.measures,
          requireNotNull(staff.measures.at(-1)),
        ];
      }
    }
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

  public moveCursorRight() {
    this.setCursorHightlight(false);
    let groupingEntryId = null;
    if ("restId" in this.cursor) {
      groupingEntryId = this.cursor.restId.groupingEntryId;
    } else {
      groupingEntryId = this.cursor.noteId.chordId.groupingEntryId;
    }
    const nextGroupingEntryId = getNextGroupingEntryId(
      this.staffSystem,
      groupingEntryId,
    );
    if (nextGroupingEntryId != null) {
      const nextGroupingEntry = getGroupingEntryById(
        this.staffSystem,
        nextGroupingEntryId,
      );
      this.setCursorOnGroupingEntry(nextGroupingEntry);
    }
    this.setCursorHightlight(true);
  }
}
