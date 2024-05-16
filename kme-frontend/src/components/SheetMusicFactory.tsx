import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import type { StaffSystem } from "../model/staff-system";
import {
  getChunkFromStaffSystemAtIndex,
  getStaffSystemAtIndex,
} from "../util/misc";
import { requireNotNull } from "../util/require-not-null";
import { v4 as uuidv4 } from "uuid";
import Chunk from "./Chunk";

export interface ChunksMeasurementProps {
  staffSystem: StaffSystem;
  onSheetMusic: (music: JSX.Element) => void;
}

interface ChunkInfo {
  index: number;
  width: number;
  height: number;
  stavesYs: number[];
}

export default function SheetMusicFactory({
  staffSystem,
  onSheetMusic,
}: ChunksMeasurementProps) {
  const pageWidth = 210 * 4;
  const pageHeight = 297 * 4;
  const gap = 20;

  const pages = useRef<ChunkInfo[][][]>([]);
  const crtPage = useRef<ChunkInfo[][]>([]);
  const crtRow = useRef<ChunkInfo[]>([]);
  const crtIndex = useRef<number>(0);
  const measureCountRef = useRef<number>(0);
  const [chunkToRender, setChunkToRender] = useState<JSX.Element | null>(null);
  const oldStaffSystem = useRef<StaffSystem | null>(null);

  const getStavesYsFromRow = useCallback((row: ChunkInfo[]) => {
    return row
      .map((chunk) => chunk.stavesYs)
      .reduce((prev, crt) => {
        const result = [];
        for (const [index, y] of prev.entries()) {
          const otherY = requireNotNull(crt[index]);
          if (y > otherY) {
            result.push(y);
          } else {
            result.push(otherY);
          }
        }
        return result;
      });
  }, []);

  const getIdFromChunkInfoRef = useCallback(
    (info: ChunkInfo) => {
      return JSON.stringify({
        staffSystemId: staffSystem.id,
        index: info.index,
      });
    },
    [staffSystem],
  );

  const getRowDivFromRow = useCallback(
    (row: ChunkInfo[]) => {
      const stavesYs = getStavesYsFromRow(row);
      const chunks = row.map((chunkInfo) => {
        return (
          <Chunk
            key={getIdFromChunkInfoRef(chunkInfo)}
            staffSystem={getStaffSystemAtIndex(staffSystem, chunkInfo.index)}
            stavesYs={stavesYs}
            onRender={null}
          />
        );
      });
      return <div className="flex flex-row flex-nowrap">{chunks}</div>;
    },
    [staffSystem, getStavesYsFromRow, getIdFromChunkInfoRef],
  );

  const getPageDivFromPage = useCallback(
    (page: ChunkInfo[][]) => {
      const rowDivs = page.map((row) => getRowDivFromRow(row));
      return (
        <div
          className="flex flex-col flex-nowrap bg-white"
          style={{ width: pageWidth, height: pageHeight, gap: gap }}
        >
          {rowDivs}
        </div>
      );
    },
    [getRowDivFromRow],
  );

  const createSheetMusicRef = useCallback(() => {
    const pageDivs = pages.current.map((page) => getPageDivFromPage(page));
    return <div className="flex flex-col gap-4">{pageDivs}</div>;
  }, [getPageDivFromPage]);

  const getPageClientWidth = useCallback(() => {
    return pageWidth;
  }, []);

  const getPageClientHeight = useCallback(() => {
    return pageHeight;
  }, []);

  const getCrtRowWidth = useCallback(() => {
    return crtRow.current
      .map((elem) => elem.width)
      .reduce((prev, crt) => prev + crt, 0);
  }, []);

  const flushCrtPageRef = useCallback(() => {
    if (crtPage.current.length === 0) {
      return;
    }

    pages.current.push(crtPage.current);
    crtPage.current = [];
  }, []);

  const flushCrtRowRef = useCallback(() => {
    if (crtRow.current.length === 0) {
      return;
    }

    crtPage.current.push(crtRow.current);
    crtRow.current = [];
  }, []);

  const onChunkRenderRef = useCallback(
    (
      chunkIndex: number,
      width: number,
      height: number,
      chunkStavesYs: number[],
    ) => {
      console.log(chunkIndex);
      const crtRowWidth = getCrtRowWidth();

      if (crtRowWidth + width > getPageClientWidth()) {
        flushCrtRowRef();
      }
      crtRow.current.push({
        index: chunkIndex,
        width: width,
        height: height,
        stavesYs: chunkStavesYs,
      });
      bumpIndexRef();
    },
    [getPageClientWidth, flushCrtRowRef, getCrtRowWidth],
  );

  const bumpIndexRef = useCallback(() => {
    if (crtIndex.current >= measureCountRef.current) {
      console.log(
        JSON.stringify(oldStaffSystem.current) === JSON.stringify(staffSystem),
      );
      flushCrtRowRef();
      flushCrtPageRef();
      onSheetMusic(createSheetMusicRef());
      return;
    }

    const index = crtIndex.current;

    const chunkToRender = (
      <Chunk
        staffSystem={getStaffSystemAtIndex(staffSystem, index)}
        stavesYs={null}
        onRender={(width, height, chunkStavesYs) =>
          onChunkRenderRef(index, width, height, chunkStavesYs)
        }
      />
    );

    if (chunkToRender != null) {
      crtIndex.current++;
      setChunkToRender(chunkToRender);
    }
  }, [
    staffSystem,
    onChunkRenderRef,
    createSheetMusicRef,
    flushCrtRowRef,
    flushCrtPageRef,
    onSheetMusic,
  ]);

  useEffect(() => {
    oldStaffSystem.current = structuredClone(staffSystem);
    crtRow.current = [];
    crtIndex.current = 0;
    measureCountRef.current = 0;
    setChunkToRender(null);

    if (staffSystem.staves.length > 0) {
      measureCountRef.current = requireNotNull(
        staffSystem.staves.at(0),
      ).measures.length;
      if (
        staffSystem.staves.some(
          (staff) => staff.measures.length !== measureCountRef.current,
        )
      ) {
        throw new Error("All staves must have the same number of measures");
      }

      bumpIndexRef();
    }
  }, [staffSystem, bumpIndexRef]);

  return <div className="hidden">{chunkToRender}</div>;
}
