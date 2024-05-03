import { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { StaffSystem } from "../model/staff-system";
import Chunk from "./Chunk";

interface RowProps {
  staffSystem: StaffSystem;
  bounds: DOMRect;
}

export default function Row({ staffSystem, bounds }: RowProps) {
  const [chunks, setChunks] = useState<JSX.Element[]>([]);
  const stopAppendingRef = useRef<boolean>(false);

  const onOutOfBounds = (
    chunkIndex: number,
    widthExceeded: boolean,
    heightExceeded: boolean,
  ) => {
    stopAppendingRef.current = true;
    setChunks([...chunks.slice(0, chunkIndex)]);
  };

  const onRenderRef = useCallback(
    (div: HTMLDivElement | null) => {
      if (stopAppendingRef.current || div == null) {
        return;
      }
      const newChunk = (
        <Chunk
          key={uuidv4()}
          staffSystem={staffSystem}
          chunkIndex={chunks.length}
          bounds={bounds}
          onOutOfBounds={onOutOfBounds}
        />
      );
      setChunks([...chunks, newChunk]);
    },
    [chunks, chunks.length, onOutOfBounds, staffSystem, bounds],
  );

  return (
    <div
      ref={onRenderRef}
      className="relative flex flex-row flex-nowrap gap-0 items-start justify-start"
    >
      {chunks}
    </div>
  );
}
