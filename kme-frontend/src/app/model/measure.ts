import { Voice } from "./voice";

enum KeySignature {
  Flat7,
  Flat6,
  Flat5,
  Flat4,
  Flat3,
  Flat2,
  Flat1,
  None,
  Sharp1,
  Sharp2,
  Sharp3,
  Sharp4,
  Sharp5,
  Sharp6,
  Sharp7,
}

enum TimeSignature {
  Common,
  FourFour,
  ThreeFour,
  TwoFour,
}

enum Clef {
  Treble,
  Alto,
  Bass,
}

export interface Measure {
  measuresOrder: number,
  metadata: string | null,
  keySignature: KeySignature,
  timeSignature: TimeSignature,
  clef: Clef,
  voices: Voice[],
}
