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
  type RenderOptions,
  renderStaffSystemAtIndex,
} from "../renderer/render-staff-system-at-index";
import { requireNotNull } from "../util/require-not-null";

interface ChunkProps {
  staffSystem: StaffSystem;
  chunkIndex: number;
  bounds: DOMRect;
  onOutOfBounds: (
    chunkIndex: number,
    widthExceeded: boolean,
    heightExceded: boolean,
  ) => void;
}

export default function Chunk({
  staffSystem,
  chunkIndex,
  onOutOfBounds,
  bounds,
}: ChunkProps) {
  function renderAtIndex(div: HTMLDivElement) {
    if (staffSystem.staves.length === 0) {
      return;
    }

    const options: RenderOptions = {
      x: 0,
      y: 0,
      defaultStaveWidth: 350,
      defaultSystemGap: 0,
      clear: true,
      drawConnector: true,
    };

    const renderContext = new SVGContext(div);
    const { offsetX, offsetY } = getOffsets(
      renderContext,
      staffSystem,
      chunkIndex,
      options,
    );
    options.x = offsetX;
    options.y = offsetY;

    const { staves, stemmableNotes, connectors } = renderStaffSystemAtIndex(
      renderContext,
      staffSystem,
      chunkIndex,
      options,
    );

    const bounds = requireNotNull(
      getBounds(staves, stemmableNotes, connectors),
    );

    renderContext.resize(bounds.getW(), bounds.getH());

    div.style.width = `${bounds.getW()}px`;
    div.style.height = `${bounds.getH()}px`;
  }

  const doRenderRef = useCallback(
    (div: HTMLDivElement | null) => {
      if (div != null) {
        renderAtIndex(div);
        const rect = div.getBoundingClientRect();

        const widthExceeded = rect.x + rect.width > bounds.x + bounds.width;
        const heightExceeded = rect.y + rect.height > bounds.y + bounds.height;
        if (widthExceeded || heightExceeded) {
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