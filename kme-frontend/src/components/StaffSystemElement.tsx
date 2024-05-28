import { useCallback, useEffect, useRef } from "react";
import {
  BoundingBox,
  type RenderContext,
  SVGContext,
  StaveConnector,
} from "vexflow";
import type { StaffSystem } from "../model/staff-system";
import { renderStaffAtIndex } from "../renderer/render-staff-system-at-index";
import { parseStaffSystemMetadata } from "../util/metadata";
import { connectorTypeToVex } from "../util/model-to-vexflow";
import { requireNotNull } from "../util/require-not-null";

export default function StaffSystemElement({
  staffSystem,
  measureIndex,
  drawConnector,
  drawLeftLine,
  drawRightLine,
  overridenStavesYs,
  onRender,
}: {
  staffSystem: StaffSystem;
  measureIndex: number;
  drawConnector: boolean;
  drawLeftLine: boolean;
  drawRightLine: boolean;
  overridenStavesYs: number[] | null;
  onRender:
    | ((width: number, height: number, stavesYs: number[]) => void)
    | null;
}) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const crtElementIdsRef = useRef<Set<string>>(new Set<string>());
  const savedElementIdsRef = useRef<Set<string>>(new Set<string>());

  const collectNewElementsRef = useCallback((save: boolean) => {
    const div = requireNotNull(
      divRef.current,
      "Expected divRef to be initialized",
    );

    const svg = requireNotNull(div.children.item(0));
    if (!(svg instanceof SVGElement)) {
      throw new Error("Expected divRef to have svg child on first position");
    }

    const newElements = Array.from(svg.children).filter(
      (element) =>
        !savedElementIdsRef.current.has(element.id) &&
        !crtElementIdsRef.current.has(element.id),
    );
    for (const newElement of newElements) {
      if (save) {
        savedElementIdsRef.current.add(newElement.id);
      }
      crtElementIdsRef.current.add(newElement.id);
    }
    return newElements;
  }, []);

  const getNewElementsBoundsRef = useCallback(
    (save: boolean) => {
      const div = requireNotNull(
        divRef.current,
        "Expected divRef to be initialized",
      );

      const toBoudingBox = (rect: DOMRect) =>
        new BoundingBox(rect.x, rect.y, rect.width, rect.height);

      const divRect = toBoudingBox(div.getBoundingClientRect());

      const normalize = (rect: DOMRect) => {
        const bb = toBoudingBox(rect);
        bb.x -= divRect.x;
        bb.y -= divRect.y;
        return bb;
      };

      const elements = collectNewElementsRef(save);
      const boundingBox = elements
        .map((element) => normalize(element.getBoundingClientRect()))
        .reduce(
          (prev: BoundingBox | null, crt) => prev?.mergeWith(crt) ?? crt,
          null,
        );
      return boundingBox;
    },
    [collectNewElementsRef],
  );

  const removeUnsavedRef = useCallback(() => {
    const div = requireNotNull(
      divRef.current,
      "Expected divRef to be initialized",
    );

  useEffect(() => {
    if (divRef.current == null) {
      return;
    }

    if (staffSystem.staves.length === 0) {
      return;
    }

    if (
      staffSystem.staves.some(
        (staff) => staff.measures.at(measureIndex) == null,
      )
    ) {
      throw new Error(
        `All staves must have a measure at index: ${measureIndex}`,
      );
    }

    if (
      overridenStavesYs != null &&
      staffSystem.staves.length !== overridenStavesYs.length
    ) {
      throw new Error("stavesYs and staffSystem.staves have different lengths");
    }

    if (
      overridenStavesYs?.some((y, index, stavesYs) => {
        if (index > 0) {
          return y < requireNotNull(stavesYs[index - 1]);
        }
        return false;
      })
    ) {
      throw new Error("stavesYs must be sorted ascendingly");
    }

    const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);

    let renderContext = new SVGContext(divRef.current);
    let vexStaves = [];
    let stavesXs = [];
    let stavesYs = [];
    // outer block used for limiting variables' scope
    {
      let y = 0;
      for (const staff of staffSystem.staves) {
        vexStaves.push(
          renderStaffAtIndex(renderContext, staff, measureIndex, 0, 0),
        );
        const bounds = requireNotNull(getNewElementsBounds());
        stavesXs.push(-bounds.x);
        stavesYs.push(y - bounds.y);
        y += bounds.h + staffSystemMetadata.gap;
        renderContext = clearAndNewContext(renderContext);
      }
    }

    if (overridenStavesYs != null) {
      stavesYs = [...overridenStavesYs];
    }

    let topStave = requireNotNull(vexStaves.at(0));
    let bottomStave = requireNotNull(vexStaves.at(-1));

    if (drawConnector) {
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType(connectorTypeToVex(staffSystemMetadata.connectorType))
        .draw();
      const connectorBounds = getNewElementsBounds();
      if (connectorBounds != null) {
        stavesXs = stavesXs.map((x) => -Math.min(x, connectorBounds.x));
      }
    }
    if (drawLeftLine) {
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType("singleLeft")
        .draw();
      const connectorBounds = getNewElementsBounds();
      if (connectorBounds != null) {
        stavesXs = stavesXs.map((x) => -Math.min(x, connectorBounds.x));
      }
    }

    // begin rendering the real deal
    renderContext = clearAndNewContext(renderContext);
    vexStaves = [];
    for (const [index, staff] of staffSystem.staves.entries()) {
      vexStaves.push(
        renderStaffAtIndex(
          renderContext,
          staff,
          measureIndex,
          requireNotNull(stavesXs[index]),
          requireNotNull(stavesYs[index]),
        ),
      );
    }

    topStave = requireNotNull(vexStaves.at(0));
    bottomStave = requireNotNull(vexStaves.at(-1));

    if (drawConnector) {
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType(connectorTypeToVex(staffSystemMetadata.connectorType))
        .draw();
    }
    if (drawLeftLine) {
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType("singleLeft")
        .draw();
    }
    if (drawRightLine) {
      new StaveConnector(topStave, bottomStave)
        .setContext(renderContext)
        .setType("singleRight")
        .draw();
    }

    const totalBounds = getNewElementsBounds();
    const width = (totalBounds?.x ?? 0) + (totalBounds?.w ?? 0);
    const height = (totalBounds?.y ?? 0) + (totalBounds?.h ?? 0);

    renderContext.resize(width, height);
    const div = divRef.current;
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;

    if (onRender != null) {
      onRender(width, height, stavesYs);
    }
  }, [
    staffSystem,
    measureIndex,
    drawConnector,
    drawLeftLine,
    drawRightLine,
    overridenStavesYs,
    onRender,
    getNewElementsBounds,
    clearAndNewContext,
  ]);

  return <div className="bg-red-300" ref={divRef} />;
}
