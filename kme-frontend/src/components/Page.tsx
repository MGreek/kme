import type { StaffSystem } from "vexflow-repl";
import Row from "./Row";

interface PageProps {
  staffSystem: StaffSystem;
}

export default function Page({ staffSystem }: PageProps) {
  return (
    <>
      <div className="sheetmusic-page flex flex-col items-start justify-start bg-blue-50">
        <Row staffSystem={staffSystem} />
      </div>
    </>
  );
}
