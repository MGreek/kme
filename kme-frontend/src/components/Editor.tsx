import type { StaffSystem } from "vexflow-repl";
import Page from "./Page";

export default function Editor({ staffSystem }: { staffSystem: StaffSystem }) {
  function onPageFinish(staffSystem: StaffSystem): void {
    console.log(`Finished ${staffSystem.id}`);
  }

  return <Page staffSystem={staffSystem} onFinish={onPageFinish} />;
}
