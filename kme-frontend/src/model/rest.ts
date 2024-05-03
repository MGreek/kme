export enum RestType {
	Whole = "Whole",
	Half = "Half",
	Quarter = "Quarter",
	Eight = "Eight",
	Sixteenth = "Sixteenth",
	Thirtysecond = "Thirtysecond",
	Sixtyfourth = "Sixtyfourth",
}

export interface Rest {
	restType: RestType;
	position: number;
	metadata: string | null;
}
