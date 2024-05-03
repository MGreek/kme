import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { StaffSystem } from "../model/staff-system";
import Chunk from "./Chunk";

interface RowProps {
  staffSystem: StaffSystem;
  bounds: DOMRect;
}

export default function Row({ staffSystem, bounds }: RowProps) {
  const [chunks, setChunks] = useState<JSX.Element[]>([]);

  const onWrapEnter = (chunkIndex: number) => {
    console.log(chunkIndex);
  };

  const onRenderRef = useCallback(
    (div: HTMLDivElement | null) => {
      if (div == null) {
        return;
      }
      if (chunks.length < 3) {
        const newChunk = (
          <Chunk
            key={uuidv4()}
            staffSystem={staffSystem}
            chunkIndex={chunks.length}
            bounds={bounds}
            onWrapEnter={onWrapEnter}
          />
        );
        setChunks([...chunks, newChunk]);
      }
    },
    [chunks, chunks.length, onWrapEnter, staffSystem, bounds],
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
