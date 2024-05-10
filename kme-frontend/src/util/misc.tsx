import { v4 as uuidv4 } from "uuid";
import Chunk from "../components/Chunk";
import type { StaffSystem } from "../model/staff-system";
import { requireNotNull } from "./require-not-null";

export function getStaffSystemAtIndex(
  staffSystem: StaffSystem,
  index: number,
): StaffSystem {
  const staffSystemSlice = { ...staffSystem };
  staffSystemSlice.staves = staffSystem.staves.map((staff) => {
    const staffSlice = { ...staff };
    staffSlice.measures = [requireNotNull(staff.measures.at(index))];
    return staffSlice;
  });
  return staffSystemSlice;
}

export function getChunksFromStaffSystem(
  staffSystem: StaffSystem,
  stavesYs: number[] | null,
  onRender:
    | ((
        chunkIndex: number,
        width: number,
        height: number,
        stavesCoords: number[],
      ) => void)
    | null,
): JSX.Element[] {
  if (staffSystem.staves.length === 0) {
    return [];
  }

  const measureCount = requireNotNull(staffSystem.staves.at(0)).measures.length;
  if (
    staffSystem.staves.some((staff) => staff.measures.length !== measureCount)
  ) {
    throw new Error("All staves must have the same number of measures");
  }

  const chunks = [];
  for (let index = 0; index < measureCount; index++) {
    const newChunk = (
      <Chunk
        key={uuidv4()} // random ID because we always want to rerender
        staffSystem={getStaffSystemAtIndex(staffSystem, index)}
        onRender={(width: number, height: number, stavesCoords: number[]) => {
          if (onRender != null) {
            onRender(index, width, height, stavesCoords);
          }
        }}
        stavesYs={stavesYs}
      />
    );

    chunks.push(newChunk);
  }

  return chunks;
}
