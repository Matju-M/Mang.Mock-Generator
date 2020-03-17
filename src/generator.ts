import { Project, ts } from "ts-morph";
import { Dictionary, merge } from 'lodash';

import { build } from "./build";
import { DEFAULT_CONFIGURATION, Configuration } from './generator.config';

type ValueOf<T> = T[keyof T];

export class Generator {

	project: Project;
	fieldValues: Dictionary<any>;

	constructor(tsConfigFilePath: string) {
		this.project = new Project({
			tsConfigFilePath
		});

		this.fieldValues = {};
		console.log("Initialized with ts version", ts.version);
	}

	removeAll() {
		this.fieldValues = {};
	}

	remove<T>(interfaceName: string, propertyKey: keyof T) {
		const key = `${interfaceName}-${propertyKey}`;
		this.fieldValues[key] = undefined;
	}

	add<T>(interfaceName: string, propertyKey: keyof T, propertyValue: ValueOf<T> | null) {

		const value = {
			[`${interfaceName}-${propertyKey}`]: propertyValue
		};

		this.fieldValues = { ...this.fieldValues, ...value };
	};

	/**
	 * 
	 * @param sourceFileName Source file name ex: test.model.ts
	 * @param interfaceName Interface name ex: Hero
	 * @param config Configuration
	 */
	generate<T>(interfaceName: string, config?: Configuration): Partial<T> {

		const configuration = merge(
			{},
			DEFAULT_CONFIGURATION,
			{ ["fieldValues"]: this.fieldValues },
			config
		);

		this.project.addSourceFilesAtPaths("node_modules/**/*.d.ts");
		const files = this.project.getSourceFiles();
		let props = {};

		if (files) {
			props = build(interfaceName, files, props, configuration);
		} else {
			throw Error("[ERROR]: No Source file found");
		}

		return props;
	}
}