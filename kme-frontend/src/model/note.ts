import type { ChordId } from "./chord";

export enum Accidental {
  DoubleFlat = "DoubleFlat",
  Flat = "Flat",
  None = "None",
  Natural = "Natural",
  Sharp = "Sharp",
  DoubleSharp = "DoubleSharp",
}

export interface NoteId {
  chordId: ChordId;
  position: number;
}

export interface Note {
  noteId: NoteId;
  accidental: Accidental;
  metadataJson: string;
}
