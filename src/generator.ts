import { Project, ts } from "ts-morph";

import { build } from "./build";
import { DEFAULT_CONFIGURATION, Configuration } from './generator.config';

export class Generator {

	project: Project;

	constructor(tsConfigFilePath: string) {
		this.project = new Project({
			tsConfigFilePath
		});

		console.log("Initialized with ts version", ts.version);
	}

	/**
	 * 
	 * @param sourceFileName Source file name ex: test.model.ts
	 * @param interfaceName Interface name ex: Hero
	 * @param config Configuration
	 */
	generate(sourceFileName: string, interfaceName: string, config?: Configuration): object {
		const configuration = { ...DEFAULT_CONFIGURATION, ...config };
		const sourceFile = this.project.getSourceFileOrThrow(sourceFileName);
		let props = {};

		if (sourceFile) {
			props = build(interfaceName, sourceFile, props, configuration);
		} else {
			throw Error("[ERROR]: No Source file found");
		}

		return props;
	}
}