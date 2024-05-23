import { useEffect, useRef } from "react";
import { type RenderContext, SVGContext } from "vexflow";
import type { StaffSystem } from "../model/staff-system";
import {
  type RenderOptions,
  renderStaffSystemAtIndex,
  getBounds,
} from "../renderer/render-staff-system-at-index";
import { requireNotNull } from "../util/require-not-null";

interface ChunkProps {
  staffSystem: StaffSystem;
  stavesYs: number[] | null;
  drawConnector: boolean;
  drawSingleLineLeft: boolean;
  drawSingleLineRight: boolean;
  onRender:
  | ((
    width: number,
    height: number,
    chunkStavesYs: number[],
    drawConnector: boolean,
    drawSingleLineLeft: boolean,
    drawSingleLineRight: boolean,
  ) => void)
  | null;
}

export default function Chunk({
  staffSystem,
  stavesYs,
  drawConnector,
  drawSingleLineLeft,
  drawSingleLineRight,
  onRender,
}: ChunkProps) {
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
    const stacking =
      stavesYs != null ? { x: 0, ys: stavesYs } : { x: 0, y: 0, gap: 20 };
    const options = {
      stacking,
      defaultStaveWidth: 350,
      clear: true,
      drawConnector: drawConnector,
      drawSingleLineLeft: drawSingleLineLeft,
      drawSingleLineRight: drawSingleLineRight,
    };

    const { offsetX, offsetY } = getOffsets(
      renderContext,
      staffSystem,
      options,
    );

    options.stacking.x = offsetX;
    if ("y" in options.stacking) {
      options.stacking.y = offsetY;
    } else {
      options.stacking.ys = options.stacking.ys.map((y) => y + offsetY);
    }

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

    if (onRender != null) {
      const chunkStavesYs = [];
      for (const stave of staves) {
        chunkStavesYs.push(stave.getY());
      }
      onRender(
        width,
        height,
        chunkStavesYs,
        options.drawConnector,
        options.drawSingleLineLeft,
        options.drawSingleLineRight,
      );
    }
  }, [
    staffSystem,
    stavesYs,
    onRender,
    drawConnector,
    drawSingleLineRight,
    drawSingleLineLeft,
  ]);

  return <div ref={divRef} />;
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
    offsetY: "ys" in options.stacking ? 0 : -requireNotNull(bounds).getY(),
  };
}
