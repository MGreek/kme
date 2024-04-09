import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Factory } from "vexflow";
import {
	type FullRenderOptions,
	type StaffSystem,
	fullRender,
} from "vexflow-repl";

interface FactoryRef {
	factory: Factory | null;
}

export default function Editor({ staffSystem }: { staffSystem: StaffSystem }) {
	const factoryRef = useRef<FactoryRef>({ factory: null });
	const divRef = useRef<HTMLDivElement>(null);

	function renderStaffSystem() {
		const div = divRef.current;
		if (div == null) {
			return;
		}
		div.id = uuidv4();

		const options: FullRenderOptions = {
			totalWidth: div.clientWidth,
			totalHeight: div.clientHeight,
			x: 15,
			y: 0,
			defaultStaveWidth: 350,
			defaultSystemGap: 12,
		};

		if (factoryRef.current.factory == null) {
			factoryRef.current.factory = Factory.newFromElementId(
				div.id,
				div.clientWidth,
				div.clientHeight,
			);
		}
		fullRender(factoryRef.current.factory, staffSystem, options);
	}

	useEffect(() => {
		renderStaffSystem();
	}, []);

	return <div className="sheetmusic-page mx-auto bg-blue-50" ref={divRef} />;
}
