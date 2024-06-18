import { useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  BarlineType,
  BoundingBox,
  Factory,
  type System,
  type Voice as VexVoice,
} from "vexflow";
import type { Staff } from "../model/staff";
import type { StaffSystem } from "../model/staff-system";
import { parseStaffSystemMetadata } from "../util/metadata";
import { getStaffSystemMeasureCount } from "../util/misc";
import {
  connectorTypeToVex,
  getClefNameFromClef,
  getKeySignatureNameFromKeySignature,
  getTimeSignatureStringFromTimeSignature,
  getVexVoicesFromMeasure,
} from "../util/model-to-vexflow";
import { requireNotNull } from "../util/require-not-null";

export default function Row({
  staffSystem,
  startMeasureIndex,
  stopMeasureIndex,
  totalWidth,
}: {
  staffSystem: StaffSystem;
  startMeasureIndex: number;
  stopMeasureIndex: number;
  totalWidth: number;
}) {
  const prevJsonRef = useRef<string | null>(null);

  const addStaff = useCallback(
    (factory: Factory, system: System, staff: Staff) => {
      const staffVexVoices: VexVoice[] = [];
      for (let index = startMeasureIndex; index <= stopMeasureIndex; index++) {
        const measure = requireNotNull(staff.measures.at(index));
        while (staffVexVoices.length < measure.voices.length) {
          staffVexVoices.push(factory.Voice().setStrict(false));
        }
      }
      const getMeasuresAtIndex = (index: number) => {
        return {
          prevMeasure: staff.measures.at(index - 1) ?? null,
          measure: requireNotNull(staff.measures.at(index)),
          nextMeasure: staff.measures.at(index + 1) ?? null,
        };
      };
      for (let index = startMeasureIndex; index <= stopMeasureIndex; index++) {
        const { prevMeasure, measure, nextMeasure } = getMeasuresAtIndex(index);
        const { vexVoices } = getVexVoicesFromMeasure(factory, measure);
        if (index < stopMeasureIndex) {
          // TODO: don't just add a barline but also a clef/keysig/timesig if they are different
          for (const vexVoice of vexVoices) {
            if (nextMeasure != null) {
              if (measure.clef !== nextMeasure.clef) {
                vexVoice.addTickable(
                  factory.ClefNote({
                    type: getClefNameFromClef(nextMeasure.clef),
                  }),
                );
              }
            }
            vexVoice.addTickable(factory.BarNote({ type: BarlineType.SINGLE }));
          }
        }
        for (const [index, vexVoice] of vexVoices.entries()) {
          const staffVexVoice = requireNotNull(staffVexVoices.at(index));
          staffVexVoice.addTickables(vexVoice.getTickables());
        }
        equalizeVoices(factory, staffVexVoices);
      }
      const firstMeasure = requireNotNull(staff.measures.at(startMeasureIndex));
      const clef = getClefNameFromClef(requireNotNull(firstMeasure.clef));
      const timesig = getTimeSignatureStringFromTimeSignature(
        requireNotNull(firstMeasure.timeSignature),
      );
      const keysig = getKeySignatureNameFromKeySignature(
        firstMeasure.keySignature,
      );
      system
        .addStave({ voices: staffVexVoices })
        .addClef(clef)
        .addTimeSignature(timesig)
        .addKeySignature(keysig);
    },
    [stopMeasureIndex, startMeasureIndex],
  );

  const draw = useCallback(
    (factory: Factory, system: System) => {
      for (const staff of staffSystem.staves) {
        addStaff(factory, system, staff);
      }

      const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);

      system.addConnector(
        connectorTypeToVex(staffSystemMetadata.connectorType),
      );
      system.addConnector("singleLeft");
      system.addConnector("singleRight");

      factory.draw();
    },
    [staffSystem, addStaff],
  );

  const onDiv = (div: HTMLDivElement | null) => {
    if (div == null) {
      return;
    }

    const measureCount = getStaffSystemMeasureCount(staffSystem);
    if (
      !(startMeasureIndex <= stopMeasureIndex) &&
      stopMeasureIndex < measureCount
    ) {
      return;
    }

    const crtJson = getRowJson(
      totalWidth,
      startMeasureIndex,
      stopMeasureIndex,
      staffSystem,
    );

    if (prevJsonRef.current === crtJson) {
      return;
    }
    prevJsonRef.current = crtJson;

    const factory = new Factory({
      renderer: { elementId: div.id, width: 0, height: 0 },
    });
    let system = factory.System({
      width: totalWidth,
      noPadding: true,
    });

    draw(factory, system);
    let bounds = requireNotNull(getElementsBounds(div));
    system = factory.System({
      width: totalWidth,
      noPadding: true,
      // HACK: magic number 10 seems to work lmao
      x: 10 - bounds.x,
      y: 10 - bounds.y,
    });

    removeElements(div);
    draw(factory, system);
    bounds = requireNotNull(getElementsBounds(div));
    const width = bounds.x + bounds.w;
    const height = bounds.y + bounds.h;

    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    factory.getContext().resize(width, height);
  };

  return <div id={uuidv4()} ref={onDiv} />;
}

function equalizeVoices(factory: Factory, voices: VexVoice[]) {
  if (voices.length < 2) {
    return;
  }
  const getVoiceIntrinsicTicks = (voice: VexVoice): number => {
    return voice
      .getTickables()
      .map((tickable) => tickable.getIntrinsicTicks())
      .reduce((prev, crt) => prev + crt, 0);
  };
  const maxTicks = voices
    .map((voice) => getVoiceIntrinsicTicks(voice))
    .reduce((prev, crt) => Math.max(prev, crt));
  for (const voice of voices) {
    const crtTicks = getVoiceIntrinsicTicks(voice);
    const fillerTicks = maxTicks - crtTicks;
    if (fillerTicks === 0) {
      continue;
    }
    const ghostNote = factory.GhostNote({ keys: ["c/4"], duration: "w" });
    ghostNote.setIntrinsicTicks(fillerTicks);
    ghostNote.setIgnoreTicks(false);
    voice.addTickable(ghostNote);
  }
}

function getElementsBounds(div: HTMLDivElement) {
  const toBoudingBox = (rect: DOMRect) =>
    new BoundingBox(rect.x, rect.y, rect.width, rect.height);

  const divRect = toBoudingBox(div.getBoundingClientRect());

  const normalize = (rect: DOMRect) => {
    const bb = toBoudingBox(rect);
    bb.x -= divRect.x;
    bb.y -= divRect.y;
    return bb;
  };

  const elements = collectElements(div);
  const boundingBox = elements
    .map((element) => normalize(element.getBoundingClientRect()))
    .reduce(
      (prev: BoundingBox | null, crt) => prev?.mergeWith(crt) ?? crt,
      null,
    );
  return boundingBox;
}

function collectElements(div: HTMLDivElement) {
  const svg = div.firstChild;
  if (!(svg instanceof SVGElement)) {
    throw new Error("Expected divRef to have svg child on first position");
  }

  return Array.from(svg.children);
}

function removeElements(div: HTMLDivElement) {
  const svg = div.firstChild;
  if (!(svg instanceof SVGElement)) {
    throw new Error("Expected divRef to have svg child on first position");
  }

  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
}

export function getRowJson(
  totalWidth: number,
  startMeasureIndex: number,
  stopMeasureIndex: number,
  staffSystem: StaffSystem,
) {
  return JSON.stringify({
    totalWidth,
    startMeasureIndex,
    stopMeasureIndex,
    staffSystemId: staffSystem.staffSystemId,
    staffSystemMetadata: parseStaffSystemMetadata(staffSystem),
    staves: staffSystem.staves.map((staff) => {
      const newStaff: Staff = {
        staffId: staff.staffId,
        metadataJson: staff.metadataJson,
        measures: staff.measures.slice(startMeasureIndex, stopMeasureIndex + 1),
      };
      return newStaff;
    }),
  });
}
