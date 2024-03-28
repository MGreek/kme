enum RestType {
  Whole,
  Half,
  Quarter,
  Eight,
  Sixteenth,
  Thirtysecond,
  Sixtyfourth,
}

export interface Rest {
  restType: RestType,
  metadata: string | null,
}
