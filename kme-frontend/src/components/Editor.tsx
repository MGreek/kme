import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { SVGContext, type RenderContext } from "vexflow";
import {
  type RenderOptions,
  renderStaffSystemAtIndex,
  type StaffSystem,
} from "vexflow-repl";

export default function Editor({ staffSystem }: { staffSystem: StaffSystem }) {
  const renderContextRef = useRef<RenderContext>();
  const divRef = useRef<HTMLDivElement>(null);

  function renderStaffSystem() {
    const div = divRef.current;
    if (div == null) {
      return;
    }
    div.id = uuidv4();

    const options: RenderOptions = {
      totalWidth: div.clientWidth,
      totalHeight: div.clientHeight,
      x: 50,
      y: 0,
      defaultStaveWidth: 350,
      defaultSystemGap: 12,
      clear: true,
      drawConnector: true,
    };

    if (renderContextRef.current == null) {
      renderContextRef.current = new SVGContext(div).resize(
        div.clientWidth,
        div.clientHeight,
      );
    }
    renderStaffSystemAtIndex(renderContextRef.current, staffSystem, 0, options);
  }

  useEffect(() => {
    renderStaffSystem();
  }, [renderStaffSystem]);

  return <div className="sheetmusic-page mx-auto bg-blue-50" ref={divRef} />;
}
