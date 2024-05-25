import { Formatter, type RenderContext, Stave } from "vexflow";
import type { Staff } from "../model/staff";
import { parseMeasureMetadata } from "../util/metadata";
import {
  getClefNameFromClef,
  getKeySignatureNameFromKeySignature,
  getTimeSignatureStringFromTimeSignature,
  getVexVoicesFromMeasure,
} from "../util/model-to-vexflow";
import { requireNotNull } from "../util/require-not-null";

export interface RenderOptions {
  stavesYs: number[];
  defaultStaveWidth: number;
  clear: boolean;
  drawConnector: boolean;
  drawSingleLineLeft: boolean;
  drawSingleLineRight: boolean;
}

export function renderStaffAtIndex(
  renderContext: RenderContext,
  staff: Staff,
  index: number,
  x: number,
  y: number,
): Stave {
  // TODO: use width from metadata not hardcoded value
  const width = 350;
  const measure = requireNotNull(staff.measures[index]);
  const { vexVoices, beams } = getVexVoicesFromMeasure(renderContext, measure);

  const stave = new Stave(x, y, width, {
    space_below_staff_ln: 0,
    space_above_staff_ln: 0,
  })
    .setContext(renderContext)
    .draw();

  const measureMetadata = parseMeasureMetadata(measure);

  if (measureMetadata.drawClef) {
    stave.addClef(getClefNameFromClef(measure.clef));
  }
  if (measureMetadata.drawKeySignature) {
    stave.addKeySignature(
      getKeySignatureNameFromKeySignature(measure.keySignature),
    );
  }
  if (measureMetadata.drawTimeSignature) {
    stave.addTimeSignature(
      getTimeSignatureStringFromTimeSignature(measure.timeSignature),
    );
  }
  stave.draw();

  new Formatter()
    .joinVoices(vexVoices)
    .formatToStave(vexVoices, stave, { context: renderContext });

  for (const vexVoice of vexVoices) {
    vexVoice.draw(renderContext, stave);
  }

  for (const beam of beams) {
    beam.draw();
  }

  return stave;
}
