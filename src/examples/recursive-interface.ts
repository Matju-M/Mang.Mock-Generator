import faker = require('faker');
import { Generator } from '../generator';

export interface HeroRecursive {
	name: string;
	altName: string;
	codes: string[];
	hero?: HeroRecursive
}

const generator = new Generator("tsconfig.json");
let data = generator.generate<HeroRecursive>("recursive-interface.ts", "HeroRecursive");

console.log("::Default::", data);

// OUTPUT >> ::Default:: { hero: { name: '[MOCK]', altName: '[MOCK]', codes: [ '[MOCK]' ] } }

data = generator.generate("recursive-interface.ts", "HeroRecursive", {
	includeAllProps: true
});

console.log("::IncludeAllProps::", data);

// OUTPUT >> ::IncludeAllProps:: 
// {
// 	name: '[MOCK]',
// 	altName: '[MOCK]',
// 	codes: ['[MOCK]'],
// 	hero: {
// 		name: '[MOCK]',
// 		altName: '[MOCK]',
// 		codes: ['[MOCK]']
// 	}
// }

data = generator.generate("recursive-interface.ts", "HeroRecursive", {
	includeAllProps: true,
	maxRecursiveLoop: 2
})

console.log("::Max Recursion = 2::", data);

// OUTPUT >> ::Max Recursion = 2:: 
// {
// 	name: '[MOCK]',
// 	altName: '[MOCK]',
// 	codes: ['[MOCK]'],
// 	hero:
// 	{
// 		name: '[MOCK]',
// 		altName: '[MOCK]',
// 		codes: ['[MOCK]'],
// 		hero: { 
// 			name: '[MOCK]', 
// 			altName: '[MOCK]', 
// 			codes: ['[MOCK]'] 
// 		}
// 	}
// }

// Using Field Values to add customised generated data.
generator.add<HeroRecursive>("HeroRecursive", "name", faker.name.findName());

data = generator.generate("recursive-interface.ts", "HeroRecursive", {
	includeAllProps: true
})

console.log("::Field Values::", data);

generator.remove<HeroRecursive>("HeroRecursive", "name");

// OUTPUT >> ::Field Values:: 
// {
// 	name: 'Jarrell Williamson',
// 	altName: '[MOCK]',
// 	codes: ['[MOCK]'],
// 	hero:
// 	{
// 		name: 'Jarrell Williamson',
// 		altName: '[MOCK]',
// 		codes: ['[MOCK]']
// 	}
// }


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

// OUTPUT >> ::Primitive Values:: 
// { 
// 	hero: { 
// 		name: 'TEST',
// 		altName: 'TEST', 
// 		codes: [ 'TEST' ] 
// 	} 
// }

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
// 	name: 'Hailey Rempel',
//   	altName: '[MOCK]',
//   	codes: [ 'TEST' ],
// 	hero: { 
// 		name: 'Hailey Rempel', 
// 		altName: '[MOCK]', 
// 		codes: [ 'TEST' ] 
// 	} 
// }

