import { useEffect, useRef } from "react";
import {
  BoundingBox,
  type RenderContext,
  SVGContext,
  type Stave,
  StaveConnector,
  type StemmableNote,
} from "vexflow";
import type { StaffSystem } from "../model/staff-system";
import {
  type RenderOptions,
  renderStaffSystemAtIndex,
} from "../renderer/render-staff-system-at-index";
import { requireNotNull } from "../util/require-not-null";

interface ChunkProps {
  staffSystem: StaffSystem;
  onRender:
  | ((width: number, height: number, chunkStavesYs: number[]) => void)
  | null;
}

export default function Chunk({ staffSystem, onRender }: ChunkProps) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = divRef.current;
    if (div == null) {
      throw new Error("divRef should be initialized.");
    }

    if (staffSystem.staves.some((stave) => stave.measures.length !== 1)) {
      throw new Error(
        "The staff system should have exactly one measure for each stave.",
      );
    }

    const renderContext = new SVGContext(div);
    const options = {
      stacking: { x: 0, y: 0, gap: 20 }, // TODO: make `gap` a prop
      defaultStaveWidth: 350,
      clear: true,
      drawConnector: false,
    };

    const { offsetX, offsetY } = getOffsets(
      renderContext,
      staffSystem,
      options,
    );

    options.stacking.x = offsetX;
    options.stacking.y = offsetY;

    const { staves, stemmableNotes, connectors } = renderStaffSystemAtIndex(
      renderContext,
      staffSystem,
      0,
      options,
    );

    const bounds = requireNotNull(
      getBounds(staves, stemmableNotes, connectors),
    );

    const width = bounds.getX() + bounds.getW();
    const height = bounds.getY() + bounds.getH();

    renderContext.resize(width, height);
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    div.style.background = "white";

    if (onRender != null) {
      const chunkStavesYs = [];
      for (const stave of staves) {
        chunkStavesYs.push(stave.getY());
      }
      onRender(width, height, chunkStavesYs);
    }
  }, [staffSystem, onRender]);

  return <div ref={divRef} />;
}

function getBoundingBoxFromDOMRect(rect: DOMRect): BoundingBox {
  return new BoundingBox(rect.x, rect.y, rect.width, rect.height);
}

function getBounds(
  staves: Stave[],
  stemmableNotes: StemmableNote[],
  connectors: StaveConnector[],
): BoundingBox | null {
  let boundingBox: BoundingBox | null = null;

  for (const stave of staves) {
    const staveRect = getBoundingBoxFromDOMRect(
      requireNotNull(stave.getSVGElement()).getBoundingClientRect(),
    );
    staveRect.x = stave.getX();
    staveRect.y = stave.getTopLineTopY();

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

function getOffsets(
  renderContext: RenderContext,
  staffSystem: StaffSystem,
  options: RenderOptions,
): { offsetX: number; offsetY: number } {
  const { staves, stemmableNotes, connectors } = renderStaffSystemAtIndex(
    renderContext,
    staffSystem,
    0,
    options,
  );

  const bounds = getBounds(staves, stemmableNotes, connectors);
  return {
    offsetX: -requireNotNull(bounds).getX(),
    offsetY: -requireNotNull(bounds).getY(),
  };
}
