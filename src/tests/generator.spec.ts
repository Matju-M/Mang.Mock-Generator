import faker = require('faker');
import { Generator } from "../generator";
import { Hero, HeroRecursive } from './test.model';

let generator: Generator;

beforeAll(() => {
	generator = new Generator("./tsconfig.json");
})

beforeEach(() => {
	expect(generator).not.toBeUndefined();
});

test("Configuration Fallback", () => {
	generator.add<HeroRecursive>("HeroRecursive", "name", faker.name.findName());

	const data = generator.generate<HeroRecursive>("test.model.ts", "HeroRecursive", {
		includeAllProps: true,
		primitiveValues: {
			"string[]": ["TEST"]
		}
	})

	generator.remove<HeroRecursive>("HeroRecursive", "name");

	expect(data.alt).toEqual("[MOCK]");
	expect(data.codes).toEqual(["TEST"]);
	expect(data.name).toBeDefined();
	expect(data.name).not.toEqual("[MOCK]")
	expect(data.heros).toBeDefined();
});

test("HeroRecursive", () => {
	const data = generator.generate("test.model.ts", "HeroRecursive");
	expect(data).not.toBeUndefined();
	const expectedData = {
		"heros": [{
			"alt": "[MOCK]",
			"codes": ["[MOCK]"],
			"name": "[MOCK]"
		}]
	};
	expect(data).toEqual(expectedData);
});

test("HeroRecursive { maxRecursiveLoop: 2}", () => {
	const data = generator.generate("test.model.ts", "HeroRecursive", { maxRecursiveLoop: 2 });
	expect(data).not.toBeUndefined();
	const expectedData = {
		"heros": [
			{
				"alt": "[MOCK]",
				"codes": ["[MOCK]"],
				"heros": [
					{
						"alt": "[MOCK]",
						"codes": ["[MOCK]"],
						"name": "[MOCK]"
					}
				], "name": "[MOCK]"
			}
		]
	};
	expect(data).toEqual(expectedData);
});

test("Hero {includeAllProps = false}", () => {
	const data = generator.generate("test.model.ts", "Hero");
	expect(data).not.toBeUndefined();
	const expected = {
		sortOrder: -1,
		heroTypeIds: [-1],
		countryId: -1
	};
	expect(data).toEqual(expected);
});

test("Hero {includeAllProps = true}", () => {
	const data = generator.generate<Hero>("test.model.ts", "Hero", { includeAllProps: true });
	expect(data).not.toBeUndefined();
	const expected = {
		"id": -1,
		"name": "[MOCK]",
		"code": "[MOCK]",
		"sortOrder": -1,
		"heroTypeIds": [-1],
		"countryId": -1
	}
	expect(data).toEqual(expected);
});

test("HeroTypesMenu", () => {
	const data = generator.generate("test.model.ts", "HeroTypesMenu");
	expect(data).not.toBeUndefined();
	const expected = {
		"heroTypes": [{
			"continents": [{
				"countries": [{
					"localities": [{
						"id": -1,
						"heroName": "[MOCK]",
						"heroType": "[MOCK]"
					}],
					"id": -1,
					"name": "[MOCK]"
				}]
			}]
		}]
	}

	expect(data).toEqual(expected);
});

test("Bricks", () => {
	const data = generator.generate("test.model.ts", "Bricks");
	expect(data).not.toBeUndefined();
	const expected = {
		material:
		{
			name: '[MOCK]',
			code: -1,
			location: {
				name: '[MOCK]',
				iso: '[MOCK]'
			}
		},
		details: [
			{
				concreteClass: "C5",
				code: '[MOCK]',
				alternatives: [
					{
						name: "[MOCK]",
						iso: "[MOCK]"
					}
				]
			}
		],
		optional: '[MOCK]'
	};
	expect(data).toEqual(expected);
});

test("Bricks with custom data", () => {

	const data = generator.generate("test.model.ts", "Bricks", {
		primitiveValues: {
			"string[]": ["TEST"],
			"string": "TEST",
			"number[]": [-66],
			"number": -66,
		}
	});

	expect(data).not.toBeUndefined();
	const expected = {
		material:
		{
			name: 'TEST',
			code: -66,
			location: {
				name: 'TEST',
				iso: 'TEST'
			}
		},
		details: [
			{
				concreteClass: "C5",
				code: 'TEST',
				alternatives: [
					{
						name: "TEST",
						iso: "TEST"
					}
				]
			}
		],
		optional: 'TEST'
	};
	expect(data).toEqual(expected);
});

test("Hero with custom fieldValues", () => {
	generator.add("Hero", "name", faker.name.findName());
	const data = generator.generate<Hero>("test.model.ts", "Hero", { includeAllProps: true });

	expect(data).not.toBeUndefined();

	expect(data.code).toEqual("[MOCK]");
	expect(data.name).toBeDefined();
	expect(data.name).not.toEqual("[MOCK]");
});
