import { useRef, useState } from "react";
import { onDeleteStaffSystemById, onSetStaffSystemById } from "./api/request";
import Editor from "./components/Editor";
import Explorer from "./components/Explorer";
import type { StaffSystem } from "./model/staff-system";
import { requireNotNull } from "./util/require-not-null";

enum ComponentType {
  Explorer = "Explorer",
  Editor = "Editor",
}

export default function App() {
  const staffSystemRef = useRef<StaffSystem | null>(null);
  const [componentType, setComponentType] = useState<ComponentType>(
    ComponentType.Explorer,
  );

  let component: JSX.Element | null = null;
  switch (componentType) {
    case ComponentType.Explorer:
      component = (
        <Explorer
          onOpen={(staffSystem) => {
            staffSystemRef.current = staffSystem;
            setComponentType(ComponentType.Editor);
          }}
          onDelete={(staffSystemId) => {
            onDeleteStaffSystemById(staffSystemId, (success) => {
              if (!success) {
                alert("Failed to delete staff system");
              }
            });
          }}
        />
      );
      break;
    case ComponentType.Editor:
      component = (
        <Editor
          pagePadding={{
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
          }}
          initialStaffSystem={requireNotNull(
            staffSystemRef.current,
            "Expected staffSystemRef to be initialized",
          )}
          onExplore={() => {
            setComponentType(ComponentType.Explorer);
          }}
          onWrite={(staffSystem: StaffSystem) => {
            onSetStaffSystemById(staffSystem, (success) => {
              if (!success) {
                alert(
                  `Failed to persist staff system with id: ${staffSystem.staffSystemId.staffSystemId}`,
                );
              }
            });
          }}
        />
      );
      break;
    default:
      throw new Error("Unknown component type");
  }

  return component;
}
