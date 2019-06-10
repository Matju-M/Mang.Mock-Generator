import { Project, ts } from "ts-morph";

import { build } from "./build";
import { DEFAULT_CONFIGURATION, Configuration } from './generator.config';
import { Dictionary, merge } from 'lodash';

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

	remove<T>(interfaceName: string, propertyKey: keyof T) {
		const key = `${interfaceName}-${propertyKey}`;
		this.fieldValues[key] = undefined;
	}

	add<T>(interfaceName: string, propertyKey: keyof T, propertyValue: any) {

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
	generate<T>(sourceFileName: string, interfaceName: string, config?: Configuration): Partial<T> {

		const configuration = merge(
			{},
			DEFAULT_CONFIGURATION,
			{ ["fieldValues"]: this.fieldValues },
			config
		);

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