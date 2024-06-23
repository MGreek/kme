import { useCallback, useEffect, useRef, useState } from "react";
import { onGetAllStaffSystems } from "../api/request";
import type { StaffSystem, StaffSystemId } from "../model/staff-system";
import { Trie } from "../util/graph";
import { parseStaffSystemMetadata } from "../util/metadata";
import { requireNotNull } from "../util/require-not-null";
import { getNewStaffSystem } from "../util/misc";

export default function Explorer({
  onOpen,
  onDelete,
}: {
  onOpen: (staffSystem: StaffSystem) => void;
  onDelete?: (staffSystemId: StaffSystemId) => void;
}) {
  const crtStaffSystems = useRef<StaffSystem[]>([]);
  const [staffSystems, setStaffSystems] = useState<StaffSystem[]>([]);
  const crtIndexRef = useRef<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const trieRef = useRef<Trie<() => void> | null>(null);

  const initTrie = useCallback(() => {
    const clampCrtIndex = () => {
      crtIndexRef.current = Math.max(
        0,
        Math.min(
          Math.max(crtIndexRef.current, 0),
          crtStaffSystems.current.length - 1,
        ),
      );
    };
    clampCrtIndex();

    const trie = new Trie<() => void>();
    trie.addWord("j", () => {
      if (crtStaffSystems.current.length === 0) {
        return;
      }
      crtIndexRef.current += 1;
      clampCrtIndex();
      setSelectedIndex(crtIndexRef.current);
    });
    trie.addWord("k", () => {
      if (crtStaffSystems.current.length === 0) {
        return;
      }
      crtIndexRef.current -= 1;
      clampCrtIndex();
      setSelectedIndex(crtIndexRef.current);
    });
    trie.addWord("o", () => {
      if (crtStaffSystems.current.length > 0) {
        onOpen(requireNotNull(crtStaffSystems.current[crtIndexRef.current]));
      }
    });
    trie.addWord("n", () => {
      const newStaffSystem = getNewStaffSystem();
      crtStaffSystems.current = [...crtStaffSystems.current, newStaffSystem];
      setStaffSystems(crtStaffSystems.current);
      onOpen(newStaffSystem);
    });
    trie.addWord("x", () => {
      if (crtStaffSystems.current.length === 0) {
        return;
      }
      const crtStaffSystem = requireNotNull(
        crtStaffSystems.current[crtIndexRef.current],
      );
      crtStaffSystems.current = crtStaffSystems.current.filter(
        (_staffSystem, index) => index !== crtIndexRef.current,
      );
      setStaffSystems(crtStaffSystems.current);
      clampCrtIndex();
      setSelectedIndex(crtIndexRef.current);
      if (onDelete) {
        onDelete(structuredClone(crtStaffSystem.staffSystemId));
      }
    });
    trieRef.current = trie;
  }, [onOpen, onDelete]);

  const handleInput = useCallback(
    (word: string) => {
      if (trieRef.current == null) {
        initTrie();
      }
      const trie = requireNotNull(
        trieRef.current,
        "Expected trie to be initialized",
      );

      const data = trie.getDataByWord(word);
      if (data != null) {
        data();
        return;
      }
    },
    [initTrie],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
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

      handleInput(event.key);
    },
    [handleInput],
  );

  useEffect(() => {
    onGetAllStaffSystems((staffSystems) => {
      crtStaffSystems.current = staffSystems;
      setStaffSystems(crtStaffSystems.current);
    });
  }, []);

  const divEntries = [];
  for (const [index, staffSystem] of staffSystems.entries()) {
    const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);
    const stringEntry = `${staffSystemMetadata.name ?? "No Name"} ${staffSystem.staffSystemId.staffSystemId.slice(0, 5)}`;
    let newDiv = null;
    if (index === selectedIndex) {
      newDiv = (
        <div key={stringEntry} className="text-red-500">
          {stringEntry}
        </div>
      );
    } else {
      newDiv = <div key={stringEntry}>{stringEntry}</div>;
    }
    divEntries.push(newDiv);
  }

  return (
    <div
      ref={(div: HTMLDivElement | null) => {
        if (div != null) {
          div.focus();
        }
      }}
      className="grid place-content-center outline-none p-4 bg-zinc-200"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard events are needed
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {divEntries}
    </div>
  );
}
