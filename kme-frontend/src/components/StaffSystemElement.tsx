import { useCallback, useEffect, useRef } from "react";
import { BoundingBox, type RenderContext, SVGContext } from "vexflow";
import type { StaffSystem } from "../model/staff-system";
import { renderStaffAtIndex } from "../renderer/render-staff-system-at-index";
import { requireNotNull } from "../util/require-not-null";

export default function StaffSystemElement({
  staffSystem,
  measureIndex,
}: { staffSystem: StaffSystem; measureIndex: number }) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const crtStaveIdsRef = useRef<Set<string>>(new Set<string>());
  const crtClefIdsRef = useRef<Set<string>>(new Set<string>());
  const crtStavebarlineIdsRef = useRef<Set<string>>(new Set<string>());
  const crtKeysignatureIdsRef = useRef<Set<string>>(new Set<string>());
  const crtTimesignatureIdsRef = useRef<Set<string>>(new Set<string>());
  const crtStavenoteIdsRef = useRef<Set<string>>(new Set<string>());
  const crtBeamIdsRef = useRef<Set<string>>(new Set<string>());
  const crtStemIdsRef = useRef<Set<string>>(new Set<string>());

  const collectNewElements = useCallback(() => {
    const div = requireNotNull(
      divRef.current,
      "Expected divRef to be initialized",
    );

    const staveElements = Array.from(div.querySelectorAll(".vf-stave"));
    const clefElements = Array.from(div.querySelectorAll(".vf-clef"));
    const stavebarlineElements = Array.from(
      div.querySelectorAll(".vf-stavebarline"),
    );
    const keysignatureElements = Array.from(
      div.querySelectorAll(".vf-keysignature"),
    );
    const timesignatureElements = Array.from(
      div.querySelectorAll(".vf-timesignature"),
    );
    const stavenoteElements = Array.from(div.querySelectorAll(".vf-stavenote"));
    const beamElements = Array.from(div.querySelectorAll(".vf-beam"));
    const stemElements = Array.from(div.querySelectorAll(".vf-stem"));

    const result = [
      staveElements.filter((stave) => !crtStaveIdsRef.current.has(stave.id)),
      clefElements.filter((clef) => !crtClefIdsRef.current.has(clef.id)),
      stavebarlineElements.filter(
        (stavebarline) => !crtStavebarlineIdsRef.current.has(stavebarline.id),
      ),
      keysignatureElements.filter(
        (keysignature) => !crtKeysignatureIdsRef.current.has(keysignature.id),
      ),
      timesignatureElements.filter(
        (timesignature) =>
          !crtTimesignatureIdsRef.current.has(timesignature.id),
      ),
      stavenoteElements.filter(
        (stavenote) => !crtStavenoteIdsRef.current.has(stavenote.id),
      ),
      beamElements.filter((beam) => !crtBeamIdsRef.current.has(beam.id)),
      stemElements.filter((stem) => !crtStemIdsRef.current.has(stem.id)),
    ].flat();

    for (const staveElement of staveElements) {
      crtStaveIdsRef.current.add(staveElement.id);
    }
    for (const clefElement of clefElements) {
      crtClefIdsRef.current.add(clefElement.id);
    }
    for (const stavebarlineElement of stavebarlineElements) {
      crtStavebarlineIdsRef.current.add(stavebarlineElement.id);
    }
    for (const keysignatureElement of keysignatureElements) {
      crtKeysignatureIdsRef.current.add(keysignatureElement.id);
    }
    for (const timesignatureElement of timesignatureElements) {
      crtTimesignatureIdsRef.current.add(timesignatureElement.id);
    }
    for (const stavenoteElement of stavenoteElements) {
      crtStavenoteIdsRef.current.add(stavenoteElement.id);
    }
    for (const beamElement of beamElements) {
      crtBeamIdsRef.current.add(beamElement.id);
    }
    for (const stemElement of stemElements) {
      crtStemIdsRef.current.add(stemElement.id);
    }
    for (const staveElement of staveElements) {
      crtStaveIdsRef.current.add(staveElement.id);
    }

    return result;
  }, []);

  const getNewElementsBounds = useCallback(() => {
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

    const elements = collectNewElements();
    const boundingBox = elements
      .map((element) => normalize(element.getBoundingClientRect()))
      .reduce(
        (prev: BoundingBox | null, crt) => prev?.mergeWith(crt) ?? crt,
        null,
      );
    return boundingBox;
  }, [collectNewElements]);

  const clearAndNewContext = useCallback((renderContext: RenderContext) => {
    renderContext.clear();
    const div = requireNotNull(divRef.current);
    div.innerHTML = "";
    crtStaveIdsRef.current.clear();
    crtClefIdsRef.current.clear();
    crtStavebarlineIdsRef.current.clear();
    crtKeysignatureIdsRef.current.clear();
    crtTimesignatureIdsRef.current.clear();
    crtStavenoteIdsRef.current.clear();
    crtBeamIdsRef.current.clear();
    crtStemIdsRef.current.clear();
    return new SVGContext(div);
  }, []);

  useEffect(() => {
    if (divRef.current == null) {
      return;
    }

    if (staffSystem.staves.length === 0) {
      return;
    }

    if (
      staffSystem.staves.some(
        (staff) => staff.measures.at(measureIndex) == null,
      )
    ) {
      throw new Error(
        `All staves must have a measure at index: ${measureIndex}`,
      );
    }

    // TODO: get gap from metadata
    const gap = 20;

    let renderContext = new SVGContext(divRef.current);
    let x = 0;
    const stavesYs = [];
    // outer block used for limiting scope
    {
      let y = 0;
      for (const staff of staffSystem.staves) {
        renderStaffAtIndex(renderContext, staff, measureIndex, 0, 0);
        const bounds = requireNotNull(getNewElementsBounds());
        if (x < bounds.x) {
          x = bounds.x;
        }
        stavesYs.push(y - bounds.y);
        y += bounds.h + gap;
        renderContext = clearAndNewContext(renderContext);
      }
    }

    renderContext = clearAndNewContext(renderContext);
    for (const [index, staff] of staffSystem.staves.entries()) {
      renderStaffAtIndex(
        renderContext,
        staff,
        measureIndex,
        x,
        requireNotNull(stavesYs[index]),
      );
    }

    const totalBounds = getNewElementsBounds();
    const width = (totalBounds?.x ?? 0) + (totalBounds?.w ?? 0);
    const height = (totalBounds?.y ?? 0) + (totalBounds?.h ?? 0);

    renderContext.resize(width, height);
    const div = divRef.current;
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
  }, [
    staffSystem.staves,
    measureIndex,
    getNewElementsBounds,
    clearAndNewContext,
  ]);

  return <div className="bg-red-300" ref={divRef} />;
}
