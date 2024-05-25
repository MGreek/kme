import {
  Beam,
  type Modifier,
  type RenderContext,
  StaveNote,
  type StemmableNote,
  Accidental as VexAccidental,
  type StaveConnectorType as VexStaveConnectorType,
  Voice as VexVoice,
} from "vexflow";
import type { Grouping } from "../model/grouping";
import {
  Clef,
  KeySignature,
  type Measure,
  TimeSignature,
} from "../model/measure";
import { Accidental } from "../model/note";
import { RestType } from "../model/rest";
import { ConnectorType } from "../model/staff-system";
import { StemType } from "../model/stem";
import type { Voice } from "../model/voice";
import { requireNotNull } from "./require-not-null";

export function getDurationFromRestType(restType: RestType): string {
  switch (restType) {
    case RestType.Whole:
      return "w";
    case RestType.Half:
      return "h";
    case RestType.Quarter:
      return "q";
    case RestType.Eight:
      return "8";
    case RestType.Sixteenth:
      return "16";
    case RestType.Thirtysecond:
      return "32";
    case RestType.Sixtyfourth:
      return "64";
    default:
      throw new Error("Switch statement didn't cover everything");
  }
}

export function getDurationFromStemType(stemType: StemType): string {
  switch (stemType) {
    case StemType.Whole:
      return "w";
    case StemType.Half:
      return "h";
    case StemType.Quarter:
      return "q";
    case StemType.Eight:
      return "8";
    case StemType.Sixteenth:
      return "16";
    case StemType.Thirtysecond:
      return "32";
    case StemType.Sixtyfourth:
      return "64";
    default:
      throw new Error("Switch statement didn't cover everything");
  }
}

export function getAccidentalNameFromAccidental(
  accidental: Accidental,
): string {
  switch (accidental) {
    case Accidental.DoubleFlat:
      return "bb";
    case Accidental.Flat:
      return "b";
    case Accidental.None:
      return "";
    case Accidental.Natural:
      return "n";
    case Accidental.Sharp:
      return "#";
    case Accidental.DoubleSharp:
      return "##";
    default:
      throw new Error("Switch statement didn't cover everything");
  }
}

export function getClefNameFromClef(clef: Clef): string {
  switch (clef) {
    case Clef.Treble:
      return "treble";
    case Clef.Alto:
      return "alto";
    case Clef.Bass:
      return "bass";
    default:
      throw new Error("Switch statement didn't cover everything");
  }
}

export function getKeySignatureNameFromKeySignature(
  keySignature: KeySignature,
): string {
  switch (keySignature) {
    case KeySignature.Flat7:
      return "Cb";
    case KeySignature.Flat6:
      return "Gb";
    case KeySignature.Flat5:
      return "Db";
    case KeySignature.Flat4:
      return "Ab";
    case KeySignature.Flat3:
      return "Eb";
    case KeySignature.Flat2:
      return "Bb";
    case KeySignature.Flat1:
      return "F";
    case KeySignature.None:
      return "C";
    case KeySignature.Sharp1:
      return "G";
    case KeySignature.Sharp2:
      return "D";
    case KeySignature.Sharp3:
      return "A";
    case KeySignature.Sharp4:
      return "E";
    case KeySignature.Sharp5:
      return "B";
    case KeySignature.Sharp6:
      return "F#";
    case KeySignature.Sharp7:
      return "C#";
    default:
      throw new Error("Switch statement didn't cover everything");
  }
}

export function getTimeSignatureStringFromTimeSignature(
  timeSignature: TimeSignature,
) {
  switch (timeSignature) {
    case TimeSignature.Common:
      return "4/4";
    case TimeSignature.FourFour:
      return "4/4";
    case TimeSignature.ThreeFour:
      return "3/4";
    case TimeSignature.TwoFour:
      return "2/4";
    default:
      throw new Error("Switch statement didn't cover everything");
  }
}

export function getNoteOffsetFromClef(clef: Clef) {
  switch (clef) {
    case Clef.Treble:
      return 0;
    case Clef.Alto:
      return 6;
    case Clef.Bass:
      return 12;
    default:
      throw new Error("Switch statement didn't cover everything");
  }
}

export function getKeyFromPosition(position: number): string {
  const octaveOffset = 4;
  const notes = ["c", "d", "e", "f", "g", "a", "b"];

  const name = requireNotNull(
    notes.at(((position % notes.length) + notes.length) % notes.length),
  );
  const octave = position / notes.length + octaveOffset;
  if (octave < 0) {
    throw new Error("Octave must be non-negative");
  }

  return [name, octave.toString()].join("/");
}

export function getVexStemmableNotesFromGrouping(
  renderContext: RenderContext,
  grouping: Grouping,
  noteOffset: number,
): { stemmableNotes: StemmableNote[]; modifiers: Modifier[] } {
  const stemmableNotes = [];
  const modifiers = [];
  for (const groupingEntry of grouping.groupingEntries) {
    if (groupingEntry.rest != null) {
      const rest = groupingEntry.rest;
      const staveNote = new StaveNote({
        keys: [getKeyFromPosition(rest.position + noteOffset)],
        type: "r",
        duration: getDurationFromRestType(rest.restType),
      }).setContext(renderContext);
      stemmableNotes.push(staveNote);
    } else if (groupingEntry.chord != null) {
      const chord = groupingEntry.chord;
      const staveNote = new StaveNote({
        keys: chord.notes.map((note) =>
          getKeyFromPosition(note.noteId.position + noteOffset),
        ),
        duration: getDurationFromStemType(chord.stem.stemType),
        auto_stem: true,
      }).setContext(renderContext);
      for (const [index, note] of chord.notes.entries()) {
        const accidental = getAccidentalNameFromAccidental(note.accidental);
        if (accidental !== "") {
          const vexAccidental = new VexAccidental(accidental)
            .setContext(renderContext)
            .setNote(staveNote)
            .setIndex(index);
          modifiers.push(vexAccidental);
          staveNote.addModifier(vexAccidental);
        }
      }
      stemmableNotes.push(staveNote);
    }
  }
  return { stemmableNotes, modifiers };
}

function tryBeamNotes(
  renderContext: RenderContext,
  notes: StemmableNote[],
): Beam[] {
  const beamableDurations = ["8", "16", "32", "64"];

  const beams = [];
  let [first, last] = [-1, -1];
  for (const [index, note] of notes.entries()) {
    const isBeamable = beamableDurations.includes(note.getDuration());
    if (isBeamable) {
      if (first === -1) {
        first = index;
      }
      last = index;
    }
    if ((!isBeamable || index + 1 === notes.length) && last - first + 1 > 1) {
      const beam = new Beam(notes.slice(first, last + 1), true).setContext(
        renderContext,
      );
      beams.push(beam);
      [first, last] = [-1, -1];
    }
  }
  return beams;
}

export function connectorTypeToVex(
  connectorType: ConnectorType,
): VexStaveConnectorType {
  switch (connectorType) {
    case ConnectorType.None:
      return "none";
    case ConnectorType.Brace:
      return "brace";
    case ConnectorType.Bracket:
      return "bracket";
    default:
      throw new Error("Switch statement didn't cover everything");
  }
}

export function getStemmableNotesFromVoice(
  renderContext: RenderContext,
  voice: Voice,
  noteOffset: number,
): {
  beams: Beam[];
  stemmableNotes: StemmableNote[];
  modifiers: Modifier[];
} {
  const stemmableNotes = [];
  const beams = [];
  const modifiers = [];
  for (const grouping of voice.groupings) {
    const { stemmableNotes: crtStemmableNotes, modifiers: crtModifiers } =
      getVexStemmableNotesFromGrouping(renderContext, grouping, noteOffset);
    stemmableNotes.push(...crtStemmableNotes);
    modifiers.push(...crtModifiers);

    const crtBeams = tryBeamNotes(renderContext, crtStemmableNotes);
    beams.push(...crtBeams);
  }
  return { stemmableNotes, beams, modifiers };
}

export function getVexVoicesFromMeasure(
  renderContext: RenderContext,
  measure: Measure,
): {
  vexVoices: VexVoice[];
  beams: Beam[];
  stemmableNotes: StemmableNote[];
  modifiers: Modifier[];
} {
  const noteOffset = getNoteOffsetFromClef(measure.clef);
  const vexVoices = [];
  const beams = [];
  const stemmableNotes = [];
  const modifiers = [];
  for (const voice of measure.voices) {
    const {
      beams: crtBeams,
      stemmableNotes: crtStemmableNotes,
      modifiers: crtModifiers,
    } = getStemmableNotesFromVoice(renderContext, voice, noteOffset);

    beams.push(...crtBeams);
    stemmableNotes.push(...crtStemmableNotes);
    modifiers.push(...crtModifiers);

    const vexVoice = new VexVoice().setStrict(false).setContext(renderContext);
    vexVoice.addTickables(crtStemmableNotes);
    vexVoices.push(vexVoice);
  }

  return { vexVoices, beams, stemmableNotes: stemmableNotes, modifiers };
}
