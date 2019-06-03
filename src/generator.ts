import { Project, ts } from "ts-morph";

import { build } from "./build";

export class Generator {

	project: Project;

	constructor(tsConfigFilePath: string) {
		this.project = new Project({
			tsConfigFilePath
		});

		console.log("Initialized with ts version", ts.version);
	}

	generate(sourceFileName: string, interfaceName: string): object {
		const sourceFile = this.project.getSourceFileOrThrow(sourceFileName);
		let props = {};

		if (sourceFile) {
			props = build(interfaceName, sourceFile, props);
		} else {
			console.log("No Source file found");
		}

		return props;
	}
}