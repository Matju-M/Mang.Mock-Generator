import * as faker from "faker";

import { Generator } from "../generator";
import {Hero, HeroRecursive, HeroType } from "./test.model";

let generator: Generator;

beforeAll(() => {
	generator = new Generator("./tsconfig.json");
})

beforeEach(() => {
	expect(generator).not.toBeUndefined();
});

test("Configuration Fallback", () => {
	generator.removeAll();
	generator.add<HeroRecursive>("HeroRecursive", "name", faker.name.findName());
	generator.add<HeroRecursive>("HeroRecursive", "heroType", HeroType.Rock);

	const data = generator.generate<HeroRecursive>("HeroRecursive", {
		includeAllProps: true,
		primitiveValues: {
			"string[]": ["TEST"]
		}
	});

	generator.remove<HeroRecursive>("HeroRecursive", "name");
	generator.remove<HeroRecursive>("HeroRecursive", "heroType");

	expect(data.heroType).toEqual(HeroType.Rock);
	expect(data.codes).toEqual(["TEST"]);
	expect(data.name).toBeDefined();
	expect(data.name).not.toEqual("MOCK")
});

test("HeroRecursive", () => {
	const data = generator.generate("HeroRecursive");
	expect(data).not.toBeUndefined();
	const expectedData = {
		"heros": [{
			"alt": "MOCK",
			"codes": ["MOCK"],
			"name": "MOCK",
			"heroType": "Fire"
		}]
	};
	expect(data).toEqual(expectedData);
});

test("HeroRecursive { maxRecursiveLoop: 2}", () => {
	const data = generator.generate("HeroRecursive", { maxRecursiveLoop: 2 });
	expect(data).not.toBeUndefined();
	const expectedData = {
		"heros": [
			{
				"alt": "MOCK",
				"codes": ["MOCK"],
				"heroType": "Fire",
				"heros": [
					{
						"alt": "MOCK",
						"codes": ["MOCK"],
						"name": "MOCK",
						"heroType": "Fire"
					}
				], "name": "MOCK"
			}
		]
	};
	expect(data).toEqual(expectedData);
});

test("Hero {includeAllProps = false}", () => {
	const data = generator.generate("Hero");
	expect(data).not.toBeUndefined();
	const expected = {
		sortOrder: -1,
		heroTypeIds: [-1],
		countryId: -1
	};
	expect(data).toEqual(expected);
});

test("Hero {includeAllProps = true}", () => {
	const data = generator.generate<Hero>("Hero", { includeAllProps: true });
	expect(data).not.toBeUndefined();
	const expected = {
		"id": -1,
		"name": "MOCK",
		"code": "MOCK",
		"sortOrder": -1,
		"heroTypeIds": [-1],
		"countryId": -1
	}
	expect(data).toEqual(expected);
});

test("HeroTypesMenu", () => {
	const data = generator.generate("HeroTypesMenu", { includeAllProps: false });
	expect(data).not.toBeUndefined();
	const expected = {
		"heroTypes": [{
			"continents": [{
				"countries": [{
					"localities": [{
						"id": -1,
						"heroName": "MOCK",
						"heroType": "MOCK"
					}],
					"id": -1,
					"name": "MOCK"
				}]
			}]
		}]
	}

	expect(data).toEqual(expected);
});

test("Bricks", () => {
	const code_data = faker.lorem.word();
	generator.add("BricksDetails", "code", code_data);
	const data = generator.generate("Bricks");
	expect(data).not.toBeUndefined();
	const expected = {
		material:
		{
			name: 'MOCK',
			code: -1,
			location: {
				name: 'MOCK',
				iso: 'MOCK'
			}
		},
		details: [
			{
				concreteClass: "C5",
				code: code_data,
				alternatives: [
					{
						name: "MOCK",
						iso: "MOCK"
					}
				]
			}
		],
		optional: 'MOCK'
	};
	expect(data).toEqual(expected);
});

test("Bricks with custom data", () => {
	
	generator.removeAll();
	const data = generator.generate("Bricks", {
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
	const data = generator.generate<Hero>("Hero", { includeAllProps: true });

	expect(data).not.toBeUndefined();

	expect(data.code).toEqual("MOCK");
	expect(data.name).toBeDefined();
	expect(data.name).not.toEqual("MOCK");
});

test("Hero with custom fieldValues as null", () => {
	generator.add("Hero", "name", null);
	const data = generator.generate<Hero>("Hero", { includeAllProps: true });

	expect(data).not.toBeUndefined();

	expect(data.code).toEqual("MOCK");
	expect(data.name).toBeNull();
});
