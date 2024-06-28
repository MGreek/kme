import { useCallback, useEffect, useRef, useState } from "react";
import { Clef, KeySignature, TimeSignature } from "../model/measure";
import { Accidental } from "../model/note";
import { ConnectorType, type StaffSystem } from "../model/staff-system";
import { StemType } from "../model/stem";
import { Trie } from "../util/graph";
import {
  DEFAULT_STAFF_SYSTEM_GAP,
  parseStaffSystemMetadata,
} from "../util/metadata";
import { requireNotNull } from "../util/require-not-null";
import { StaffSystemEditor } from "../util/staff-system-editor";
import StaffSystemElement from "./StaffSystemElement";

interface Bind {
  word: string;
  callback: () => void;
  description?: string;
  mode: "normal" | "insert" | "visual" | "help";
}

export default function Editor({
  pagePadding,
  initialStaffSystem,
  onExplore,
  onWrite,
}: {
  pagePadding: { left: number; right: number; top: number; bottom: number };
  initialStaffSystem: StaffSystem;
  onExplore?: () => void;
  onWrite?: (staffSystem: StaffSystem) => void;
}) {
  const staffSystemEditorRef = useRef<StaffSystemEditor | null>(null);

  const [staffSystem, setStaffSystem] = useState<StaffSystem | null>(null);

  const crtModeRef = useRef<
    "normal" | "visual" | "insert" | "command" | "help"
  >("normal");
  const [mode, setMode] = useState<
    "normal" | "visual" | "insert" | "command" | "help"
  >("normal");

  const [selectedHelpMode, setSelectedHelpMode] = useState<
    "normal" | "insert" | "help"
  >("help");

  const crtCommandRef = useRef<string>("");
  const [command, setCommand] = useState<string>("");

  const normalTrieRef = useRef<Trie<() => void> | null>(null);
  const visualTrieRef = useRef<Trie<() => void> | null>(null);
  const insertTrieRef = useRef<Trie<() => void> | null>(null);
  const helpTrieRef = useRef<Trie<() => void> | null>(null);

  const helpDivRef = useRef<HTMLDivElement | null>(null);

  const updateStaffSystemElement = useCallback(() => {
    const staffSystemEditor = requireNotNull(
      staffSystemEditorRef.current,
      "Expected staffSystemEditorRef to be initialized",
    );
    setStaffSystem(staffSystemEditor.getStaffSystem());
  }, []);

  const getMeasureKeySignatureNormalBinds = useCallback(() => {
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
    const measureBinds: Bind[] = [
      {
        word: "mx",
        description: "remove measure",
        callback: () => {
          const staffSystemEditor = requireNotNull(
            staffSystemEditorRef.current,
            "Expected staffSystemEditorRef to be initialized",
          );
          staffSystemEditor.removeMeasures();
          updateStaffSystemElement();
        },
        mode: "normal",
      },
    ];
    for (let index = 0; index < sharps.length; index++) {
      const sharp = requireNotNull(sharps[index]);
      const flat = requireNotNull(flats[index]);
      measureBinds.push({
        word: `mks${index + 1}`,
        description: `set key signature with ${index + 1} sharp(s)`,
        callback: () => {
          const staffSystemEditor = requireNotNull(
            staffSystemEditorRef.current,
            "Expected staffSystemEditorRef to be initialized",
          );
          staffSystemEditor.setKeySignature(sharp);
          updateStaffSystemElement();
        },
        mode: "normal",
      });
      measureBinds.push({
        word: `mkf${index + 1}`,
        description: `set key signature with ${index + 1} flat(s)`,
        callback: () => {
          const staffSystemEditor = requireNotNull(
            staffSystemEditorRef.current,
            "Expected staffSystemEditorRef to be initialized",
          );
          staffSystemEditor.setKeySignature(flat);
          updateStaffSystemElement();
        },
        mode: "normal",
      });
    }
    return measureBinds;
  }, [updateStaffSystemElement]);

  const getNoteInsertBinds = useCallback(() => {
    const insertBinds: Bind[] = [
      {
        word: "g",
        description: "duplicate note",
        callback: () => {
          const staffSystemEditor = requireNotNull(
            staffSystemEditorRef.current,
            "Expected staffSystemEditorRef to be initialized",
          );
          staffSystemEditor.insertNoteRelativeToCursor(0);
          updateStaffSystemElement();
        },
        mode: "insert",
      },
    ];
    for (const [index, word] of ["f", "d", "s", "a"].entries()) {
      insertBinds.push({
        word: word,
        description: `insert relative note (offset: ${-(index + 1)})`,
        callback: () => {
          const staffSystemEditor = requireNotNull(
            staffSystemEditorRef.current,
            "Expected staffSystemEditorRef to be initialized",
          );
          staffSystemEditor.insertNoteRelativeToCursor(-(index + 1));
          updateStaffSystemElement();
        },
        mode: "insert",
      });
    }
    for (const [index, word] of ["j", "k", "l", ";"].entries()) {
      insertBinds.push({
        word: word,
        description: `insert relative note (offset: ${index + 1})`,
        callback: () => {
          const staffSystemEditor = requireNotNull(
            staffSystemEditorRef.current,
            "Expected staffSystemEditorRef to be initialized",
          );
          staffSystemEditor.insertNoteRelativeToCursor(index + 1);
          updateStaffSystemElement();
        },
        mode: "insert",
      });
    }
    return insertBinds;
  }, [updateStaffSystemElement]);

  const binds = useRef<Bind[]>([
    {
      word: "h",
      description: "cursor left",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorLeft();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "l",
      description: "cursor right",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorRight();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "j",
      description: "increase voice",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.increaseCursorVoice();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "k",
      description: "decrease voice",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.decreaseCursorVoice();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sj",
      description: "next staff",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.increaseCursorStaff();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sk",
      description: "previous staff",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.decreaseCursorStaff();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "na",
      description: "decrease note position by 4",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorPosition(-4);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "ns",
      description: "decrease note position by 3",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorPosition(-3);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nd",
      description: "decrease note position by 2",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorPosition(-2);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nf",
      description: "decrease note position by 1",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorPosition(-1);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nj",
      description: "increase note position by 1",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorPosition(1);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nk",
      description: "increase note position by 2",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorPosition(2);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nl",
      description: "increase note position by 3",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorPosition(3);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "n;",
      description: "increase note position by 4",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.moveCursorPosition(4);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nc",
      description: "convert note to rest or rest to note",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.toggleType();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "n1",
      description: "set whole stem type",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setDuration(StemType.Whole);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "n2",
      description: "set half stem type",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setDuration(StemType.Half);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "n3",
      description: "set quarter stem type",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setDuration(StemType.Quarter);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "n4",
      description: "set eight stem type",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setDuration(StemType.Eight);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "n5",
      description: "set sixteenth stem type",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setDuration(StemType.Sixteenth);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "n6",
      description: "set thirty-sixth stem type",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setDuration(StemType.Thirtysecond);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "n7",
      description: "set sixty-fourth stem type",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setDuration(StemType.Sixtyfourth);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nx",
      description: "remove note",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.deleteNote();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nqdf",
      description: "set accidental to double flat",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setAccidental(Accidental.DoubleFlat);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nqf",
      description: "set accidental to flat",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setAccidental(Accidental.Flat);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nqx",
      description: "remove accidental",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setAccidental(Accidental.None);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nqn",
      description: "set accidental to natural",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setAccidental(Accidental.Natural);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nqs",
      description: "set accidental to sharp",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setAccidental(Accidental.Sharp);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "nqds",
      description: "set accidental to double sharp",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.setAccidental(Accidental.DoubleSharp);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "cb",
      description: "insert bottom note in chord",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.insertNoteBottom();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "ct",
      description: "insert top note in chord",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.insertNoteTop();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "ck",
      description: "move up in chord",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.increaseCursorNote();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "cj",
      description: "move down in chord",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.decreaseCursorNote();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    ...getMeasureKeySignatureNormalBinds(),
    {
      word: "mh",
      description: "move measure to the left",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.swapMeasureLeft();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "ml",
      description: "move measure to the right",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditorRef to be initialized",
        );
        staffSystemEditor.swapMeasureRight();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "ma",
      description: "append measure",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.insertMeasure(
          staffSystemEditor.getStaffSystemMeasureCount(),
        );
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mj",
      description: "join measure",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.join();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mb",
      description: "break measure",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.break();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mcb",
      description: "set cleff to bass",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setClef(Clef.Bass);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mca",
      description: "set cleff to alto",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setClef(Clef.Alto);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mct",
      description: "set cleff to treble",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setClef(Clef.Treble);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mkx",
      description: "remove key signature",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setKeySignature(KeySignature.None);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mt24",
      description: "set time signature to 2/4",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setTimeSignature(TimeSignature.TwoFour);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mt34",
      description: "set time signature to 3/4",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setTimeSignature(TimeSignature.ThreeFour);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "mt44",
      description: "set time signature to 4/4",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setTimeSignature(TimeSignature.FourFour);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "wa",
      description: "append voice",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.appendVoice();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "gs",
      description: "split group",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.splitGrouping();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "gm",
      description: "merge group",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.mergeGrouping();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "gt",
      description: "toggle stem direction for group",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.toggleGroupStemDirection();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sj",
      description: "move to lower staff",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.swapStaffDown();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sk",
      description: "move to upper staff",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.swapStaffUp();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sx",
      description: "remove staff",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.deleteStaff();
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sa",
      description: "append staff",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.insertStaff(staffSystemEditor.getStaffCount());
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sr+",
      description: "increase staves gap",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.shiftSpaceBetweenStaves(2);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sr-",
      description: "decrease staves gap",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.shiftSpaceBetweenStaves(-2);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "sr=",
      description: "reset staves gap",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setSpaceBetweenStaves(DEFAULT_STAFF_SYSTEM_GAP);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "Scx",
      description: "remove staff system connector",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setStaffSystemConnector(ConnectorType.None);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "Sc[",
      description: "set staff system connector to bracket",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setStaffSystemConnector(ConnectorType.Bracket);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    {
      word: "Sc{",
      description: "set staff system connector to brace",
      callback: () => {
        const staffSystemEditor = requireNotNull(
          staffSystemEditorRef.current,
          "Expected staffSystemEditoRef to be initialized",
        );
        staffSystemEditor.setStaffSystemConnector(ConnectorType.Brace);
        updateStaffSystemElement();
      },
      mode: "normal",
    },
    ...getNoteInsertBinds(),
    {
      word: "n",
      description: "see normal mode binds",
      callback: () => {
        setSelectedHelpMode("normal");
      },
      mode: "help",
    },
    {
      word: "i",
      description: "see insert mode binds",
      callback: () => {
        setSelectedHelpMode("insert");
      },
      mode: "help",
    },
    {
      word: "h",
      description: "see help mode binds",
      callback: () => {
        setSelectedHelpMode("help");
      },
      mode: "help",
    },
    {
      word: "f",
      description: "scroll down",
      callback: () => {
        const helpDiv = requireNotNull(
          helpDivRef.current,
          "Expected helpDivRef to be initialized",
        );
        helpDiv.scrollBy({ top: 100, behavior: "instant" });
      },
      mode: "help",
    },
    {
      word: "b",
      description: "scroll up",
      callback: () => {
        const helpDiv = requireNotNull(
          helpDivRef.current,
          "Expected helpDivRef to be initialized",
        );
        helpDiv.scrollBy({ top: -100, behavior: "instant" });
      },
      mode: "help",
    },
  ]);

  const initNormalTrie = useCallback(() => {
    const trie = new Trie<() => void>();
    for (const bind of binds.current.filter((bind) => bind.mode === "normal")) {
      trie.addWord(bind.word, bind.callback);
    }
    normalTrieRef.current = trie;
  }, []);

  const initVisualTrie = useCallback(() => {
    const trie = new Trie<() => void>();
    for (const bind of binds.current.filter((bind) => bind.mode === "visual")) {
      trie.addWord(bind.word, bind.callback);
    }
    visualTrieRef.current = trie;
  }, []);

  const initInsertTrie = useCallback(() => {
    const trie = new Trie<() => void>();
    for (const bind of binds.current.filter((bind) => bind.mode === "insert")) {
      trie.addWord(bind.word, bind.callback);
    }
    insertTrieRef.current = trie;
  }, []);

  const initHelpTrie = useCallback(() => {
    const trie = new Trie<() => void>();
    for (const bind of binds.current.filter((bind) => bind.mode === "help")) {
      trie.addWord(bind.word, bind.callback);
    }
    trie.addWord("?", () => {
      crtModeRef.current = "normal";
      setMode(crtModeRef.current);
      crtCommandRef.current = "";
      setCommand(crtCommandRef.current);
    });
    helpTrieRef.current = trie;
  }, []);

  const onCommandEnter = useCallback(
    (commandString: string) => {
      const staffSystemEditor = requireNotNull(
        staffSystemEditorRef.current,
        "Expected staffSystemEditorRef to be initialized",
      );
      const commands: {
        weakRegex: RegExp;
        regex: RegExp;
        onSuccess?: (matches: RegExpMatchArray) => void;
        onError?: () => void;
      }[] = [
        // write command
        {
          weakRegex: /^w(rite)?\s*(\s.*)?$/,
          regex: /^w(rite)?\s*(\s(?<name>[a-zA-Z0-9\-\_\.]+))?$/,
          onSuccess: (matches: RegExpMatchArray) => {
            if (matches.groups?.name) {
              staffSystemEditor.setStaffSystemName(matches.groups?.name);
              updateStaffSystemElement();
            }
            if (onWrite != null) {
              onWrite(staffSystemEditor.getStaffSystem());
            }
          },
          onError: () => {
            alert(
              "Invalid usage of the write command.\nUsage: w[rite] [name]?\n[name] is made up of alphanumerical characters and the symbols '-', '_' and '.'",
            );
          },
        },
        {
          // explore command
          weakRegex: /^ex(plore)?\s*$/,
          regex: /^ex(plore)?\s*$/,
          onSuccess: () => {
            if (onExplore) {
              onExplore();
            }
          },
        },
      ];

      for (const command of commands) {
        if (command.weakRegex.test(commandString)) {
          const matches = commandString.match(command.regex);
          if (matches != null && command.onSuccess != null) {
            command.onSuccess(matches);
          }
          if (matches == null && command.onError != null) {
            command.onError();
          }
          return;
        }
      }
      alert("Unknown command.");
    },
    [onExplore, updateStaffSystemElement, onWrite],
  );

  const normalHandleInput = useCallback(
    (word: string) => {
      if (word === "v") {
        // HACK: disable visual mode until it is implemented
        return;
      }
      if (word === "Escape" || word === "Backspace") {
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }
      if (
        crtCommandRef.current === "" &&
        (word === "i" || word === "v" || word === ":" || word === "?")
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
          case "?":
            crtModeRef.current = "help";
            setSelectedHelpMode("help");
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

  const helpHandleInput = useCallback(
    (word: string) => {
      if (word === "Escape") {
        crtModeRef.current = "normal";
        setMode(crtModeRef.current);
        crtCommandRef.current = "";
        setCommand(crtCommandRef.current);
        return;
      }

      crtCommandRef.current += word;
      setCommand(crtCommandRef.current);

      if (helpTrieRef.current == null) {
        initHelpTrie();
      }

      const trie = requireNotNull(
        helpTrieRef.current,
        "Expected helpTrieRef to be initialized",
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
    [initHelpTrie],
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
        case "help":
          helpHandleInput(event.key);
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
      helpHandleInput,
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
      const height = window.innerHeight;
      if (0 <= divRect.top && divRect.bottom <= height) {
        return;
      }
      div.scrollIntoView({
        behavior: "instant",
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

    staffSystemEditorRef.current = new StaffSystemEditor(initialStaffSystem);
    updateStaffSystemElement();
  }, [updateStaffSystemElement, initialStaffSystem]);

  if (staffSystem == null) {
    return <div />;
  }

  const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);
  const name = `${staffSystemMetadata.name ?? "No Name"} ${staffSystem.staffSystemId.staffSystemId.slice(0, 5)}`;

  let helpDiv = null;
  if (mode === "help") {
    const helpEntries = [];
    for (const bind of binds.current.filter(
      (bind) => bind.mode === selectedHelpMode,
    )) {
      helpEntries.push(
        <div
          key={JSON.stringify({
            word: bind.word,
            description: bind.description,
            mode: bind.mode,
          })}
        >
          <span className="italic font-bold text-xl text-blue-500">
            {bind.word}
          </span>
          <span className="text-yellow-500 text-xs ml-2">
            {bind.description}
          </span>
        </div>,
      );
    }
    helpDiv = (
      <div
        ref={helpDivRef}
        className="flex flex-col items-start justify-start rounded p-4 fixed inset-0 top-10 mx-auto overflow-y-scroll opacity-90 w-96 h-96 bg-slate-900 z-10 text-yellow-500 font-semibold text-xl"
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <span className="self-center text-amber-600 text-2xl border-red-500 font-bold">
          {selectedHelpMode} key binds
        </span>
        {helpEntries}
      </div>
    );
  }

  return (
    <div>
      {helpDiv}
      <div
        ref={(div: HTMLDivElement | null) => {
          if (div != null) {
            div.focus();
          }
        }}
        className="grid place-content-center outline-none p-4"
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <StaffSystemElement
          staffSystem={staffSystem}
          pagePadding={pagePadding}
          onRowDivRendered={onRowDivRendered}
        />
      </div>
      <div className="bg-slate-900 fixed rounded top-4 left-10 text-amber-500 px-2">
        {name}
      </div>
      <div className="bg-slate-900 fixed rounded top-4 right-10 text-amber-500 px-2">
        Press <span className="italic font-bold text-xl text-blue-500">?</span>{" "}
        to toggle help
      </div>
      <div className="bg-slate-900 fixed rounded bottom-4 left-10 text-amber-500 px-2">
        {mode}
      </div>
      <div className="bg-slate-900 fixed rounded bottom-4 right-10 whitespace-pre text-amber-500 px-2">
        {command}
      </div>
    </div>
  );
}
