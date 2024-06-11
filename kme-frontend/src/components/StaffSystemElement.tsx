import { useCallback, useEffect, useState } from "react";
import type { StaffSystem } from "../model/staff-system";
import { parseStaffSystemMetadata } from "../util/metadata";
import Row, { getRowJson } from "./Row";
import { getStaffSystemMeasureCount } from "../util/misc";

const SCALE = 4;

const RAW_PAGE_WIDTH_MM = 210;
const RAW_PAGE_HEIGHT_MM = 297;

export default function StaffSystemElement({
  staffSystem,
  pagePadding,
}: {
  staffSystem: StaffSystem;
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

  const [rows, setRows] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const measureCount = getStaffSystemMeasureCount(staffSystem);
    if (measureCount === 0) {
      setRows([]);
      return;
    }

    const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);
    const newRows = [];
    let crtIndex = 0;
    for (const length of staffSystemMetadata.rowLengths) {
      const totalWidth = getPageClientWidthRef();
      const startMeasureIndex = crtIndex;
      const stopMeasureIndex = crtIndex + length - 1;
      newRows.push(
        <Row
          key={getRowJson(
            totalWidth,
            startMeasureIndex,
            stopMeasureIndex,
            staffSystem,
          )}
          staffSystem={staffSystem}
          startMeasureIndex={startMeasureIndex}
          stopMeasureIndex={stopMeasureIndex}
          totalWidth={totalWidth}
        />,
      );
      crtIndex += length;
    }
    setRows(newRows);
  }, [staffSystem, getPageClientWidthRef]);

  return (
    <div
      className="will-change-contents flex flex-col items-start justify-start bg-white"
      style={{
        paddingLeft: pagePadding.left,
        paddingRight: pagePadding.right,
        paddingTop: pagePadding.top,
        paddingBottom: pagePadding.bottom,
      }}
    >
      {rows}
    </div>
  );
}
