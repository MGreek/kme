import type { Note } from "./note";
import type { Stem } from "./stem";

export interface Chord {
  stem: Stem;
  dotCount: number;
  metadata: string | null;
  notes: Note[];
}
