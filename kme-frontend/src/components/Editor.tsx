import { useCallback, useEffect, useState } from "react";
import type { StaffSystem } from "../model/staff-system";
import { requireNotNull } from "../util/require-not-null";
import ChunksMeasurement, { type Measurements } from "./ChunksMeasurement";
import { getChunksFromStaffSystem } from "../util/misc";
import { v4 as uuidv4 } from "uuid";

interface MeasurementsRow {
  height: number;
  stavesYs: number[];
  range: { start: number; end: number };
}

export default function Editor({ staffSystem }: { staffSystem: StaffSystem }) {
  const pageWidth = 210 * 4;
  const pageHeight = 297 * 4;
  const [pages, setPages] = useState<JSX.Element[] | null>(null);
  const [chunksMeasurement, setChunksMeasurement] =
    useState<JSX.Element | null>(null);

  const getMeasurementsRangeAndRestRef = useCallback(
    (
      measurements: Measurements,
    ): { range: Measurements; rest: Measurements } => {
      if (
        measurements.widths.length !== measurements.heights.length ||
        measurements.widths.length !== measurements.chunksStavesYs.length
      ) {
        throw new Error("Invalid measurements");
      }

      if (measurements.widths.length === 0) {
        return {
          range: { widths: [], heights: [], chunksStavesYs: [] },
          rest: { widths: [], heights: [], chunksStavesYs: [] },
        };
      }

      let rangeEnd = -1;
      let totalWidth = 0;
      for (const [index, width] of measurements.widths.entries()) {
        totalWidth += width;
        if (totalWidth > pageWidth) {
          if (rangeEnd === -1) {
            rangeEnd = index;
          }
          break;
        }
        rangeEnd = index;
      }

      return {
        range: {
          widths: measurements.widths.slice(0, rangeEnd + 1),
          heights: measurements.heights.slice(0, rangeEnd + 1),
          chunksStavesYs: measurements.chunksStavesYs.slice(0, rangeEnd + 1),
        },
        rest: {
          widths: measurements.widths.slice(rangeEnd + 1),
          heights: measurements.heights.slice(rangeEnd + 1),
          chunksStavesYs: measurements.chunksStavesYs.slice(rangeEnd + 1),
        },
      };
    },
    [],
  );

  const getMeasurementsRowsRef = useCallback(
    (measurements: Measurements) => {
      const measurementsRows = [];
      let crtMeasurements = measurements;
      let offset = 0;
      while (crtMeasurements.widths.length > 0) {
        const { range, rest } = getMeasurementsRangeAndRestRef(crtMeasurements);
        const newMeasurementsRow: MeasurementsRow = {
          height: range.heights.reduce((prev, crt) => Math.max(prev, crt)),
          stavesYs: range.chunksStavesYs.reduce((prev, crt) => {
            const result = [];
            for (const [index, y] of prev.entries()) {
              const otherY = requireNotNull(crt[index]);
              if (y > otherY) {
                result.push(y);
              } else {
                result.push(otherY);
              }
            }
            return prev;
          }),
          range: {
            start: offset,
            end: offset + range.widths.length,
          },
        };
        offset += range.widths.length;
        measurementsRows.push(newMeasurementsRow);
        crtMeasurements = rest;
      }
      return measurementsRows;
    },
    [getMeasurementsRangeAndRestRef],
  );

  const getMeasurementsRowsRangeAndRest = useCallback(
    (measurementsRows: MeasurementsRow[]) => {
      let rangeEnd = -1;
      let totalHeight = 0;
      for (const [index, measurementRow] of measurementsRows.entries()) {
        totalHeight += measurementRow.height;
        if (totalHeight > pageHeight) {
          if (rangeEnd === -1) {
            rangeEnd = index;
          }
          break;
        }
        rangeEnd = index;
      }
      return {
        range: measurementsRows.slice(0, rangeEnd + 1),
        rest: measurementsRows.slice(rangeEnd + 1),
      };
    },
    [],
  );

  const getChunksFromMeasurementsRowRef = useCallback(
    (measurementsRow: MeasurementsRow) => {
      const chunks = getChunksFromStaffSystem(
        staffSystem,
        measurementsRow.stavesYs,
        null,
      );
      return chunks.slice(
        measurementsRow.range.start,
        measurementsRow.range.end,
      );
    },
    [staffSystem],
  );

  const getRowsFromMeasurementsRowsRef = useCallback(
    (measurementsRows: MeasurementsRow[]) => {
      const rows = [];
      for (const measurementsRow of measurementsRows) {
        const chunks = getChunksFromMeasurementsRowRef(measurementsRow);
        const newRow = (
          <div
            key={uuidv4()}
            className="flex flex-row flex-nowrap gap-0 items-start justify-start"
          >
            {chunks}
          </div>
        );
        rows.push(newRow);
      }
      return rows;
    },
    [getChunksFromMeasurementsRowRef],
  );

  const getPageFromMeasurementsRowsRef = useCallback(
    (measurementsRows: MeasurementsRow[]) => {
      const rows = getRowsFromMeasurementsRowsRef(measurementsRows);
      return (
        <div
          key={uuidv4()}
          style={{ width: pageWidth, height: pageHeight }}
          className="bg-white flex flex-col flex-nowrap gap-0 p-6 items-start justify-start"
        >
          {rows}
        </div>
      );
    },
    [getRowsFromMeasurementsRowsRef],
  );

  const initPagesRef = useCallback(
    (measurements: Measurements) => {
      let crtMeasurementsRows = getMeasurementsRowsRef(measurements);
      const newPages = [];
      while (crtMeasurementsRows.length > 0) {
        const { range, rest } =
          getMeasurementsRowsRangeAndRest(crtMeasurementsRows);
        newPages.push(getPageFromMeasurementsRowsRef(range));
        crtMeasurementsRows = rest;
      }
      setPages(newPages);
    },
    [
      getMeasurementsRowsRef,
      getMeasurementsRowsRef,
      getMeasurementsRowsRangeAndRest,
      getPageFromMeasurementsRowsRef,
    ],
  );

  const onChunkMeasurementsRef = useCallback(
    (measurements: Measurements) => {
      initPagesRef(measurements);
    },
    [initPagesRef],
  );

  useEffect(() => {
    const newChunksMeasurement = (
      <ChunksMeasurement
        staffSystem={staffSystem}
        onMeasurements={onChunkMeasurementsRef}
      />
    );
    setChunksMeasurement(newChunksMeasurement);
  }, [staffSystem, onChunkMeasurementsRef]);

  return (
    <>
      <div className="flex flex-col flex-nowrap gap-4 items-center justify-center">
        {pages == null ? chunksMeasurement : pages}
      </div>
    </>
  );
}
