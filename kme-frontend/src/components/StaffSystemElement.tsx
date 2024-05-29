import { useCallback, useEffect, useRef, useState } from "react";
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
import { getStaffSystemMeasureCount } from "../util/misc";

const SCALE = 4;
const RAW_PAGE_WIDTH = 210 * SCALE;
const RAW_PAGE_HEIGHT = 297 * SCALE;

interface RowDescription {
  startMeasureIndex: number;
  endMeasureIndex: number;
  stavesYs: number[];
}

interface PageDescription {
  rowDescriptions: RowDescription[];
}

export default function StaffSystemElement({
  staffSystem,
}: {
  staffSystem: StaffSystem;
}) {
  const getPageClientWidthRef = useCallback(() => {
    return RAW_PAGE_WIDTH;
  }, []);

  const getPageClientHeightRef = useCallback(() => {
    return RAW_PAGE_HEIGHT;
  }, []);

  const mergeStavesYsRef = useCallback(
    (firstStavesYs: number[] | null, secondStavesYs: number[]) => {
      if (firstStavesYs == null) {
        return [...secondStavesYs];
      }

      if (firstStavesYs.length !== secondStavesYs.length) {
        throw new Error(
          "firstStavesYs and secondStavesYs must have the same length",
        );
      }
      const result = [];
      for (const [index, firstY] of firstStavesYs.entries()) {
        const secondY = requireNotNull(secondStavesYs[index]);
        result.push(Math.max(firstY, secondY));
      }
      return result;
    },
    [],
  );

  const divRef = useRef<HTMLDivElement | null>(null);
  const crtElementIdsRef = useRef<Set<string>>(new Set<string>());
  const savedElementIdsRef = useRef<Set<string>>(new Set<string>());

  const collectNewElementsRef = useCallback(
    (div: HTMLDivElement, save: boolean) => {
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
    },
    [],
  );

  const getNewElementsBoundsRef = useCallback(
    (div: HTMLDivElement, save: boolean) => {
      const toBoudingBox = (rect: DOMRect) =>
        new BoundingBox(rect.x, rect.y, rect.width, rect.height);

      const divRect = toBoudingBox(div.getBoundingClientRect());

      const normalize = (rect: DOMRect) => {
        const bb = toBoudingBox(rect);
        bb.x -= divRect.x;
        bb.y -= divRect.y;
        return bb;
      };

      const elements = collectNewElementsRef(div, save);
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

  const removeUnsavedRef = useCallback((div: HTMLDivElement) => {
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

  const renderStaffSystemAtIndexRef = useCallback(
    (
      div: HTMLDivElement,
      renderContext: RenderContext,
      save: boolean,
      shiftX: number,
      shiftY: number,
      measureIndex: number,
      drawConnector: boolean,
      drawLeftLine: boolean,
      drawRightLine: boolean,
      overridenStavesYs: number[] | null,
    ) => {
      // this makes sure bounds are calculated correctly
      removeUnsavedRef(div);

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
          const bounds = requireNotNull(getNewElementsBoundsRef(div, false));
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
        removeUnsavedRef(div);
        new StaveConnector(topStave, bottomStave)
          .setContext(renderContext)
          .setType(connectorTypeToVex(staffSystemMetadata.connectorType))
          .draw();
        const connectorBounds = getNewElementsBoundsRef(div, false);
        if (connectorBounds != null) {
          stavesXs = stavesXs.map((x) => -Math.min(x, connectorBounds.x));
        }
      }

      // begin rendering the real deal
      removeUnsavedRef(div);
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
      const totalBounds = getNewElementsBoundsRef(div, save);
      const width = (totalBounds?.x ?? 0) + (totalBounds?.w ?? 0);
      const height = (totalBounds?.y ?? 0) + (totalBounds?.h ?? 0);

      return { width, height, stavesYs };
    },
    [staffSystem, getNewElementsBoundsRef, removeUnsavedRef],
  );

  const getPageDescriptionsRef = useCallback(() => {
    const div = requireNotNull(
      divRef.current,
      "Expected divRef to be initialized",
    );
    const renderContext = new SVGContext(div);

    const totalMeasureCount = getStaffSystemMeasureCount(staffSystem);
    if (totalMeasureCount === 0) {
      return [];
    }

    const pageDescriptions: PageDescription[] = [];

    let crtMeasureIndex = -1;
    let crtWidth = 0;
    let crtHeight = 0;
    let crtStavesYs: number[] | null = null;
    let crtStartMeasureIndex = 0;
    let crtPageDescription: PageDescription = { rowDescriptions: [] };
    while (true) {
      const newMeasureIndex = crtMeasureIndex + 1;
      const firstOnRow = newMeasureIndex === crtStartMeasureIndex;
      const { width, height, stavesYs } = renderStaffSystemAtIndexRef(
        div,
        renderContext,
        false,
        0,
        0,
        newMeasureIndex,
        firstOnRow,
        firstOnRow,
        true,
        null,
      );
      const newWidth = crtWidth + width;
      const newHeight = Math.max(crtHeight, height);
      const newStavesYs = mergeStavesYsRef(crtStavesYs, stavesYs);

      const widthExceeded = newWidth > getPageClientWidthRef();
      const heightExceeded = newHeight > getPageClientHeightRef();

      if (!firstOnRow && widthExceeded && !heightExceeded) {
        crtPageDescription.rowDescriptions.push({
          startMeasureIndex: crtStartMeasureIndex,
          endMeasureIndex: crtMeasureIndex,
          stavesYs: requireNotNull(crtStavesYs),
        });
        crtWidth = 0;
        crtHeight = 0;
        crtStavesYs = null;
        crtStartMeasureIndex = newMeasureIndex;
        continue;
      }

      const firstOnPage = crtPageDescription.rowDescriptions.length === 0;

      if (!firstOnPage && heightExceeded) {
        pageDescriptions.push(crtPageDescription);
        crtPageDescription = { rowDescriptions: [] };
        crtWidth = 0;
        crtHeight = 0;
        crtStavesYs = null;
        crtStartMeasureIndex = newMeasureIndex;
        continue;
      }

      if (newMeasureIndex === totalMeasureCount - 1) {
        crtPageDescription.rowDescriptions.push({
          startMeasureIndex: crtStartMeasureIndex,
          endMeasureIndex: newMeasureIndex,
          stavesYs: newStavesYs,
        });
        pageDescriptions.push(crtPageDescription);
        break;
      }

      crtMeasureIndex = newMeasureIndex;
      crtWidth = newWidth;
      crtHeight = newHeight;
      crtStavesYs = newStavesYs;
    }
    removeUnsavedRef(div);
    return pageDescriptions;
  }, [
    staffSystem,
    renderStaffSystemAtIndexRef,
    mergeStavesYsRef,
    getPageClientWidthRef,
    getPageClientHeightRef,
    removeUnsavedRef,
  ]);

  useEffect(() => {
    if (divRef.current == null) {
      return;
    }

    const pageDescriptions = getPageDescriptionsRef();
    console.log(pageDescriptions);
  }, [getPageDescriptionsRef]);

  const [pages, setPages] = useState<JSX.Element[]>([]);

  return (
    <div className="flex flex-col gap-4" ref={divRef}>
      {pages}
    </div>
  );
}
