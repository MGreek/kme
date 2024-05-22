import type { StaffId } from "./staff";
import type { Voice } from "./voice";

export enum KeySignature {
  Flat7 = "Flat7",
  Flat6 = "Flat6",
  Flat5 = "Flat5",
  Flat4 = "Flat4",
  Flat3 = "Flat3",
  Flat2 = "Flat2",
  Flat1 = "Flat1",
  None = "None",
  Sharp1 = "Sharp1",
  Sharp2 = "Sharp2",
  Sharp3 = "Sharp3",
  Sharp4 = "Sharp4",
  Sharp5 = "Sharp5",
  Sharp6 = "Sharp6",
  Sharp7 = "Sharp7",
}

export enum TimeSignature {
  Common = "Common",
  FourFour = "FourFour",
  ThreeFour = "ThreeFour",
  TwoFour = "TwoFour",
}

export enum Clef {
  Treble = "Treble",
  Alto = "Alto",
  Bass = "Bass",
}

export interface MeasureId {
  staffId: StaffId;
  measuresOrder: number;
}

export interface Measure {
  measureId: MeasureId;
  metadataJson: string;
  keySignature: KeySignature;
  timeSignature: TimeSignature;
  clef: Clef;
  voices: Voice[];
}
