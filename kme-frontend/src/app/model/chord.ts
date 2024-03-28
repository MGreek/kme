import { Note } from "./note";
import { Stem } from "./stem";

export interface Chord {
  stem: Stem,
  dotCount: number,
  metadata: string | null,
  notes: Note[],
}
