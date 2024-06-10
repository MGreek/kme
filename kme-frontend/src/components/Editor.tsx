import { useCallback, useEffect, useRef, useState } from "react";
import { onGetStaffSystemById } from "../api/request";
import type { StaffSystem } from "../model/staff-system";
import { Trie } from "../util/graph";
import { requireNotNull } from "../util/require-not-null";
import { StaffSystemEditor } from "../util/staff-system-editor";
import StaffSystemElement from "./StaffSystemElement";

export default function Editor({
  pagePadding,
}: {
  pagePadding: { left: number; right: number; top: number; bottom: number };
}) {
  const staffSystemEditorRef = useRef<StaffSystemEditor | null>(null);

  const [staffSystem, setStaffSystem] = useState<StaffSystem | null>(null);

  const crtMode = useRef<"normal" | "visual" | "insert" | "command">("normal");
  const [mode, setMode] = useState<"normal" | "visual" | "insert" | "command">(
    "normal",
  );

  const crtCommandRef = useRef<string>("");
  const [command, setCommand] = useState<string>("");

  const normalTrieRef = useRef<Trie<() => void> | null>(null);
  const visualTrieRef = useRef<Trie<() => void> | null>(null);
  const insertTrieRef = useRef<Trie<() => void> | null>(null);

  const updateStaffSystemElement = useCallback(() => {
    const staffSystemEditor = requireNotNull(
      staffSystemEditorRef.current,
      "Expected staffSystemEditorRef to be initialized",
    );
    setStaffSystem(staffSystemEditor.getStaffSystem());
  }, []);

  const initNormalTrie = useCallback(() => {
    const staffSystemEditor = requireNotNull(
      staffSystemEditorRef.current,
      "Expected staffSystemEditorRef to be initialized",
    );
    const trie = new Trie<() => void>();
    trie.addWord("h", () => {
      console.log("left");
    });
    trie.addWord("l", () => {
      console.log("right");
      staffSystemEditor.moveCursorRight();
      updateStaffSystemElement();
    });

    normalTrieRef.current = trie;
  }, [updateStaffSystemElement]);

  const initVisualTrie = useCallback(() => {
    const trie = new Trie<() => void>();
    trie.addWord("jv", () => {
      console.log("jv");
    });

    visualTrieRef.current = trie;
  }, []);

  const initInsertTrie = useCallback(() => {
    const trie = new Trie<() => void>();
    trie.addWord("ji", () => {
      console.log("ji");
    });

    insertTrieRef.current = trie;
  }, []);

  const onCommandEnter = useCallback((command: string) => {
    console.log("COMMAND", command);
  }, []);

  const normalHandleInput = useCallback(
    (word: string) => {
      if (word === "Escape" || word === "Backspace") {
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

      if (normalTrieRef.current == null) {
        initNormalTrie();
      }

      const trie = requireNotNull(
        normalTrieRef.current,
        "Expected normalTrieRef to be initialized",
      );

      const data = trie.getDataByWord(crtCommandRef.current);
      if (data != null) {
        data();
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }

      const isPrefix = trie.isPrefix(crtCommandRef.current);
      if (!isPrefix) {
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }
    },
    [initNormalTrie],
  );

  const visualHandleInput = useCallback(
    (word: string) => {
      if (word === "Escape") {
        crtMode.current = "normal";
        setMode(crtMode.current);
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }
      if (word === "Backspace") {
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

      if (visualTrieRef.current == null) {
        initVisualTrie();
      }

      const trie = requireNotNull(
        visualTrieRef.current,
        "Expected visualTrieRef to be initialized",
      );

      const data = trie.getDataByWord(crtCommandRef.current);
      if (data != null) {
        data();
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }

      const isPrefix = trie.isPrefix(crtCommandRef.current);
      if (!isPrefix) {
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }
    },
    [initVisualTrie],
  );

  const insertHandleInput = useCallback(
    (word: string) => {
      if (word === "Escape") {
        crtMode.current = "normal";
        setMode(crtMode.current);
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }
      if (word === "Backspace") {
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

      if (insertTrieRef.current == null) {
        initInsertTrie();
      }

      const trie = requireNotNull(
        insertTrieRef.current,
        "Expected insertTrieRef to be initialized",
      );

      const data = trie.getDataByWord(crtCommandRef.current);
      if (data != null) {
        data();
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }

      const isPrefix = trie.isPrefix(crtCommandRef.current);
      if (!isPrefix) {
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }
    },
    [initInsertTrie],
  );

  const commandHandleInput = useCallback(
    (word: string) => {
      if (word === "Escape") {
        crtMode.current = "normal";
        setMode(crtMode.current);
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }
      if (word === "Backspace") {
        if (crtCommandRef.current.length > 0) {
          crtCommandRef.current = crtCommandRef.current.slice(0, -1);
          setCommand(crtCommandRef.current);
        }
        return;
      }
      if (word === "Enter") {
        onCommandEnter(crtCommandRef.current);
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }

      crtCommandRef.current += word;
      setCommand(crtCommandRef.current);
    },
    [onCommandEnter],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (staffSystem == null) {
        return;
      }

      if (
        event.key !== "Escape" &&
        event.key !== "Enter" &&
        event.key !== "Backspace" &&
        event.key.length !== 1
      ) {
        return;
      }

      // prevent scrolling by space
      if (event.key === " ") {
        event.preventDefault();
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
    },
    [
      staffSystem,
      normalHandleInput,
      visualHandleInput,
      insertHandleInput,
      commandHandleInput,
    ],
  );

  useEffect(() => {
    crtMode.current = "normal";
    setMode(crtMode.current);
    crtCommandRef.current = "";
    setCommand(crtCommandRef.current);

    onGetStaffSystemById(null, (staffSystem: StaffSystem | null) => {
      if (staffSystem == null) {
        return;
      }
      staffSystemEditorRef.current = new StaffSystemEditor(staffSystem);
      updateStaffSystemElement();
    });
  }, [updateStaffSystemElement]);

  if (staffSystem == null) {
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
        <StaffSystemElement
          staffSystem={staffSystem}
          rowCount={10}
          pagePadding={pagePadding}
        />
      </div>
      <div className="bg-red-400 fixed bottom-4 left-10">{mode}</div>
      <div className="bg-red-400 fixed bottom-4 right-10 whitespace-pre">
        {command}
      </div>
    </div>
  );
}
