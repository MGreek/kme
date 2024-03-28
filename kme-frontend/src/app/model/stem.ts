enum StemType {
  Whole,
  Half,
  Quarter,
  Eight,
  Sixteenth,
  Thirtysecond,
  Sixtyfourth,
}

export interface Stem {
  stemType: StemType,
  metadata: string | null,
}
