import { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { StaffSystem } from "../model/staff-system";
import { requireNotNull } from "../util/require-not-null";
import Chunk from "./Chunk";

interface RowProps {
  staffSystem: StaffSystem;
  bounds: DOMRect;
}

export default function Row({ staffSystem, bounds }: RowProps) {
  const [chunks, setChunks] = useState<JSX.Element[]>([]);
  const stopAppendingRef = useRef<boolean>(false);
  const chunksYsRef = useRef<Array<Array<number>>>([]);

  function popAndStopAppending() {
    stopAppendingRef.current = true;
    chunksYsRef.current.pop();
    setChunks([...chunks.slice(0, chunks.length)]);
  }

  function getCoordsY() {
    return chunksYsRef.current.reduce((prev: number[], crt: number[]) => {
      for (const [yIndex, y] of prev.entries()) {
        const otherY = requireNotNull(crt[yIndex]);
        if (y < otherY) {
          prev[yIndex] = otherY;
        }
      }
      return prev;
    });
  }

  function canAppend(): boolean {
    return staffSystem.staves.at(0)?.measures.at(chunks.length) != null;
  }

  function createAndAlignChunks() {
    const coordsY = getCoordsY();
    const newChunks = [];
    for (let index = 0; index < chunks.length; index++) {
      const newChunk = (
        <Chunk
          key={uuidv4()}
          staffSystem={staffSystem}
          chunkIndex={index}
          bounds={bounds}
          onOutOfBounds={null}
          onRender={null}
          overrideYs={coordsY}
        />
      );
      newChunks.push(newChunk);
    }
    setChunks(newChunks);
  }

  function appendChunk() {
    const newChunk = (
      <Chunk
        key={uuidv4()}
        staffSystem={staffSystem}
        chunkIndex={chunks.length}
        bounds={bounds}
        onOutOfBounds={onChunkOutOfBounds}
        onRender={onChunkRender}
        overrideYs={null}
      />
    );
    setChunks([...chunks, newChunk]);
  }

  const onChunkOutOfBounds = (
    chunkIndex: number,
    widthExceeded: boolean,
    heightExceeded: boolean,
  ) => {
    popAndStopAppending();
    createAndAlignChunks();
  };

  const onChunkRender = (chunkIndex: number, chunkYs: number[]) => {
    chunksYsRef.current.push(chunkYs);
  };

  const onRenderRef = useCallback(
    (div: HTMLDivElement | null) => {
      if (div == null) {
        return;
      }
      if (stopAppendingRef.current) {
        return;
      }
      if (!canAppend()) {
        createAndAlignChunks();
        return;
      }
      appendChunk();
    },
    [canAppend, createAndAlignChunks, appendChunk],
  );

  return (
    <div
      ref={onRenderRef}
      className="flex flex-row flex-nowrap gap-0 items-start justify-start"
    >
      {chunks}
    </div>
  );
}
