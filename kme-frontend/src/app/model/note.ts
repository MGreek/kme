enum Accidental {
  DoubleFlat,
  Flat,
  None,
  Natural,
  Sharp,
  DoubleSharp,
}

export interface Note {
  position: number,
  accidental: Accidental,
  metadata: string | null,
}
