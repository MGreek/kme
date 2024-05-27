import type { StaffSystem } from "../model/staff-system";
import StaffSystemElement from "./StaffSystemElement";

export default function RawRowDisplay({
  staffSystem,
  startMeasureIndex,
  endMeasureIndex,
  overridenStavesYs,
}: {
  staffSystem: StaffSystem;
  startMeasureIndex: number;
  endMeasureIndex: number;
  overridenStavesYs: number[];
}) {
  const elements = [];
  for (
    let measureIndex = startMeasureIndex;
    measureIndex <= endMeasureIndex;
    measureIndex++
  ) {
    elements.push(
      <StaffSystemElement
        key={JSON.stringify({
          staffSystemId: staffSystem.staffSystemId.staffSystemId,
          measureIndex,
        })}
        staffSystem={staffSystem}
        measureIndex={measureIndex}
        drawConnector={measureIndex === startMeasureIndex}
        drawLeftLine={measureIndex === startMeasureIndex}
        drawRightLine={true}
        overridenStavesYs={overridenStavesYs}
        onRender={null}
      />,
    );
  }

  return <div className="flex flex-row flex-nowrap gap-0">{elements}</div>;
}
