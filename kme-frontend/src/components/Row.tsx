import { useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  BarlineType,
  BoundingBox,
  Factory,
  type System,
  type Voice as VexVoice,
} from "vexflow";
import { requireNotNull } from "../util/require-not-null";
import type { StaffSystem } from "../model/staff-system";
import { getStaffSystemMeasureCount } from "../util/misc";
import {
  connectorTypeToVex,
  getClefNameFromClef,
  getKeySignatureNameFromKeySignature,
  getTimeSignatureStringFromTimeSignature,
  getVexVoicesFromMeasure,
} from "../util/model-to-vexflow";
import { parseStaffSystemMetadata } from "../util/metadata";

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
  const divRef = useRef<HTMLDivElement | null>(null);
  const factoryRef = useRef<Factory | null>(null);
  const crtElementIdsRef = useRef<Set<string>>(new Set<string>());
  const savedElementIdsRef = useRef<Set<string>>(new Set<string>());

  const collectNewElementsRef = useCallback((save: boolean) => {
    const div = requireNotNull(
      divRef.current,
      "Expected divRef to be initialized",
    );

    const svg = div.firstChild;
    if (!(svg instanceof SVGElement)) {
      throw new Error("Expected divRef to have svg child on first position");
    }

    const newElements = Array.from(svg.children).filter(
      (element) =>
        !savedElementIdsRef.current.has(element.outerHTML) &&
        !crtElementIdsRef.current.has(element.outerHTML),
    );

    for (const newElement of newElements) {
      if (save) {
        savedElementIdsRef.current.add(newElement.outerHTML);
      }
      crtElementIdsRef.current.add(newElement.outerHTML);
    }
    return newElements;
  }, []);

  const getNewElementsBoundsRef = useCallback(
    (save: boolean) => {
      const div = requireNotNull(
        divRef.current,
        "Expected divRef to be initialized",
      );

      const toBoudingBox = (rect: DOMRect) =>
        new BoundingBox(rect.x, rect.y, rect.width, rect.height);

      const divRect = toBoudingBox(div.getBoundingClientRect());

      const normalize = (rect: DOMRect) => {
        const bb = toBoudingBox(rect);
        bb.x -= divRect.x;
        bb.y -= divRect.y;
        return bb;
      };

      const elements = collectNewElementsRef(save);
      const boundingBox = elements
        .map((element) => normalize(element.getBoundingClientRect()))
        .reduce(
          (prev: BoundingBox | null, crt) => prev?.mergeWith(crt) ?? crt,
          null,
        );
      return boundingBox;
    },
    [collectNewElementsRef],
  );

  const removeUnsavedRef = useCallback(() => {
    const div = requireNotNull(
      divRef.current,
      "Expected divRef to be initialized",
    );

    const svg = div.firstChild;
    if (!(svg instanceof SVGElement)) {
      throw new Error("Expected divRef to have svg child on first position");
    }

    const unsavedElements = Array.from(svg.children).filter(
      (element) => !savedElementIdsRef.current.has(element.outerHTML),
    );
    for (const element of unsavedElements) {
      svg.removeChild(element);
    }
    crtElementIdsRef.current.clear();
  }, []);

  const draw = useCallback(
    (factory: Factory, system: System, save: boolean) => {
      for (const staff of staffSystem.staves) {
        let staffVexVoices: VexVoice[] | null = null;
        for (
          let index = startMeasureIndex;
          index <= stopMeasureIndex;
          index++
        ) {
          const measure = requireNotNull(staff.measures.at(index));
          const { vexVoices } = getVexVoicesFromMeasure(factory, measure);
          if (index < stopMeasureIndex) {
            for (const vexVoice of vexVoices) {
              vexVoice.addTickable(
                factory.BarNote({ type: BarlineType.SINGLE }),
              );
            }
          }
          if (staffVexVoices == null) {
            staffVexVoices = vexVoices;
          } else {
            for (const [index, vexVoice] of vexVoices.entries()) {
              if (index === staffVexVoices.length) {
                staffVexVoices.push(vexVoice);
              } else {
                staffVexVoices.at(index)?.addTickables(vexVoice.getTickables());
              }
            }
          }
        }
        const firstMeasure = requireNotNull(
          staff.measures.at(startMeasureIndex),
        );
        const clef = getClefNameFromClef(requireNotNull(firstMeasure.clef));
        const timesig = getTimeSignatureStringFromTimeSignature(
          requireNotNull(firstMeasure.timeSignature),
        );
        const keysig = getKeySignatureNameFromKeySignature(
          firstMeasure.keySignature,
        );
        system
          .addStave({ voices: requireNotNull(staffVexVoices) })
          .addClef(clef)
          .addTimeSignature(timesig)
          .addKeySignature(keysig);
      }

      const staffSystemMetadata = parseStaffSystemMetadata(staffSystem);

      system.addConnector(
        connectorTypeToVex(staffSystemMetadata.connectorType),
      );
      system.addConnector("singleLeft");
      system.addConnector("singleRight");

      factory.draw();
      const bounds = requireNotNull(getNewElementsBoundsRef(save));
      if (!save) {
        removeUnsavedRef();
      }
      return bounds;
    },
    [
      staffSystem,
      startMeasureIndex,
      stopMeasureIndex,
      getNewElementsBoundsRef,
      removeUnsavedRef,
    ],
  );

  useEffect(() => {
    if (divRef.current == null) {
      return;
    }
    if (factoryRef.current == null) {
      factoryRef.current = new Factory({
        renderer: {
          elementId: divRef.current.id,
          width: 0,
          height: 0,
        },
      });
    }

    const crtJson = getJson(
      totalWidth,
      startMeasureIndex,
      stopMeasureIndex,
      staffSystem,
    );

    if (prevJsonRef.current == null) {
      prevJsonRef.current = crtJson;
    } else if (prevJsonRef.current === crtJson) {
      return;
    }

    const measureCount = getStaffSystemMeasureCount(staffSystem);
    if (
      !(startMeasureIndex <= stopMeasureIndex) &&
      stopMeasureIndex < measureCount
    ) {
      return;
    }

    const factory = factoryRef.current;
    let system = factory.System({
      width: totalWidth,
      noPadding: true,
    });

    let bounds = draw(factory, system, false);
    system = factory.System({
      width: totalWidth,
      noPadding: true,
      // HACK: magic number 10 seems to work lmao
      x: 10 - bounds.x,
      y: 10 - bounds.y,
    });

    bounds = draw(factory, system, true);
    const width = bounds.x + bounds.w;
    const height = bounds.y + bounds.h;

    divRef.current.style.width = `${width}px`;
    divRef.current.style.height = `${height}px`;
    factory.getContext().resize(width, height);
  }, [staffSystem, startMeasureIndex, stopMeasureIndex, totalWidth, draw]);

  return <div id={uuidv4()} ref={divRef} />;
}

export function getJson(
  totalWidth: number,
  startMeasureIndex: number,
  stopMeasureIndex: number,
  staffSystem: StaffSystem,
) {
  return JSON.stringify({
    totalWidth,
    startMeasureIndex,
    stopMeasureIndex,
    staffSystemMetadata: parseStaffSystemMetadata(staffSystem),
    measures: staffSystem.staves
      .flatMap((staff) => staff.measures)
      .slice(startMeasureIndex, stopMeasureIndex),
  });
}
