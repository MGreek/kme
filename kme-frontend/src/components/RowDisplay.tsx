import { useRef, useState } from "react";
import type { StaffSystem } from "../model/staff-system";
import { getStaffSystemMeasureCount } from "../util/misc";
import { requireNotNull } from "../util/require-not-null";
import RawRowDisplay from "./RawRowDisplay";
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
  onStats:
  | ((width: number, height: number, endMeasureIndex: number) => void)
  | null;
}) {
  const totalMeasureCountRef = useRef<number | null>(null);
  const elementMeasureIndexRef = useRef<number | null>(null);
  const crtWidthRef = useRef<number | null>(null);
  const crtHeightRef = useRef<number | null>(null);
  const crtOverridenStavesYsRef = useRef<number[] | null>(null);

  const tryUpdateWidth = (width: number) => {
    const totalWidth = (crtWidthRef.current ?? 0) + width;
    if (totalWidth > maxWidth) {
      return false;
    }
    crtWidthRef.current = totalWidth;
    return true;
  };

  const updateHeight = (height: number) => {
    crtHeightRef.current = Math.max(crtHeightRef.current ?? 0, height);
  };

  const updateOverrideStavesYs = (stavesYs: number[]) => {
    if (crtOverridenStavesYsRef.current == null) {
      crtOverridenStavesYsRef.current = [...stavesYs];
    } else {
      for (const [index, y] of crtOverridenStavesYsRef.current.entries()) {
        const otherY = requireNotNull(
          stavesYs[index],
          `Expected stavesYs to have an element at index: ${index}`,
        );
        if (y < otherY) {
          crtOverridenStavesYsRef.current[index] = otherY;
        }
      }
    }
  };

  const createRawRowDisplay = () => {
    const endMeasureIndex = requireNotNull(
      elementMeasureIndexRef.current,
      "Expected elementMeasureIndexRef to be initialized",
    );
    const overridenStavesYs = requireNotNull(
      crtOverridenStavesYsRef.current,
      "Expected crtOverridenStavesYsRef to be initialized",
    );
    const totalWidth = requireNotNull(
      crtWidthRef.current,
      "Expected totalWidth to be initialized",
    );
    const totalHeight = requireNotNull(
      crtHeightRef.current,
      "Expected crtHeightRef to be initialized",
    );

    const key = JSON.stringify({
      staffSystemId: staffSystem.staffSystemId.staffSystemId,
      startMeasureIndex,
      endMeasureIndex,
    });

    const rawRowDisplay = (
      <RawRowDisplay
        key={key}
        staffSystem={staffSystem}
        startMeasureIndex={startMeasureIndex}
        endMeasureIndex={endMeasureIndex}
        overridenStavesYs={overridenStavesYs}
      />
    );
    setElement(rawRowDisplay);
    if (onStats != null) {
      onStats(totalWidth, totalHeight, endMeasureIndex);
    }
  };

  const onElementRenderRef = (
    width: number,
    height: number,
    stavesYs: number[],
  ) => {
    if (totalMeasureCountRef.current == null) {
      totalMeasureCountRef.current = getStaffSystemMeasureCount(staffSystem);
    }
    if (elementMeasureIndexRef.current == null) {
      elementMeasureIndexRef.current = startMeasureIndex;
    }

    if (!tryUpdateWidth(width)) {
      if (elementMeasureIndexRef.current !== startMeasureIndex) {
        elementMeasureIndexRef.current--;
      }
      createRawRowDisplay();
      return;
    }
    updateHeight(height);
    updateOverrideStavesYs(stavesYs);

    if (elementMeasureIndexRef.current === totalMeasureCountRef.current) {
      createRawRowDisplay();
      return;
    }

    elementMeasureIndexRef.current++;
    const newElement = (
      <StaffSystemElement
        key={JSON.stringify({
          staffSystemId: staffSystem.staffSystemId.staffSystemId,
          measureIndex: elementMeasureIndexRef.current,
        })}
        staffSystem={staffSystem}
        measureIndex={elementMeasureIndexRef.current}
        drawConnector={false}
        drawLeftLine={false}
        drawRightLine={true}
        overridenStavesYs={null}
        onRender={onElementRenderRef}
      />
    );
    setElement(newElement);
  };

  const [element, setElement] = useState<JSX.Element>(
    <StaffSystemElement
      staffSystem={staffSystem}
      measureIndex={startMeasureIndex}
      drawConnector={true}
      drawLeftLine={true}
      drawRightLine={true}
      overridenStavesYs={null}
      onRender={onElementRenderRef}
    />,
  );

  return element;
}
