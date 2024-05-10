import { useCallback, useEffect, useRef, useState } from "react";
import type { StaffSystem } from "../model/staff-system";
import { getChunksFromStaffSystem } from "../util/misc";
import { requireNotNull } from "../util/require-not-null";

export interface ChunksMeasurementProps {
  staffSystem: StaffSystem;
  onMeasurements: (measurements: Measurements) => void;
}

export interface Measurements {
  widths: number[];
  heights: number[];
  chunksStavesYs: Array<Array<number>>;
}

export default function ChunksMeasurement({
  staffSystem,
  onMeasurements,
}: ChunksMeasurementProps) {
  const measurementsRef = useRef<Measurements>({
    widths: [],
    heights: [],
    chunksStavesYs: [],
  });
  const chunksRef = useRef<JSX.Element[] | null>(null);
  const [chunksToRender, setChunksToRender] = useState<JSX.Element[] | null>(
    null,
  );

  const onChunkRenderRef = useCallback(
    (
      chunkIndex: number,
      width: number,
      height: number,
      chunkStavesYs: number[],
    ) => {
      measurementsRef.current.widths.push(width);
      measurementsRef.current.heights.push(height);
      measurementsRef.current.chunksStavesYs.push(chunkStavesYs);

      const chunks = requireNotNull(chunksRef.current);
      if (chunkIndex === chunks.length - 1) {
        onMeasurements(measurementsRef.current);
      }
    },
    [onMeasurements],
  );

  useEffect(() => {
    measurementsRef.current = { widths: [], heights: [], chunksStavesYs: [] };
    chunksRef.current = getChunksFromStaffSystem(
      staffSystem,
      null,
      onChunkRenderRef,
    );
    if (chunksRef.current.length === 0) {
      onMeasurements(measurementsRef.current);
    }
    setChunksToRender(chunksRef.current);
  }, [staffSystem, onChunkRenderRef, onMeasurements]);

  return <div className="hidden">{chunksToRender}</div>;
}
