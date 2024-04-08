import { useEffect, useState } from "react";
import type { StaffSystem } from "vexflow-repl";
import request from "./api/request";
import Editor from "./components/Editor";
import { Factory } from "vexflow/bravura";

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
	return <Editor staffSystem={dataReceived} />;
}
