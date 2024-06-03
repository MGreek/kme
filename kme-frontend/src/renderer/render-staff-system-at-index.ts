import { Formatter, type RenderContext, Stave } from "vexflow";
import type { Staff } from "../model/staff";
import { parseMeasureMetadata, parseStaffMetadata } from "../util/metadata";
import {
  getClefNameFromClef,
  getKeySignatureNameFromKeySignature,
  getTimeSignatureStringFromTimeSignature,
  getVexVoicesFromMeasure,
} from "../util/model-to-vexflow";
import { requireNotNull } from "../util/require-not-null";

export function renderStaffAtIndex(
  renderContext: RenderContext,
  staff: Staff,
  index: number,
  x: number,
  y: number,
): Stave {
  const staffMetadata = parseStaffMetadata(staff);

  const measure = requireNotNull(staff.measures[index]);
  const { vexVoices, beams } = getVexVoicesFromMeasure(renderContext, measure);

  const stave = new Stave(x, y, staffMetadata.width, {
    space_below_staff_ln: 0,
    space_above_staff_ln: 0,
    left_bar: false,
    right_bar: false,
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
