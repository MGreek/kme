import { useCallback, useEffect, useRef, useState } from "react";
import { onGetAllStaffSystems } from "../api/request";
import type { StaffSystem } from "../model/staff-system";
import { Trie } from "../util/graph";
import { parseStaffSystemMetadata } from "../util/metadata";
import { requireNotNull } from "../util/require-not-null";

export default function Explorer() {
  const [staffSystems, setStaffSystems] = useState<StaffSystem[]>([]);
  const crtIndexRef = useRef<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const trieRef = useRef<Trie<() => void> | null>(null);

  const initTrie = useCallback(() => {
    const clampCrtIndex = () => {
      crtIndexRef.current = Math.max(
        0,
        Math.min(Math.max(crtIndexRef.current, 0), staffSystems.length - 1),
      );
    };
    clampCrtIndex();

    const trie = new Trie<() => void>();
    trie.addWord("n", () => {
      crtIndexRef.current += 1;
      clampCrtIndex();
      setSelectedIndex(crtIndexRef.current);
    });
    trie.addWord("p", () => {
      crtIndexRef.current -= 1;
      clampCrtIndex();
      setSelectedIndex(crtIndexRef.current);
    });
    trieRef.current = trie;
  }, [staffSystems]);

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
      if (staffSystems.length === 0) {
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

      handleInput(event.key);
    },
    [staffSystems, handleInput],
  );

  useEffect(() => {
    onGetAllStaffSystems((staffSystems) => {
      setStaffSystems(staffSystems);
    });
  }, []);

  if (staffSystems.length === 0) {
    return <div>No staff systems.</div>;
  }
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
      className="grid place-content-center outline-none p-4"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard events are needed
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {divEntries}
    </div>
  );
}
