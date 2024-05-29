import { useEffect, useState } from "react";
import request from "./api/request";
import StaffSystemElement from "./components/StaffSystemElement";
import type { StaffSystem } from "./model/staff-system";

export default function App() {
  const [dataReceived, setDataReceived] = useState<StaffSystem | null>(null);

  useEffect(() => {
    request<StaffSystem>("GET", "/api/staff-system/sample", {}).then(
      (response) => {
        setDataReceived(response.data);
      },
    );
  }, []);

  if (dataReceived == null) {
    return <h1 className="bg-red-500 text-blue-400">Data not received yet</h1>;
  }
  return (
    <div className="grid bg-red-300 place-content-center p-4">
      <StaffSystemElement
        staffSystem={dataReceived}
        pageGap={20}
        pagePadding={{
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        }}
      />
    </div>
  );
}
