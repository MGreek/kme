import { useCallback, useEffect, useState } from "react";
import type { StaffSystem } from "../model/staff-system";
import SheetMusicFactory from "./SheetMusicFactory";

export default function Editor({ staffSystem }: { staffSystem: StaffSystem }) {
  const [music, setMusic] = useState<JSX.Element | null>(null);
  const [chunksMeasurement, setChunksMeasurement] =
    useState<JSX.Element | null>(null);

  const onSheetMusicRef = useCallback((music: JSX.Element) => {
    setMusic(music);
  }, []);

  useEffect(() => {
    const newChunksMeasurement = (
      <SheetMusicFactory
        staffSystem={staffSystem}
        onSheetMusic={onSheetMusicRef}
      />
    );
    setChunksMeasurement(newChunksMeasurement);
  }, [staffSystem, onSheetMusicRef]);

  return (
    <>
      <div className="grid place-items-center">
        {music == null ? chunksMeasurement : music}
      </div>
    </>
  );
}
