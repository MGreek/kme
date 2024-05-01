import type { StaffSystem } from "vexflow-repl";
import Page from "./Page";

export default function Editor({ staffSystem }: { staffSystem: StaffSystem }) {
  return (
    <>
      <div className="p-4 grid place-content-center">
        <Page staffSystem={staffSystem} />
      </div>
    </>
  );
}
