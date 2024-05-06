import { useCallback } from "react";
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
  type CoordinatesStacking,
  type GapStacking,
  type RenderOptions,
  renderStaffSystemAtIndex,
} from "../renderer/render-staff-system-at-index";
import { requireNotNull } from "../util/require-not-null";

interface ChunkProps {
  staffSystem: StaffSystem;
  chunkIndex: number;
  bounds: DOMRect;
  overrideYs: number[] | null;
  onOutOfBounds:
    | ((
        chunkIndex: number,
        widthExceeded: boolean,
        heightExceded: boolean,
      ) => void)
    | null;
  onRender: ((chunkIndex: number, coordsY: number[]) => void) | null;
}

export default function Chunk({
  staffSystem,
  chunkIndex,
  bounds,
  overrideYs,
  onOutOfBounds,
  onRender,
}: ChunkProps) {
  function renderAtIndex(div: HTMLDivElement) {
    if (staffSystem.staves.length === 0) {
      return;
    }

    let stacking: GapStacking | CoordinatesStacking | null = null;
    if (overrideYs == null) {
      stacking = { x: 0, y: 0, gap: 0 };
    } else {
      stacking = { x: 0, ys: overrideYs };
    }
    stacking = requireNotNull(stacking);

    const options: RenderOptions = {
      stacking,
      defaultStaveWidth: 350,
      clear: true,
      drawConnector: chunkIndex === 0,
      overrideYs: overrideYs,
    };

    const renderContext = new SVGContext(div);
    const { offsetX, offsetY } = getOffsets(
      renderContext,
      staffSystem,
      chunkIndex,
      options,
    );
    if ("y" in options.stacking) {
      options.stacking.x = offsetX;
      options.stacking.y = offsetY;
    } else {
      options.stacking.x = offsetX;
    }

    const { staves, stemmableNotes, connectors } = renderStaffSystemAtIndex(
      renderContext,
      staffSystem,
      chunkIndex,
      options,
    );

    const bounds = requireNotNull(
      getBounds(staves, stemmableNotes, connectors),
    );

    const renderWidth = bounds.getX() + bounds.getW();
    const renderHeight = bounds.getY() + bounds.getH();

    renderContext.resize(renderWidth, renderHeight);

    div.style.width = `${renderWidth}px`;
    div.style.height = `${renderHeight}px`;

    const coordsY: number[] = [];
    for (const stave of staves) {
      coordsY.push(stave.getY());
    }
    if (onRender != null) {
      onRender(chunkIndex, coordsY);
    }
  }

  const doRenderRef = useCallback(
    (div: HTMLDivElement | null) => {
      if (div == null) {
        return;
      }
      renderAtIndex(div);
      const rect = div.getBoundingClientRect();

      const widthExceeded = rect.x + rect.width > bounds.x + bounds.width;
      const heightExceeded = rect.y + rect.height > bounds.y + bounds.height;
      if (widthExceeded || heightExceeded) {
        if (onOutOfBounds != null) {
          onOutOfBounds(chunkIndex, widthExceeded, heightExceeded);
        }
      }
    },
    [renderAtIndex, onOutOfBounds, chunkIndex, bounds],
  );

  return <div ref={doRenderRef} />;
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
  index: number,
  options: RenderOptions,
): { offsetX: number; offsetY: number } {
  const { staves, stemmableNotes, connectors } = renderStaffSystemAtIndex(
    renderContext,
    staffSystem,
    index,
    options,
  );

  const bounds = getBounds(staves, stemmableNotes, connectors);
  return {
    offsetX: -requireNotNull(bounds).getX(),
    offsetY: -requireNotNull(bounds).getY(),
  };
}
