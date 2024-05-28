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
}: {
  staffSystem: StaffSystem;
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

    const svg = requireNotNull(div.children.item(0));
    if (!(svg instanceof SVGElement)) {
      throw new Error("Expected divRef to have svg child on first position");
    }

    const unsavedElements = Array.from(svg.children).filter(
      (element) => !savedElementIdsRef.current.has(element.id),
    );
    for (const element of unsavedElements) {
      svg.removeChild(element);
    }
    crtElementIdsRef.current.clear();
  }, []);

  const drawStaffSystemAtIndexRef = useCallback(
    (
      renderContext: RenderContext,
      shiftX: number,
      shiftY: number,
      measureIndex: number,
      drawConnector: boolean,
      drawLeftLine: boolean,
      drawRightLine: boolean,
      overridenStavesYs: number[] | null,
    ) => {
      const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);

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
          const bounds = requireNotNull(getNewElementsBoundsRef(false));
          stavesXs.push(-bounds.x);
          stavesYs.push(y - bounds.y);
          y += bounds.h + staffSystemMetadata.gap;
        }
      }

      if (overridenStavesYs != null) {
        stavesYs = overridenStavesYs.map((y) => y);
      }

      let topStave = requireNotNull(vexStaves.at(0));
      let bottomStave = requireNotNull(vexStaves.at(-1));

      if (drawConnector) {
        removeUnsavedRef();
        new StaveConnector(topStave, bottomStave)
          .setContext(renderContext)
          .setType(connectorTypeToVex(staffSystemMetadata.connectorType))
          .draw();
        const connectorBounds = getNewElementsBoundsRef(false);
        if (connectorBounds != null) {
          stavesXs = stavesXs.map((x) => -Math.min(x, connectorBounds.x));
        }
      }

      // begin rendering the real deal
      removeUnsavedRef();
      vexStaves = [];
      for (const [index, staff] of staffSystem.staves.entries()) {
        vexStaves.push(
          renderStaffAtIndex(
            renderContext,
            staff,
            measureIndex,
            requireNotNull(stavesXs[index]) + shiftX,
            requireNotNull(stavesYs[index]) + shiftY,
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
      const totalBounds = getNewElementsBoundsRef(true);
      const width = (totalBounds?.x ?? 0) + (totalBounds?.w ?? 0);
      const height = (totalBounds?.y ?? 0) + (totalBounds?.h ?? 0);

      return { width, height, stavesYs };
    },
    [staffSystem, getNewElementsBoundsRef, removeUnsavedRef],
  );

  useEffect(() => {
    if (divRef.current == null) {
      return;
    }

    if (staffSystem.staves.length === 0) {
      return;
    }

    const div = divRef.current;
    const renderContext = new SVGContext(div);
    const { width, height } = drawStaffSystemAtIndexRef(
      renderContext,
      100,
      0,
      0,
      true,
      true,
      true,
      null,
    );
    renderContext.resize(width, height);
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
  }, [staffSystem, drawStaffSystemAtIndexRef]);

  return <div className="bg-red-300" ref={divRef} />;
}
