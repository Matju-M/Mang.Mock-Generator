import * as faker from "faker";
import { IMinimatch } from "minimatch";

import { Generator } from '../generator';
import { HeroRecursive } from "../tests/test.model";

export enum HeroType {
	Fire,
	Wood,
	Ice,
	Rock
}

export interface TestMatch extends IMinimatch {
	test: string;
}

const generator = new Generator("tsconfig.json");
let data = generator.generate<HeroRecursive>("HeroRecursive");

console.log("::Default::", data);

data = generator.generate("IMinimatch", { includeAllProps: true });
console.log("::IMinimatch::", data);

data = generator.generate("HeroRecursive", {
	includeAllProps: true
});

console.log("::IncludeAllProps::", data);

// OUTPUT >> ::IncludeAllProps:: 
// {
// 	name: 'MOCK',
// 	altName: 'MOCK',
// 	codes: ['MOCK'],
//  heroType: 'Fire',
// 	hero: {
// 		name: 'MOCK',
// 		altName: 'MOCK',
// 		codes: ['MOCK']
//      heroType: 'Fire'
// 	}
// }

data = generator.generate("HeroRecursive", {
	includeAllProps: true,
	maxRecursiveLoop: 2
})

console.log("::Max Recursion = 2::", data);

// OUTPUT >> ::Max Recursion = 2:: 
// {
// 	name: 'MOCK',
// 	altName: 'MOCK',
// 	codes: ['MOCK'],
//  heroType: 'Fire',
// 	hero:
// 	{
// 		name: 'MOCK',
// 		altName: 'MOCK',
// 		codes: ['MOCK'],
//      heroType: 'Fire',
// 		hero: { 
// 			name: 'MOCK', 
// 			altName: 'MOCK', 
// 			codes: ['MOCK'],
//          heroType: 'Fire',
// 		}
// 	}
// }

// Using Field Values to add customised generated data.
generator.add<HeroRecursive>("HeroRecursive", "name", faker.name.findName());
generator.add<HeroRecursive>("HeroRecursive", "heroType", HeroType.Rock);

data = generator.generate("HeroRecursive", {
	includeAllProps: true
})

console.log("::Field Values::", data);

generator.remove<HeroRecursive>("HeroRecursive", "name");
generator.remove<HeroRecursive>("HeroRecursive", "heroType");

// OUTPUT >> ::Field Values:: 
// {
// 	name: 'Jarrell Williamson',
// 	altName: 'MOCK',
// 	codes: ['MOCK'],
//  heroType: 3
// 	hero:
// 	{
// 		name: 'Jarrell Williamson',
// 		altName: 'MOCK',
// 		codes: ['MOCK'],
//      heroType: 3
// 	}
// }


// Using Primitive Values. Currently support is for string, number and boolean
data = generator.generate("HeroRecursive", {
	primitiveValues: {
		"string[]": ["TEST"],
		"string": "TEST",
		"number[]": [-66],
		"number": -66,
		"boolean[]": [false],
		"boolean": false
	}
})

console.log("::Primitive Values::", data);

// OUTPUT >> ::Primitive Values:: 
// { 
// 	hero: { 
// 		name: 'TEST',
// 		altName: 'TEST', 
// 		codes: [ 'TEST' ],
//		heroType: 'Fire'
// 	} 
// }

// Using Field Values, Primitive Values and Default Values (Fallbacks)

generator.add<HeroRecursive>("HeroRecursive", "name", faker.name.findName());

data = generator.generate("HeroRecursive", {
	includeAllProps: true,
	primitiveValues: {
		"string[]": ["TEST"]
	}
})

console.log("::Fallbacks::", data);
generator.remove<HeroRecursive>("HeroRecursive", "name");

// OUTPUT >> 
// { 
// 	name: 'Hailey Rempel',
//  altName: 'MOCK',
//  codes: [ 'TEST' ],
//  heroType: 'Fire',
// 	hero: { 
// 		name: 'Hailey Rempel', 
// 		altName: 'MOCK', 
// 		codes: [ 'TEST' ] 
//      heroType: 'Fire'
// 	} 
// }
