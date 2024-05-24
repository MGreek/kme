import { useCallback, useEffect, useRef } from "react";
import type { StaffSystem } from "../model/staff-system";
import { SVGContext } from "vexflow";
import { renderStaffAtIndex } from "../renderer/render-staff-system-at-index";
import { requireNotNull } from "../util/require-not-null";

export default function StaffSystemElement({
  staffSystem,
}: { staffSystem: StaffSystem }) {
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

  useEffect(() => {
    if (divRef.current == null) {
      return;
    }

    const renderContext = new SVGContext(divRef.current);
    renderStaffAtIndex(
      renderContext,
      requireNotNull(staffSystem.staves[1]),
      0,
      0,
      0,
      350,
    );
    console.log(collectNewElements());
  }, [staffSystem.staves[1], collectNewElements]);

  return <div ref={divRef} />;
}
