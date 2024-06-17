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

  const crtModeRef = useRef<"normal" | "visual" | "insert" | "command">(
    "normal",
  );
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
      staffSystemEditor.moveCursorLeft();
      updateStaffSystemElement();
    });
    trie.addWord("l", () => {
      staffSystemEditor.moveCursorRight();
      updateStaffSystemElement();
    });
    trie.addWord("j", () => {
      staffSystemEditor.increaseCursorVoice();
      updateStaffSystemElement();
    });
    trie.addWord("k", () => {
      staffSystemEditor.decreaseCursorVoice();
      updateStaffSystemElement();
    });
    trie.addWord("gj", () => {
      staffSystemEditor.increaseCursorStaff();
      updateStaffSystemElement();
    });
    trie.addWord("gk", () => {
      staffSystemEditor.decreaseCursorStaff();
      updateStaffSystemElement();
    });
    trie.addWord("md", () => {
      staffSystemEditor.removeMeasures();
      updateStaffSystemElement();
    });
    trie.addWord("ml", () => {
      staffSystemEditor.swapMeasureRight();
      updateStaffSystemElement();
    });
    trie.addWord("mh", () => {
      staffSystemEditor.swapMeasureLeft();
      updateStaffSystemElement();
    });
    trie.addWord("na", () => {
      staffSystemEditor.moveCursorPosition(-4);
      updateStaffSystemElement();
    });
    trie.addWord("ns", () => {
      staffSystemEditor.moveCursorPosition(-3);
      updateStaffSystemElement();
    });
    trie.addWord("nd", () => {
      staffSystemEditor.moveCursorPosition(-2);
      updateStaffSystemElement();
    });
    trie.addWord("nf", () => {
      staffSystemEditor.moveCursorPosition(-1);
      updateStaffSystemElement();
    });
    trie.addWord("nj", () => {
      staffSystemEditor.moveCursorPosition(1);
      updateStaffSystemElement();
    });
    trie.addWord("nk", () => {
      staffSystemEditor.moveCursorPosition(2);
      updateStaffSystemElement();
    });
    trie.addWord("nl", () => {
      staffSystemEditor.moveCursorPosition(3);
      updateStaffSystemElement();
    });
    trie.addWord("n;", () => {
      staffSystemEditor.moveCursorPosition(4);
      updateStaffSystemElement();
    });
    trie.addWord("rn", () => {
      staffSystemEditor.insertRow(
        staffSystemEditor.getStaffSystemMeasureCount(),
      );
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
            crtModeRef.current = "insert";
            break;
          case "v":
            crtModeRef.current = "visual";
            break;
          case ":":
            crtModeRef.current = "command";
            break;
        }
        setMode(crtModeRef.current);
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
        crtModeRef.current = "normal";
        setMode(crtModeRef.current);
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
        crtModeRef.current = "normal";
        setMode(crtModeRef.current);
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
        crtModeRef.current = "normal";
        setMode(crtModeRef.current);
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
        crtModeRef.current = "normal";
        setMode(crtModeRef.current);
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

      switch (crtModeRef.current) {
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
    crtModeRef.current = "normal";
    setMode(crtModeRef.current);
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
        className="grid place-content-center outline-none p-4"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard events are needed
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <StaffSystemElement
          staffSystem={staffSystem}
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
