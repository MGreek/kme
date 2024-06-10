import { useCallback, useEffect, useRef } from "react";
import {
  BoundingBox,
  type RenderContext,
  SVGContext,
  StaveConnector,
} from "vexflow";
import type { StaffSystem } from "../model/staff-system";
import { renderStaffAtIndex } from "../renderer/render";
import { parseStaffSystemMetadata } from "../util/metadata";
import { getStaffSystemMeasureCount } from "../util/misc";
import { connectorTypeToVex } from "../util/model-to-vexflow";
import { requireNotNull } from "../util/require-not-null";

const SCALE = 3.5;

const RAW_PAGE_WIDTH_MM = 210;
const RAW_PAGE_HEIGHT_MM = 297;

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
  pageGap,
  pagePadding,
}: {
  staffSystem: StaffSystem;
  pageGap: number;
  pagePadding: { left: number; right: number; top: number; bottom: number };
}) {
  const getPageWidthRef = useCallback(() => {
    return RAW_PAGE_WIDTH_MM * SCALE;
  }, []);

  const getPageHeightRef = useCallback(() => {
    return RAW_PAGE_HEIGHT_MM * SCALE;
  }, []);

  const getPageClientWidthRef = useCallback(() => {
    return getPageWidthRef() - pagePadding.left - pagePadding.right;
  }, [getPageWidthRef, pagePadding]);

  const getPageClientHeightRef = useCallback(() => {
    return getPageHeightRef() - pagePadding.top - pagePadding.bottom;
  }, [getPageHeightRef, pagePadding]);

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

  const collectNewElementsRef = useCallback((save: boolean) => {
    const div = requireNotNull(
      divRef.current,
      "Expected divRef to be initialized",
    );

    const svg = div.firstChild;
    if (!(svg instanceof SVGElement)) {
      throw new Error("Expected divRef to have svg child on first position");
    }

    const newElements = Array.from(svg.children).filter(
      (element) =>
        !savedElementIdsRef.current.has(element.outerHTML) &&
        !crtElementIdsRef.current.has(element.outerHTML),
    );

    for (const newElement of newElements) {
      if (save) {
        savedElementIdsRef.current.add(newElement.outerHTML);
      }
      crtElementIdsRef.current.add(newElement.outerHTML);
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

    const svg = div.firstChild;
    if (!(svg instanceof SVGElement)) {
      throw new Error("Expected divRef to have svg child on first position");
    }

    const unsavedElements = Array.from(svg.children).filter(
      (element) => !savedElementIdsRef.current.has(element.outerHTML),
    );
    for (const element of unsavedElements) {
      svg.removeChild(element);
    }
    crtElementIdsRef.current.clear();
  }, []);

  // TODO: use metadata instead of `drawConnector`, `drawLeftLine`, `drawRightLine`;
  // this also implies setting the metadata in the right places
  const renderStaffSystemAtIndexRef = useCallback(
    (
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
      removeUnsavedRef();

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
        collectNewElementsRef(false);
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
      const totalBounds = requireNotNull(getNewElementsBoundsRef(save));
      const width = totalBounds.w - shiftX;
      const height = totalBounds.h - shiftY;

      return { width, height, stavesYs };
    },
    [
      staffSystem,
      getNewElementsBoundsRef,
      removeUnsavedRef,
      collectNewElementsRef,
    ],
  );

  const getPageDescriptionsRef = useCallback(
    (renderContext: RenderContext, count: number) => {
      const totalMeasureCount = getStaffSystemMeasureCount(staffSystem);
      if (totalMeasureCount === 0) {
        return [];
      }

      const pageDescriptions: PageDescription[] = [];

      let crtMeasureIndex = -1;
      let crtWidth = 0;
      let crtHeight = 0;
      let shiftY = 0;
      let crtStavesYs: number[] | null = null;
      let crtStartMeasureIndex = 0;
      let crtPageDescription: PageDescription = { rowDescriptions: [] };
      while (true) {
        const newMeasureIndex = crtMeasureIndex + 1;
        const firstOnRow = newMeasureIndex === crtStartMeasureIndex;
        const firstOnPage = crtPageDescription.rowDescriptions.length === 0;

        const { width, height, stavesYs } = renderStaffSystemAtIndexRef(
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
        const newHeight =
          (firstOnPage ? 0 : pageGap) + Math.max(crtHeight, height);
        const newStavesYs = mergeStavesYsRef(crtStavesYs, stavesYs);

        const widthExceeded = newWidth > getPageClientWidthRef();
        const heightExceeded = shiftY + newHeight > getPageClientHeightRef();

        if (!firstOnRow && widthExceeded && !heightExceeded) {
          crtPageDescription.rowDescriptions.push({
            startMeasureIndex: crtStartMeasureIndex,
            endMeasureIndex: crtMeasureIndex,
            stavesYs: requireNotNull(crtStavesYs),
          });
          crtWidth = 0;
          shiftY += crtHeight;
          crtHeight = 0;
          crtStavesYs = null;
          crtStartMeasureIndex = newMeasureIndex;
          continue;
        }

        if ((!firstOnPage || !firstOnRow) && heightExceeded) {
          if (!firstOnRow) {
            crtPageDescription.rowDescriptions.push({
              startMeasureIndex: crtStartMeasureIndex,
              endMeasureIndex: crtMeasureIndex,
              stavesYs: requireNotNull(crtStavesYs),
            });
          }
          pageDescriptions.push(crtPageDescription);
          if (pageDescriptions.length === count) {
            break;
          }
          crtPageDescription = { rowDescriptions: [] };
          crtWidth = 0;
          shiftY = 0;
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
      removeUnsavedRef();
      return pageDescriptions;
    },
    [
      staffSystem,
      pageGap,
      renderStaffSystemAtIndexRef,
      mergeStavesYsRef,
      getPageClientWidthRef,
      getPageClientHeightRef,
      removeUnsavedRef,
    ],
  );

  const renderRowFromDescriptionRef = useCallback(
    (
      renderContext: RenderContext,
      shiftX: number,
      shiftY: number,
      rowDescription: RowDescription,
    ) => {
      let crtWidth = shiftX;
      let crtHeight = 0;
      for (
        let measureIndex = rowDescription.startMeasureIndex;
        measureIndex <= rowDescription.endMeasureIndex;
        measureIndex++
      ) {
        const first = measureIndex === rowDescription.startMeasureIndex;
        const { width, height } = renderStaffSystemAtIndexRef(
          renderContext,
          true,
          crtWidth,
          shiftY,
          measureIndex,
          first,
          first,
          true,
          rowDescription.stavesYs,
        );
        crtWidth += width;
        crtHeight = Math.max(crtHeight, height);
      }
      return { width: crtWidth, height: crtHeight };
    },
    [renderStaffSystemAtIndexRef],
  );

  const renderPageFromDescriptionRef = useCallback(
    (
      renderContext: RenderContext,
      shiftX: number,
      shiftY: number,
      pageDescription: PageDescription,
    ) => {
      const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);
      let crtShiftY = shiftY;
      for (const rowDescription of pageDescription.rowDescriptions) {
        const { height } = renderRowFromDescriptionRef(
          renderContext,
          shiftX + pagePadding.left,
          crtShiftY + pagePadding.top,
          rowDescription,
        );
        crtShiftY += height + staffSystemMetadata.gap;
      }
    },
    [staffSystem, pagePadding, renderRowFromDescriptionRef],
  );

  const renderPagesFromDescrtiptionsRef = useCallback(
    (renderContext: RenderContext, pageDescriptions: PageDescription[]) => {
      let crtShiftY = 0;
      for (const [index, pageDescription] of pageDescriptions.entries()) {
        removeUnsavedRef();
        renderContext.save();
        renderContext.setFillStyle("white");
        renderContext.fillRect(
          0,
          crtShiftY,
          getPageWidthRef(),
          getPageHeightRef(),
        );
        renderContext.restore();
        collectNewElementsRef(true);

        renderPageFromDescriptionRef(
          renderContext,
          0,
          crtShiftY,
          pageDescription,
        );

        crtShiftY += getPageHeightRef();

        if (index < pageDescriptions.length - 1) {
          crtShiftY += pageGap;
        }
      }

      const width = getPageWidthRef();
      const height = crtShiftY;

      return { width, height };
    },
    [
      pageGap,
      getPageWidthRef,
      getPageHeightRef,
      renderPageFromDescriptionRef,
      collectNewElementsRef,
      removeUnsavedRef,
    ],
  );

  useEffect(() => {
    if (divRef.current == null) {
      return;
    }

    const div = divRef.current;
    div.innerHTML = "";
    crtElementIdsRef.current.clear();
    savedElementIdsRef.current.clear();

    const renderContext = new SVGContext(div).scale(1, 1);

    const pageDescriptions = getPageDescriptionsRef(renderContext, 1);
    const { width, height } = renderPagesFromDescrtiptionsRef(
      renderContext,
      pageDescriptions,
    );

    renderContext.resize(width, height);
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
  }, [getPageDescriptionsRef, renderPagesFromDescrtiptionsRef]);

  return <div className="will-change-contents" ref={divRef} />;
}
