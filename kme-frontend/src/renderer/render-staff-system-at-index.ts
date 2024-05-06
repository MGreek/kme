import {
  type Beam,
  BoundingBox,
  Formatter,
  type Modifier,
  type RenderContext,
  Stave,
  StaveConnector,
  type StemmableNote,
} from "vexflow";
import type { Staff } from "../model/staff";
import type { StaffSystem } from "../model/staff-system";
import {
  getClefNameFromClef,
  getKeySignatureNameFromKeySignature,
  getTimeSignatureStringFromTimeSignature,
  getVexStaveConnectorTypeFromConnectorType,
  getVexVoicesFromMeasure,
} from "../util/model-to-vexflow";
import { requireNotNull } from "../util/require-not-null";

export interface RenderOptions {
  x: number;
  y: number;
  defaultStaveWidth: number;
  defaultSystemGap: number;
  overrideYs: number[] | null;
  clear: boolean;
  drawConnector: boolean;
}

export function renderStaffSystemAtIndex(
  renderContext: RenderContext,
  staffSystem: StaffSystem,
  index: number,
  options: RenderOptions,
): {
  staves: Stave[];
  beams: Beam[];
  stemmableNotes: StemmableNote[];
  modifiers: Modifier[];
  connectors: StaveConnector[];
} {
  if (options.clear) {
    renderContext.clear();
  }

  if (staffSystem.staves.length === 0) {
    return {
      staves: [],
      beams: [],
      stemmableNotes: [],
      modifiers: [],
      connectors: [],
    };
  }

  if (staffSystem.staves.some((staff) => staff.measures[index] == null)) {
    throw new Error(`Measure does not exist at index ${index}`);
  }

  const staves = [];
  const beams = [];
  const stemmableNotes = [];
  const modifiers = [];
  let offsetY = options.y;
  for (const [staffIndex, staff] of staffSystem.staves.entries()) {
    const {
      stave: crtStave,
      beams: crtBeams,
      stemmableNotes: crtStemmableNotes,
      modifiers: crtModifiers,
    } = renderStaffAtIndex(
      renderContext,
      staff,
      index,
      options.x,
      options.overrideYs?.at(staffIndex) ?? offsetY,
      options.defaultStaveWidth,
    );
    staves.push(crtStave);
    beams.push(...crtBeams);
    stemmableNotes.push(...crtStemmableNotes);
    modifiers.push(...crtModifiers);

    const bounds = getBounds(crtStave, crtStemmableNotes);

    offsetY += options.defaultSystemGap + bounds.getH();
  }

  const topStave = requireNotNull(staves.at(0));
  const bottomStave = requireNotNull(staves.at(-1));

  const connectors = [];
  connectors.push(
    new StaveConnector(topStave, bottomStave)
      .setContext(renderContext)
      .setType("singleLeft"),
  );
  requireNotNull(connectors.at(-1)).draw();

  connectors.push(
    new StaveConnector(topStave, bottomStave)
      .setContext(renderContext)
      .setType("singleRight"),
  );
  requireNotNull(connectors.at(-1)).draw();

  if (options.drawConnector) {
    connectors.push(
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType(
          getVexStaveConnectorTypeFromConnectorType(
            staffSystem.metadata.connectorType,
          ),
        ),
    );
    requireNotNull(connectors.at(-1)).draw();
  }

  return { staves, beams, stemmableNotes, modifiers, connectors };
}

function getBoundingBoxFromDOMRect(rect: DOMRect): BoundingBox {
  return new BoundingBox(rect.x, rect.y, rect.width, rect.height);
}

function getBounds(crtStave: Stave, crtStemmableNotes: StemmableNote[]) {
  const staveRect = requireNotNull(
    crtStave.getSVGElement(),
  ).getBoundingClientRect();
  staveRect.x = crtStave.getX();
  staveRect.y = crtStave.getTopLineTopY();

  const noteRects = crtStemmableNotes.map((note) =>
    requireNotNull(note.getBoundingBox()),
  );

  const mergedBoundingBox = [
    getBoundingBoxFromDOMRect(staveRect),
    ...noteRects,
  ].reduce((prev, crt) => prev.mergeWith(crt));

  return mergedBoundingBox;
}

function renderStaffAtIndex(
  renderContext: RenderContext,
  staff: Staff,
  index: number,
  x: number,
  y: number,
  width: number,
): {
  stave: Stave;
  beams: Beam[];
  stemmableNotes: StemmableNote[];
  modifiers: Modifier[];
} {
  const measure = requireNotNull(staff.measures[index]);
  const { vexVoices, beams, stemmableNotes, modifiers } =
    getVexVoicesFromMeasure(renderContext, measure);

  const stave = new Stave(x, y, width).setContext(renderContext).draw();

  if (measure.metadata.drawClef) {
    stave.addClef(getClefNameFromClef(measure.clef));
  }
  if (measure.metadata.drawKeySignature) {
    stave.addKeySignature(
      getKeySignatureNameFromKeySignature(measure.keySignature),
    );
  }
  if (measure.metadata.drawTimeSignature) {
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

  return { stave, beams, stemmableNotes, modifiers };
}
