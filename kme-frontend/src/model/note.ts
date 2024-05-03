export enum Accidental {
	DoubleFlat = "DoubleFlat",
	Flat = "Flat",
	None = "None",
	Natural = "Natural",
	Sharp = "Sharp",
	DoubleSharp = "DoubleSharp",
}

export interface Note {
	position: number;
	accidental: Accidental;
	metadata: string | null;
}
