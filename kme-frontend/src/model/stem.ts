export enum StemType {
  Whole = "Whole",
  Half = "Half",
  Quarter = "Quarter",
  Eight = "Eight",
  Sixteenth = "Sixteenth",
  Thirtysecond = "Thirtysecond",
  Sixtyfourth = "Sixtyfourth",
}

export interface Stem {
  stemType: StemType;
  metadataJson: string;
}
