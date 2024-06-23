import { useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  BarlineType,
  BoundingBox,
  Factory,
  type System,
  type Voice as VexVoice,
} from "vexflow-kme";
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
  onDivRendered,
}: {
  staffSystem: StaffSystem;
  startMeasureIndex: number;
  stopMeasureIndex: number;
  totalWidth: number;
  onDivRendered?: (div: HTMLDivElement) => void;
}) {
  const prevJsonRef = useRef<string | null>(null);

  const addStaves = useCallback(
    (factory: Factory, system: System) => {
      const stavesVoices: VexVoice[][] = [];
      for (const staff of staffSystem.staves) {
        stavesVoices.push([]);
        const staffVoices = requireNotNull(stavesVoices.at(-1));
        for (
          let index = startMeasureIndex;
          index <= stopMeasureIndex;
          index++
        ) {
          const measure = requireNotNull(staff.measures.at(index));
          while (staffVoices.length < measure.voices.length) {
            staffVoices.push(factory.Voice().setStrict(false));
          }
        }
      }

      for (
        let measureIndex = startMeasureIndex;
        measureIndex <= stopMeasureIndex;
        measureIndex++
      ) {
        for (const [index, staff] of staffSystem.staves.entries()) {
          const measure = requireNotNull(staff.measures.at(measureIndex));
          const { vexVoices: measureVoices } = getVexVoicesFromMeasure(
            factory,
            measure,
          );
          const staffVoices = requireNotNull(stavesVoices.at(index));

          const prevMeasure =
            startMeasureIndex !== measureIndex
              ? staff.measures.at(measureIndex - 1)
              : null;
          for (const staffVoice of staffVoices) {
            if (prevMeasure != null) {
              if (prevMeasure.keySignature !== measure.keySignature) {
                staffVoice.addTickable(
                  factory.KeySigNote({
                    key: getKeySignatureNameFromKeySignature(
                      measure.keySignature,
                    ),
                    cancelKey: getKeySignatureNameFromKeySignature(
                      prevMeasure.keySignature,
                    ),
                    overrideClef: getClefNameFromClef(measure.clef),
                  }),
                );
              }
              if (prevMeasure.timeSignature !== measure.timeSignature) {
                staffVoice.addTickable(
                  factory.TimeSigNote({
                    time: getTimeSignatureStringFromTimeSignature(
                      measure.timeSignature,
                    ),
                  }),
                );
              }
            }
          }
          equalizeVoices(factory, staffVoices);

          for (const [index, measureVoice] of measureVoices.entries()) {
            const staffVoice = requireNotNull(staffVoices.at(index));
            staffVoice.addTickables(measureVoice.getTickables());
          }
          equalizeVoices(factory, staffVoices);

          const nextMeasure = staff.measures.at(measureIndex + 1);
          for (const staffVoice of staffVoices) {
            if (nextMeasure != null && measure.clef !== nextMeasure.clef) {
              staffVoice.addTickable(
                factory.ClefNote({
                  type: getClefNameFromClef(nextMeasure.clef),
                  options: { size: "small" },
                }),
              );
            }
          }
        }
        equalizeVoices(factory, stavesVoices.flat());
        for (const staffVoice of stavesVoices.flat()) {
          if (measureIndex < stopMeasureIndex) {
            staffVoice.addTickable(
              factory.BarNote({ type: BarlineType.SINGLE }),
            );
          }
        }
      }

      for (const [index, staff] of staffSystem.staves.entries()) {
        const staffVoices = requireNotNull(stavesVoices.at(index));
        const stave = system.addStave({ voices: staffVoices });
        const prevMeasure =
          startMeasureIndex > 0
            ? staff.measures.at(startMeasureIndex - 1)
            : null;
        const measure = requireNotNull(staff.measures.at(startMeasureIndex));
        stave.addClef(getClefNameFromClef(measure.clef));
        if (prevMeasure == null) {
          stave.addKeySignature(
            getKeySignatureNameFromKeySignature(measure.keySignature),
          );
          stave.addTimeSignature(
            getTimeSignatureStringFromTimeSignature(measure.timeSignature),
          );
          continue;
        }
        if (measure.keySignature !== prevMeasure.keySignature) {
          stave.addKeySignature(
            getKeySignatureNameFromKeySignature(measure.keySignature),
            getKeySignatureNameFromKeySignature(prevMeasure.keySignature),
          );
        }
        if (measure.timeSignature !== prevMeasure.timeSignature) {
          stave.addTimeSignature(
            getTimeSignatureStringFromTimeSignature(measure.timeSignature),
          );
        }
      }
    },
    [staffSystem, stopMeasureIndex, startMeasureIndex],
  );

  const draw = useCallback(
    (factory: Factory, system: System) => {
      addStaves(factory, system);

      const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);

      system.addConnector(
        connectorTypeToVex(staffSystemMetadata.connectorType),
      );
      system.addConnector("singleLeft");
      system.addConnector("singleRight");

      factory.draw();
    },
    [staffSystem, addStaves],
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

    const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);
    let system = factory.System({
      width: totalWidth,
      spaceBetweenStaves: staffSystemMetadata.gap,
      noPadding: true,
      formatOptions: {
        auto_beam: false,
      },
    });

    draw(factory, system);
    let bounds = requireNotNull(getElementsBounds(div));
    system = factory.System({
      width: totalWidth,
      noPadding: true,
      spaceBetweenStaves: staffSystemMetadata.gap,
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

    if (onDivRendered) {
      onDivRendered(div);
    }
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
  const previousMeasures = [];
  const nextMeasures = [];
  for (const staff of staffSystem.staves) {
    const previousMeasure =
      startMeasureIndex === 0 ? null : staff.measures.at(startMeasureIndex - 1);
    const previousClef = previousMeasure?.clef;
    const previousKeySignature = previousMeasure?.keySignature;
    const previousTimeSignature = previousMeasure?.timeSignature;
    previousMeasures.push({
      clef: previousClef,
      keySignature: previousKeySignature,
      timeSignature: previousTimeSignature,
    });
    const nextMeasure = staff.measures.at(stopMeasureIndex + 1);
    const nextClef = nextMeasure?.clef;
    const nextKeySignature = nextMeasure?.keySignature;
    const nextTimeSignature = nextMeasure?.timeSignature;
    nextMeasures.push({
      clef: nextClef,
      keySignature: nextKeySignature,
      timeSignature: nextTimeSignature,
    });
  }

  return JSON.stringify({
    previousMeasures,
    nextMeasures,
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
