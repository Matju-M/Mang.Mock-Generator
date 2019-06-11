
# Typescript Mock Generator

[![Build Status](https://travis-ci.com/Matju-M/Mang.Mock-Generator.svg?token=6znnpbkcfbTWdET8AcgS&branch=master)](https://travis-ci.com/Matju-M/Mang.Mock-Generator)
[![npm version](https://img.shields.io/npm/v/@mangm/ts-mock-generator.svg)](https://www.npmjs.com/package/@mangm/ts-mock-generator)

This library generates mock data from Typescript interfaces.

Generate Mock Data from Typescript Interfaces. Includes support for [faker](https://www.npmjs.com/package/faker)

## Installation

Install `ts-mock-generator` via npm:

```bash
npm i @mangm/ts-mock-generator
```

This package internally uses [ts-morph](https://github.com/dsherret/ts-morph).

## Basic Usage

```js
import faker = require("faker");
import { Generator, Configuration } from "@mangm/ts-mock-generator";

const generator = new Generator("./tsconfig.json");

export interface Hero {
    id: number;
    name: string;
    code: string;
    sortOrder?: number;
    heroTypeIds?: number[];
    countryId?: number;
}

const data = generator.generate("current-files.ts", "Hero");
console.log(data);

// Output
{
    "sortOrder": -1,
    "heroTypeIds": [-1],
    "countryId": -1
}

```

## Defaults Configurations

By default, the generator has predefined settings.

### Default Primitive Values

The following are the default primitive values. These can be overridden
by defining one or more properties in primitiveValues configuration below.

| Property  | Default    |
|-----------|------------|
| string[]  | ["[MOCK]"] |
| string    | "[MOCK]"   |
| number[]  | [-1]       |
| number    | -2         |
| boolean[] | [true]     |
| boolean   | true       |

### Default Generator Configuration

The configuration is preset as in constant `DEFAULT_CONFIGURATION`.

| Property         | Description                                                                                                           | Default  |
|------------------|-----------------------------------------------------------------------------------------------------------------------|----------|
| includeAllProps  | include all properties, optional and not                                                                              | false    |
| maxRecursiveLoop | Limits the recursive iterations for the same interface as shown in examples with interface [HeroRecursive](#Examples) | 1        |
| primitiveValues  | Default Primitive Value Dictionary as above                                                                           | As above |
| fieldValues      | Custom values for each key in an interface.                                                                           | {}       |

```js
const data = generator.generate("current-files.ts", "Hero", optionalConfig);
```

## API

### Creating the Generator

Specify the location of the tsconfig. Relative to the root directory.

```js
const generator = new Generator("./tsconfig.json");
```

### Generate()

 The main function to generate the mock objects

 ```js
 const data = generator.generate("current-files.ts", "Hero", config);
 ```

| Option         | Description                                                                          | Type          | Required |
|----------------|--------------------------------------------------------------------------------------|---------------|----------|
| SourceFileName | The source file name. Include the `.ts`                                              | string        | true     |
| interfaceName  | The interface name.                                                                  | string        | true     |
| config         | Refer to section [Default Generator Configuration](#Default-Generator-Configuration) | Configuration | false    |

### Add < T >()

The add function is used to add keys to the Fields Value Dictionary in the [Default Generator Configuration](#Default-Generator-Configuration)

interfaceName: string, propertyKey: keyof T, propertyValue: string

| Option        | Description                                           | Type    |
|---------------|-------------------------------------------------------|---------|
| interfaceName | The interface name                                    | string  |
| propertyKey   | the property key. Key is dependant on the interface T | keyof T |
| propertyValue | any value                                             | any     |

### Remove < T >()

The remove funtion is used to remove keys to the Fields Value Dictionary in the s[Default Generator Configuration](#Default-Generator-Configuration)

| Option        | Description                                           | Type    |
|---------------|-------------------------------------------------------|---------|
| interfaceName | The interface name                                    | string  |
| propertyKey   | the property key. Key is dependant on the interface T | keyof T |

## Examples

```js
import faker = require('faker');
import { Generator } from '../generator';

export interface HeroRecursive {
    name: string;
    altName: string;
    codes: string[];
    hero?: HeroRecursive
}

const generator = new Generator("tsconfig.json");

// Basic Usage Generate Interface using default parameters
let data = generator.generate<HeroRecursive>("recursive-interface.ts", "HeroRecursive");

console.log("::Default::", data);

// OUTPUT >> ::Default:: { hero: { name: '[MOCK]' } }
```

```js
data = generator.generate("recursive-interface.ts", "HeroRecursive", {
    includeAllProps: true
});

console.log("::IncludeAllProps::", data);

// OUTPUT >> ::IncludeAllProps:: { name: '[MOCK]', hero: { name: '[MOCK]' } }

```

```js
data = generator.generate("recursive-interface.ts", "HeroRecursive", {
    includeAllProps: true,
    maxRecursiveLoop: 2
})

console.log("::Max Recursion = 2::", data);

// OUTPUT >> ::Max Recursion = 2:: { name: '[MOCK]',  hero: { name: '[MOCK]', hero: { name: '[MOCK]' } } }
```

```js
// Using Field Values to add customised generated data.
generator.add<HeroRecursive>("HeroRecursive", "name", faker.name.findName());

data = generator.generate("recursive-interface.ts", "HeroRecursive", {
    includeAllProps: true
})

console.log("::Field Values::", data);

generator.remove<HeroRecursive>("HeroRecursive", "name");

// OUTPUT >> ::Field Values:: { name: 'Duncan Kulas', hero: { name: 'Duncan Kulas' } }
```

```js
// Using Primitive Values. Currently support is for string, number and boolean
data = generator.generate("recursive-interface.ts", "HeroRecursive", {
    primitiveValues: {
        "string[]": ["TEST"],
        "string": "TEST",
        "number[]": [-66],
        "number": -66,
        "boolean[]": [false],
        "boolean": false,
    }
})

console.log("::Primitive Values::", data);

// OUTPUT >> ::Primitive Values:: { hero: { name: 'TEST' } }
```

```js
// Using Field Values, Primitive Values and Default Values (Fallbacks)

generator.add<HeroRecursive>("HeroRecursive", "name", faker.name.findName());

data = generator.generate("recursive-interface.ts", "HeroRecursive", {
    includeAllProps: true,
    primitiveValues: {
        "string[]": ["TEST"]
    }
})

console.log("::Fallbacks::", data);
generator.remove<HeroRecursive>("HeroRecursive", "name");

// OUTPUT >>
// {
//     name: 'Dion Jacobson',
//     altName: '[MOCK]',
//     codes: ['TEST'],
//     hero: {
//         name: 'Dion Jacobson',
//         altName: '[MOCK]',
//         codes: ['TEST']
//     }
// }

```
