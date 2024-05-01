import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { StaffSystem } from "vexflow-repl";
import Chunk from "./Chunk";

interface RowProps {
  staffSystem: StaffSystem;
}

export default function Row({ staffSystem }: RowProps) {
  const [chunks, setChunks] = useState<JSX.Element[]>([]);

  if (chunks.length < 2) {
    const newChunk = (
      <Chunk key={uuidv4()} staffSystem={staffSystem} index={chunks.length} />
    );
    setChunks([...chunks, newChunk]);
  }

  return (
    <div className="flex flex-row flex-nowrap gap-0 items-start justify-start">
      {chunks}
    </div>
  );
}
