import type { StaffSystem } from "vexflow-repl";
import Row from "./Row";
import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface PageProps {
  staffSystem: StaffSystem;
}

export default function Page({ staffSystem }: PageProps) {
  const [rows, setRows] = useState<JSX.Element[]>([]);

  const onRenderRef = useCallback(
    (div: HTMLDivElement | null) => {
      if (div != null) {
        const newRow = (
          <Row
            key={uuidv4()}
            staffSystem={staffSystem}
            bounds={div.getBoundingClientRect()}
          />
        );
        setRows([newRow]);
      }
    },
    [staffSystem],
  );

  return (
    <>
      <div
        ref={onRenderRef}
        className="sheetmusic-page flex flex-col items-start justify-start bg-blue-50"
      >
        {rows}
      </div>
    </>
  );
}
