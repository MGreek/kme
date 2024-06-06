import { useCallback, useEffect, useRef, useState } from "react";
import request from "../api/request";
import type { StaffSystem, StaffSystemId } from "../model/staff-system";
import StaffSystemElement from "./StaffSystemElement";

export default function Editor({
  staffSystemId,
  pageGap,
  pagePadding,
}: {
  staffSystemId: StaffSystemId | null;
  pageGap: number;
  pagePadding: { left: number; right: number; top: number; bottom: number };
}) {
  const [staffSystemElement, setStaffSystemElement] =
    useState<JSX.Element | null>(null);

  const crtMode = useRef<"normal" | "visual" | "insert" | "command">("normal");
  const [mode, setMode] = useState<"normal" | "visual" | "insert" | "command">(
    "normal",
  );

  const crtCommandRef = useRef<string>("");
  const [command, setCommand] = useState<string>("");

  const normalHandleInput = useCallback((word: string) => {
    if (word === "Escape") {
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }
    if (
      crtCommandRef.current === "" &&
      (word === "i" || word === "v" || word === ":")
    ) {
      switch (word) {
        case "i":
          crtMode.current = "insert";
          break;
        case "v":
          crtMode.current = "visual";
          break;
        case ":":
          crtMode.current = "command";
          break;
      }
      setMode(crtMode.current);
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }
    if (word === "Enter") {
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }

    crtCommandRef.current += word;
    setCommand(crtCommandRef.current);
  }, []);

  const visualHandleInput = useCallback((word: string) => {
    if (word === "Escape") {
      crtMode.current = "normal";
      setMode(crtMode.current);
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }
    if (word === "Enter") {
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }

    crtCommandRef.current += word;
    setCommand(crtCommandRef.current);
  }, []);

  const insertHandleInput = useCallback((word: string) => {
    if (word === "Escape") {
      crtMode.current = "normal";
      setMode(crtMode.current);
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }
    if (word === "Enter") {
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }

    crtCommandRef.current += word;
    setCommand(crtCommandRef.current);
  }, []);

  const commandHandleInput = useCallback((word: string) => {
    if (word === "Escape") {
      crtMode.current = "normal";
      setMode(crtMode.current);
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }
    if (word === "Enter") {
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
      return;
    }

    crtCommandRef.current += word;
    setCommand(crtCommandRef.current);
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (staffSystemElement == null) {
      return;
    }

    if (
      event.key !== "Escape" &&
      event.key !== "Enter" &&
      event.key.length !== 1
    ) {
      return;
    }

    switch (crtMode.current) {
      case "normal":
        normalHandleInput(event.key);
        break;
      case "visual":
        visualHandleInput(event.key);
        break;
      case "insert":
        insertHandleInput(event.key);
        break;
      case "command":
        commandHandleInput(event.key);
        break;
      default:
        throw new Error("Unknown mode");
    }
  };

  useEffect(() => {
    let url = "/api/staff-system/";
    if (staffSystemId == null) {
      url += "sample";
    } else {
      url += staffSystemId.staffSystemId;
    }

    crtMode.current = "normal";
    setMode(crtMode.current);
    crtCommandRef.current = "";
    setCommand(crtCommandRef.current);

    request<StaffSystem>("GET", url, {}).then((response) => {
      setStaffSystemElement(
        <StaffSystemElement
          staffSystem={response.data}
          pageGap={pageGap}
          pagePadding={pagePadding}
        />,
      );
    });
  }, [staffSystemId, pageGap, pagePadding]);

  if (staffSystemElement == null) {
    return <div />;
  }

  return (
    <div>
      <div
        className="grid bg-gray-400 place-content-center p-4"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard events are needed
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {staffSystemElement}
      </div>
      <div className="bg-red-400 fixed bottom-4 left-10">{mode}</div>
      <div className="bg-red-400 fixed bottom-4 right-10">{command}</div>
    </div>
  );
}
