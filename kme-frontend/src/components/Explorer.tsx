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

  const setSortedStaffSystems = useCallback((unsorted: StaffSystem[]) => {
    setStaffSystems(
      unsorted.sort((first, second) => {
        const firstMeta = parseStaffSystemMetadata(first);
        const secondMeta = parseStaffSystemMetadata(second);
        const firstComp = (firstMeta.name ?? "No Name").localeCompare(
          secondMeta.name ?? "No Name",
        );
        const secondComp = first.staffSystemId.staffSystemId.localeCompare(
          second.staffSystemId.staffSystemId,
        );
        if (firstComp !== 0) {
          return firstComp;
        }
        return secondComp;
      }),
    );
  }, []);

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
      setSortedStaffSystems(crtStaffSystems.current);
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
      setSortedStaffSystems(crtStaffSystems.current);
      clampCrtIndex();
      setSelectedIndex(crtIndexRef.current);
      if (onDelete) {
        onDelete(structuredClone(crtStaffSystem.staffSystemId));
      }
    });
    trieRef.current = trie;
  }, [onOpen, onDelete, setSortedStaffSystems]);

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
      setSortedStaffSystems(crtStaffSystems.current);
    });
  }, [setSortedStaffSystems]);

  const divEntries = [];
  for (const [index, staffSystem] of staffSystems.entries()) {
    const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);
    const stringEntry = `${staffSystemMetadata.name ?? "No Name"} ${staffSystem.staffSystemId.staffSystemId.slice(0, 5)}`;
    const newDiv = (
      <div key={stringEntry} className="flex flex-row items-start">
        <div className="text-teal-400 ml-1">
          {selectedIndex === index ? ">" : ""}
        </div>
        <div
          className={`${selectedIndex === index ? "text-amber-500" : "text-amber-900"} ml-1`}
        >
          {stringEntry}
        </div>
      </div>
    );
    divEntries.push(newDiv);
  }

  return (
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
      <div className="flex flex-col gap-4 justify-between bg-slate-900 min-w-96 min-h-96 rounded border-2 border-amber-300">
        <div className="text-yellow-500 font-semibold self-center mt-4">
          SELECT A STAFF SYSTEM
        </div>
        {divEntries}
        <div className="text-yellow-500 self-center font-semibold">
          {"k - Up, j - Down, o - Open, n - New"}
        </div>
      </div>
    </div>
  );
}
