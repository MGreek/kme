import { useCallback, useState } from "react";
import Explorer from "./components/Explorer";
import type { StaffSystem } from "./model/staff-system";
import Editor from "./components/Editor";

export default function App() {
  const onStaffSystemSelected = useCallback((staffSystem: StaffSystem) => {
    setComponent(
      <Editor
        pagePadding={{
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        }}
        initialStaffSystem={staffSystem}
      />,
    );
  }, []);

  const [component, setComponent] = useState<JSX.Element>(
    <Explorer onOpen={onStaffSystemSelected} />,
  );

  return component;
}
