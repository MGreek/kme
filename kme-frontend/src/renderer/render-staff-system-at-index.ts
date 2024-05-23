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
  parseMeasureMetadata,
  parseStaffSystemMetadata,
} from "../util/metadata";
import {
  getClefNameFromClef,
  getKeySignatureNameFromKeySignature,
  getTimeSignatureStringFromTimeSignature,
  getVexStaveConnectorTypeFromConnectorType,
  getVexVoicesFromMeasure,
} from "../util/model-to-vexflow";
import { requireNotNull } from "../util/require-not-null";

export interface RenderOptions {
  stacking: CoordinatesStacking | GapStacking;
  defaultStaveWidth: number;
  clear: boolean;
  drawConnector: boolean;
  drawSingleLineLeft: boolean;
  drawSingleLineRight: boolean;
}

export interface CoordinatesStacking {
  x: number;
  ys: number[];
}

export interface GapStacking {
  x: number;
  y: number;
  gap: number;
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
  let offsetY = "y" in options.stacking ? options.stacking.y : null;
  for (const [staffIndex, staff] of staffSystem.staves.entries()) {
    let y = null;
    if ("y" in options.stacking) {
      y = offsetY;
    } else {
      y = options.stacking.ys.at(staffIndex);
    }
    y = requireNotNull(y);

    const {
      stave: crtStave,
      beams: crtBeams,
      stemmableNotes: crtStemmableNotes,
      modifiers: crtModifiers,
    } = renderStaffAtIndex(
      renderContext,
      staff,
      index,
      options.stacking.x,
      y,
      options.defaultStaveWidth,
    );
    staves.push(crtStave);
    beams.push(...crtBeams);
    stemmableNotes.push(...crtStemmableNotes);
    modifiers.push(...crtModifiers);

    const bounds = requireNotNull(getBounds([crtStave], crtStemmableNotes, []));

    if ("gap" in options.stacking && offsetY != null) {
      offsetY += options.stacking.gap + bounds.getH();
    }
  }

  const topStave = requireNotNull(staves.at(0));
  const bottomStave = requireNotNull(staves.at(-1));

  const connectors = [];

  if (options.drawSingleLineLeft) {
    connectors.push(
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType("singleLeft"),
    );
    requireNotNull(connectors.at(-1)).draw();
  }

  if (options.drawSingleLineRight) {
    connectors.push(
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType("singleRight"),
    );
    requireNotNull(connectors.at(-1)).draw();
  }

  if (options.drawConnector) {
    connectors.push(
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType(
          getVexStaveConnectorTypeFromConnectorType(
            parseStaffSystemMetadata(staffSystem).connectorType,
          ),
        ),
    );
    requireNotNull(connectors.at(-1)).draw();
  }

  return { staves, beams, stemmableNotes, modifiers, connectors };
}

export function getBounds(
  staves: Stave[],
  stemmableNotes: StemmableNote[],
  connectors: StaveConnector[],
): BoundingBox | null {
  let boundingBox: BoundingBox | null = null;

  for (const stave of staves) {
    const staveRect = stave.getBoundingBox();

    if (boundingBox != null) {
      boundingBox = boundingBox.mergeWith(staveRect);
    } else {
      boundingBox = staveRect;
    }
  }

  for (const stemmableNote of stemmableNotes) {
    const stemmableNoteRect = requireNotNull(stemmableNote.getBoundingBox());

    if (boundingBox != null) {
      boundingBox = boundingBox.mergeWith(stemmableNoteRect);
    } else {
      boundingBox = stemmableNoteRect;
    }
  }

  for (const connector of connectors) {
    const topStave = connector.top_stave;
    const bottomStave = connector.bottom_stave;
    let connectorRect: BoundingBox | null = null;
    if (connector.getType() === StaveConnector.type.BRACE) {
      // TODO: use something other than hardcoded width
      const hardcodedWidth = 15;
      connectorRect = new BoundingBox(
        topStave.getX() - hardcodedWidth,
        topStave.getYForLine(0),
        hardcodedWidth,
        bottomStave.getYForLine(4) - topStave.getYForLine(0),
      );
    } else if (connector.getType() === StaveConnector.type.SINGLE_RIGHT) {
      // TODO: use something other than hardcoded width
      const hardcodedWidth = 1;
      connectorRect = new BoundingBox(
        topStave.getX() + topStave.getWidth(),
        topStave.getYForLine(0),
        hardcodedWidth,
        bottomStave.getYForLine(4) - topStave.getYForLine(0),
      );
    } else if (connector.getType() === StaveConnector.type.SINGLE_LEFT) {
      // TODO: use something other than hardcoded width
      const hardcodedWidth = 1;
      connectorRect = new BoundingBox(
        topStave.getX() - hardcodedWidth,
        topStave.getYForLine(0),
        hardcodedWidth,
        bottomStave.getYForLine(4) - topStave.getYForLine(0),
      );
    }

    if (connectorRect == null) {
      continue;
    }

    if (boundingBox != null) {
      boundingBox = boundingBox.mergeWith(connectorRect);
    } else {
      boundingBox = connectorRect;
    }
  }

  return boundingBox;
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

  return { stave, beams, stemmableNotes, modifiers };
}
