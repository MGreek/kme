import { useEffect } from "react";
import {
	type FullRenderOptions,
	fullRender,
	type StaffSystem,
} from "vexflow-repl";
import request from "./api/request";

export default function App() {
	useEffect(() => {
		request<StaffSystem>("GET", "/api/staff-system/sample", {}).then(
			(response) => {
				console.log(JSON.stringify(response.data));
				const div = document.getElementById("output");
				if (div instanceof HTMLDivElement) {
					const options: FullRenderOptions = {
						totalWidth: 400,
						totalHeight: 800,
						defaultX: 15,
						defaultY: 0,
						defaultStaveWidth: 350,
						defaultSystemGap: 20,
					};
					fullRender(div.id, response.data, options);
				}
			},
		);

		// const div = document.getElementById("output")
		// if (div instanceof HTMLDivElement) {
		//   drawSample(div)
		// }
	}, []);
	return <div id="output" />;
}
