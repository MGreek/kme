import type { StaffSystem } from "vexflow-repl";
import Row from "./Row";

interface PageProps {
  staffSystem: StaffSystem;
}

export default function Page({ staffSystem }: PageProps) {
  return <Row staffSystem={staffSystem} />;
}
