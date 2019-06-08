
# Typescript Mock Generator

[![Build Status](https://travis-ci.com/Matju-M/Mang.Mock-Generator.svg?token=6znnpbkcfbTWdET8AcgS&branch=master)](https://travis-ci.com/Matju-M/Mang.Mock-Generator)
[![npm version](https://img.shields.io/npm/v/@mangm/ts-mock-generator.svg)](https://www.npmjs.com/package/@mangm/ts-mock-generator)


This library generates mock data from Typescript interfaces.

```js
import { Generator, Configuration } from "@mangm/ts-mock-generator";

const generator = new Generator("./tsconfig.json");
const config: Configuration = {

	// this will include only optional data: defaults to false
	includeAllProps: true, 

	// this will create only one recursive iteration if parent and child have the same interface: defaults to 1
	maxRecursiveLoop: 2,

	// defines a custom output for default primitive type. For now support is for
	// number, number[], string, string[], boolean & boolean[]. This defaults to DEFAULT_PRIMITIVE_VALUES constant.
	primitiveValues: {
		"string[]": ["TEST"],
		"string": "TEST",
		"number[]": [-66],
		"number": -66,
	}
};

generator.add("Hero", "name", faker.name.findName());

const data = generator.generate("test.model.ts", "Hero",  config);

generator.remove("Hero", "name");

```

Output: 
```js
{
	"id": -66,
	"name": "<Generated Differently Everytime>",
	"code": "[TEST]",
	"sortOrder": -66,
	"heroTypeIds": [-66],
	"countryId": -66
}
```

### Installation
Install `ts-mock-generator` via npm:

	npm i @mangm/ts-mock-generator

This package internally uses [ts-morph](https://github.com/dsherret/ts-morph).
