import { Dictionary } from 'lodash';

export interface Configuration {
	includeAllProps?: boolean;
	maxRecursiveLoop?: number;
	primitiveValues?: Dictionary<any>;
};


export const PRIMITIVE_TYPES = ["string[]", "string", "number[]", "number", "boolean", "boolean[]"];

export const DEFAULT_PRIMITIVE_VALUES = {
	"string[]": ["[MOCK]"],
	"string": "[MOCK]",
	"number[]": [-1],
	"number": -1,
	"boolean[]": [true],
	"boolean": true
}

export const DEFAULT_CONFIGURATION = {
	includeAllProps: false,
	maxRecursiveLoop: 1,
	primitiveValues: DEFAULT_PRIMITIVE_VALUES
}
