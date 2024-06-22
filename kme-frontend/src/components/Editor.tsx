import { useCallback, useEffect, useRef, useState } from "react";
import { onGetStaffSystemById } from "../api/request";
import type { StaffSystem } from "../model/staff-system";
import { Trie } from "../util/graph";
import { requireNotNull } from "../util/require-not-null";
import { StaffSystemEditor } from "../util/staff-system-editor";
import StaffSystemElement from "./StaffSystemElement";
import { StemType } from "../model/stem";
import { Clef, KeySignature, TimeSignature } from "../model/measure";
import { Accidental } from "../model/note";
import { DEFAULT_STAFF_SYSTEM_GAP } from "../util/metadata";

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
    trie.addWord("mx", () => {
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
    trie.addWord("ma", () => {
      staffSystemEditor.insertMeasure(
        staffSystemEditor.getStaffSystemMeasureCount(),
      );
      updateStaffSystemElement();
    });
    trie.addWord("mj", () => {
      staffSystemEditor.join();
      updateStaffSystemElement();
    });
    trie.addWord("mb", () => {
      staffSystemEditor.break();
      updateStaffSystemElement();
    });
    trie.addWord("nc", () => {
      staffSystemEditor.toggleType();
      updateStaffSystemElement();
    });
    trie.addWord("n1", () => {
      staffSystemEditor.setDuration(StemType.Whole);
      updateStaffSystemElement();
    });
    trie.addWord("n2", () => {
      staffSystemEditor.setDuration(StemType.Half);
      updateStaffSystemElement();
    });
    trie.addWord("n3", () => {
      staffSystemEditor.setDuration(StemType.Quarter);
      updateStaffSystemElement();
    });
    trie.addWord("n4", () => {
      staffSystemEditor.setDuration(StemType.Eight);
      updateStaffSystemElement();
    });
    trie.addWord("n5", () => {
      staffSystemEditor.setDuration(StemType.Sixteenth);
      updateStaffSystemElement();
    });
    trie.addWord("n6", () => {
      staffSystemEditor.setDuration(StemType.Thirtysecond);
      updateStaffSystemElement();
    });
    trie.addWord("n7", () => {
      staffSystemEditor.setDuration(StemType.Sixtyfourth);
      updateStaffSystemElement();
    });
    trie.addWord("nx", () => {
      staffSystemEditor.deleteNote();
      updateStaffSystemElement();
    });
    trie.addWord("nb", () => {
      staffSystemEditor.insertNoteBottom();
      updateStaffSystemElement();
    });
    trie.addWord("nt", () => {
      staffSystemEditor.insertNoteTop();
      updateStaffSystemElement();
    });
    trie.addWord("nv", () => {
      staffSystemEditor.appendVoice();
      updateStaffSystemElement();
    });
    trie.addWord("nqdf", () => {
      staffSystemEditor.setAccidental(Accidental.DoubleFlat);
      updateStaffSystemElement();
    });
    trie.addWord("nqf", () => {
      staffSystemEditor.setAccidental(Accidental.Flat);
      updateStaffSystemElement();
    });
    trie.addWord("nqx", () => {
      staffSystemEditor.setAccidental(Accidental.None);
      updateStaffSystemElement();
    });
    trie.addWord("nqn", () => {
      staffSystemEditor.setAccidental(Accidental.Natural);
      updateStaffSystemElement();
    });
    trie.addWord("nqs", () => {
      staffSystemEditor.setAccidental(Accidental.Sharp);
      updateStaffSystemElement();
    });
    trie.addWord("nqds", () => {
      staffSystemEditor.setAccidental(Accidental.DoubleSharp);
      updateStaffSystemElement();
    });
    trie.addWord("ck", () => {
      staffSystemEditor.increaseCursorNote();
      updateStaffSystemElement();
    });
    trie.addWord("cj", () => {
      staffSystemEditor.decreaseCursorNote();
      updateStaffSystemElement();
    });
    trie.addWord("mcb", () => {
      staffSystemEditor.setClef(Clef.Bass);
      updateStaffSystemElement();
    });
    trie.addWord("mca", () => {
      staffSystemEditor.setClef(Clef.Alto);
      updateStaffSystemElement();
    });
    trie.addWord("mct", () => {
      staffSystemEditor.setClef(Clef.Treble);
      updateStaffSystemElement();
    });
    trie.addWord("mkn", () => {
      staffSystemEditor.setKeySignature(KeySignature.None);
      updateStaffSystemElement();
    });
    trie.addWord("smj", () => {
      staffSystemEditor.swapStaffDown();
      updateStaffSystemElement();
    });
    trie.addWord("smk", () => {
      staffSystemEditor.swapStaffUp();
      updateStaffSystemElement();
    });
    trie.addWord("sx", () => {
      staffSystemEditor.deleteStaff();
      updateStaffSystemElement();
    });
    trie.addWord("sa", () => {
      staffSystemEditor.insertStaff(staffSystemEditor.getStaffCount());
      updateStaffSystemElement();
    });
    trie.addWord("sr+", () => {
      staffSystemEditor.shiftSpaceBetweenStaves(2);
      updateStaffSystemElement();
    });
    trie.addWord("sr-", () => {
      staffSystemEditor.shiftSpaceBetweenStaves(-2);
      updateStaffSystemElement();
    });
    trie.addWord("sr=", () => {
      staffSystemEditor.setSpaceBetweenStaves(DEFAULT_STAFF_SYSTEM_GAP);
      updateStaffSystemElement();
    });
    const sharps = [
      KeySignature.Sharp1,
      KeySignature.Sharp2,
      KeySignature.Sharp3,
      KeySignature.Sharp4,
      KeySignature.Sharp5,
      KeySignature.Sharp6,
      KeySignature.Sharp7,
    ];
    const flats = [
      KeySignature.Flat1,
      KeySignature.Flat2,
      KeySignature.Flat3,
      KeySignature.Flat4,
      KeySignature.Flat5,
      KeySignature.Flat6,
      KeySignature.Flat7,
    ];
    for (let index = 0; index < sharps.length; index++) {
      const sharp = requireNotNull(sharps[index]);
      const flat = requireNotNull(flats[index]);
      trie.addWord(`mks${index + 1}`, () => {
        staffSystemEditor.setKeySignature(sharp);
        updateStaffSystemElement();
      });
      trie.addWord(`mkf${index + 1}`, () => {
        staffSystemEditor.setKeySignature(flat);
        updateStaffSystemElement();
      });
    }
    trie.addWord("mt24", () => {
      staffSystemEditor.setTimeSignature(TimeSignature.TwoFour);
      updateStaffSystemElement();
    });
    trie.addWord("mt34", () => {
      staffSystemEditor.setTimeSignature(TimeSignature.ThreeFour);
      updateStaffSystemElement();
    });
    trie.addWord("mt44", () => {
      staffSystemEditor.setTimeSignature(TimeSignature.FourFour);
      updateStaffSystemElement();
    });
    trie.addWord("gs", () => {
      staffSystemEditor.splitGrouping();
      updateStaffSystemElement();
    });
    trie.addWord("gm", () => {
      staffSystemEditor.mergeGrouping();
      updateStaffSystemElement();
    });
    trie.addWord("gt", () => {
      staffSystemEditor.toggleGroupStemDirection();
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
    const staffSystemEditor = requireNotNull(
      staffSystemEditorRef.current,
      "Expected staffSystemEditorRef to be initialized",
    );
    const trie = new Trie<() => void>();
    for (const [index, word] of ["f", "d", "s", "a"].entries()) {
      trie.addWord(word, () => {
        staffSystemEditor.insertNoteRelativeToCursor(-(index + 1));
        updateStaffSystemElement();
      });
    }
    for (const [index, word] of ["j", "k", "l", ";"].entries()) {
      trie.addWord(word, () => {
        staffSystemEditor.insertNoteRelativeToCursor(index + 1);
        updateStaffSystemElement();
      });
    }
    trie.addWord(" ", () => {
      staffSystemEditor.insertNoteRelativeToCursor(0);
      updateStaffSystemElement();
    });

    insertTrieRef.current = trie;
  }, [updateStaffSystemElement]);

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

  const onRowDivRendered = useCallback((div: HTMLDivElement, index: number) => {
    const staffSystemEditor = requireNotNull(
      staffSystemEditorRef.current,
      "Expected staffSystemEditorRef to be initialized",
    );
    const rowIndex = staffSystemEditor.getCursorRowIndex();
    if (rowIndex === index) {
      const divRect = div.getBoundingClientRect();
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (
        0 <= divRect.left &&
        divRect.right <= width &&
        0 <= divRect.top &&
        divRect.bottom <= height
      ) {
        return;
      }
      div.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
    }
  }, []);

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
          onRowDivRendered={onRowDivRendered}
        />
      </div>
      <div className="bg-red-400 fixed bottom-4 left-10">{mode}</div>
      <div className="bg-red-400 fixed bottom-4 right-10 whitespace-pre">
        {command}
      </div>
    </div>
  );
}
