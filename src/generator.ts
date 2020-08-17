import { Project, ts } from "ts-morph";
import { Dictionary, merge, mapKeys } from 'lodash';

import { build } from "./build";
import { DEFAULT_CONFIGURATION, Configuration } from './generator.config';

export class Generator {

	project: Project;
	fieldValues: Dictionary<any>;

	constructor(tsConfigFilePath: string) {
		this.project = new Project({
			tsConfigFilePath
		});

		const retrieveConfig = ts.sys.readFile(tsConfigFilePath);
		const parsed = ts.parseConfigFileTextToJson(tsConfigFilePath, retrieveConfig || "{}");
		const paths: Record<string, string[]> = parsed?.config?.compilerOptions?.paths;

		if (paths) {
			const keys = Object.keys(paths);
			keys.forEach(k => {
				const sanitization = (paths[k][0] || "").replace(/((\/?\*)|\/|\$1)$/, "");
				this.project.addSourceFilesAtPaths(sanitization + "/**/*.d.ts");
			});
		}

		this.project.addSourceFilesAtPaths("node_modules/**/*.d.ts");
		this.project.resolveSourceFileDependencies();

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
	 * @returns Partial<T>
	 */
	generateAndRemoveAll<T>(interfaceName: string, config?: Configuration): Partial<T> {
		const data = this.generate<T>(interfaceName, config);
		this.removeAll();
		return data;
	}

	/**
	 *
	 * @param sourceFileName Source file name ex: test.model.ts
	 * @param interfaceName Interface name ex: Hero
	 * @param config Configuration
	 * @returns Partial<T>
	 */
	generate<T>(interfaceName: string, config?: Configuration): Partial<T> {

		if (config?.fieldValues) {
			config.fieldValues = mapKeys(config.fieldValues, (_, key) => {
				return `${interfaceName}-${key}`;
			});
		}

		const configuration = merge(
			{},
			DEFAULT_CONFIGURATION,
			{ ["fieldValues"]: this.fieldValues },
			config
		);

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
