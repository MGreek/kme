import { cloneElement, useCallback, useEffect, useRef } from "react";
import type { StaffSystem } from "../model/staff-system";
import { getStaffSystemMeasureCount } from "../util/misc";
import { requireNotNull } from "../util/require-not-null";
import StaffSystemElement from "./StaffSystemElement";

export default function RowDisplay({
  staffSystem,
  startMeasureIndex,
  maxWidth,
  onStats,
}: {
  staffSystem: StaffSystem;
  startMeasureIndex: number;
  maxWidth: number;
  onStats: ((width: number, height: number, key: string) => void) | null;
}) {
  const totalMeasureCountRef = useRef<number | null>(null);
  const lastElementMeasureIndexRef = useRef<number | null>(null);
  const crtWidthRef = useRef<number | null>(null);
  const crtHeightRef = useRef<number | null>(null);
  const crtOverrideStavesYsRef = useRef<number[] | null>(null);

  const divRef = useRef<HTMLDivElement | null>(null);

  const elementsRef = useRef<JSX.Element[]>([]);

  const updateOverrideStavesYsRef = useCallback((stavesYs: number[]) => {
    if (crtOverrideStavesYsRef.current == null) {
      crtOverrideStavesYsRef.current = [...stavesYs];
    } else {
      for (const [index, y] of crtOverrideStavesYsRef.current.entries()) {
        const otherY = requireNotNull(
          stavesYs[index],
          `Expected stavesYs to have an element at index: ${index}`,
        );
        if (y < otherY) {
          crtOverrideStavesYsRef.current[index] = otherY;
        }
      }
    }
  }, []);

  const tryUpdateWidthRef = useCallback(
    (width: number) => {
      const totalWidth = (crtWidthRef.current ?? 0) + width;
      if (totalWidth > maxWidth) {
        return false;
      }
      crtWidthRef.current = totalWidth;
      return true;
    },
    [maxWidth],
  );

  const updateHeightRef = useCallback((height: number) => {
    crtHeightRef.current = Math.max(crtHeightRef.current ?? 0, height);
  }, []);

  const removeLastElementRef = useCallback(() => {
    if (lastElementMeasureIndexRef.current == null) {
      throw new Error("Expected lastElementMeasureIndexRef to be initialized");
    }
    elementsRef.current.pop();
    lastElementMeasureIndexRef.current--;
  }, []);

  const finalizeElements = useCallback(() => {
    if (crtWidthRef.current == null) {
      throw new Error("Expected crtWidthRef to be initialized");
    }
    if (crtHeightRef.current == null) {
      throw new Error("Expected crtHeightRef to be initialized");
    }
    if (lastElementMeasureIndexRef.current == null) {
      throw new Error("Expected lastElementMeasureIndexRef to be initialized");
    }
    if (crtOverrideStavesYsRef.current == null) {
      throw new Error("Expected crtOverrideStavesYsRef to be initialized");
    }

    const newElements = elementsRef.current.map((element) =>
      cloneElement(element, {
        onRender: null,
        overrideStavesYs: crtOverrideStavesYsRef.current,
      }),
    );
    elementsRef.current = newElements;

    if (onStats != null) {
      onStats(
        crtWidthRef.current,
        crtHeightRef.current,
        JSON.stringify({
          staffSystemId: staffSystem.staffSystemId.staffSystemId,
          startMeasureIndex: startMeasureIndex,
          endMeasureIndex: lastElementMeasureIndexRef.current,
        }),
      );
    }
  }, [staffSystem, onStats, startMeasureIndex]);

  const onLastElementRenderRef = useCallback(
    (width: number, height: number, stavesYs: number[]) => {
      if (totalMeasureCountRef.current == null) {
        throw new Error("Expected totalMeasureCountRef to be initialized");
      }
      if (lastElementMeasureIndexRef.current == null) {
        throw new Error(
          "Expected lastElementMeasureIndexRef to be initialized",
        );
      }

      if (!tryUpdateWidthRef(width)) {
        removeLastElementRef();
        finalizeElements();
        return;
      }
      updateHeightRef(height);
      updateOverrideStavesYsRef(stavesYs);

      if (lastElementMeasureIndexRef.current === totalMeasureCountRef.current) {
        finalizeElements();
        return;
      }

      prepareLastElement(elementsRef.current);
      lastElementMeasureIndexRef.current++;
      const newElement = (
        <StaffSystemElement
          key={JSON.stringify({
            staffSystemId: staffSystem.staffSystemId.staffSystemId,
            measureIndex: lastElementMeasureIndexRef.current,
          })}
          staffSystem={staffSystem}
          measureIndex={lastElementMeasureIndexRef.current}
          drawConnector={false}
          drawLeftLine={false}
          drawRightLine={true}
          overridenStavesYs={null}
          onRender={onLastElementRenderRef}
        />
      );
      elementsRef.current = [...elementsRef.current, newElement];
    },
    [
      staffSystem,
      tryUpdateWidthRef,
      updateHeightRef,
      updateOverrideStavesYsRef,
      removeLastElementRef,
      finalizeElements,
    ],
  );

  useEffect(() => {
    if (divRef.current == null) {
      return;
    }

    totalMeasureCountRef.current = getStaffSystemMeasureCount(staffSystem);

    if (totalMeasureCountRef.current === 0) {
      return;
    }

    lastElementMeasureIndexRef.current = startMeasureIndex;
    const newElement = (
      <StaffSystemElement
        key={JSON.stringify({
          staffSystemId: staffSystem.staffSystemId.staffSystemId,
          measureIndex: lastElementMeasureIndexRef.current,
        })}
        staffSystem={staffSystem}
        measureIndex={lastElementMeasureIndexRef.current}
        drawConnector={true}
        drawLeftLine={true}
        drawRightLine={true}
        overridenStavesYs={null}
        onRender={onLastElementRenderRef}
      />
    );
    elementsRef.current = [newElement];
  }, [staffSystem, startMeasureIndex, onLastElementRenderRef]);

  return (
    <div
      ref={divRef}
      className="flex flex-row flex-nowrap items-start justify-start gap-0"
    >
      {elementsRef.current}
    </div>
  );
}

function prepareLastElement(elements: JSX.Element[]) {
  const lastElement = requireNotNull(
    elements.at(-1),
    "Expected last element to exist",
  );
  const newLastElement = cloneElement(lastElement, { onRender: null });
  elements.pop();
  elements.push(newLastElement);
}
