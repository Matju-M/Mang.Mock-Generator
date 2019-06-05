import { Generator } from "../generator";

let generator: Generator;

beforeAll(() => {
	generator = new Generator("./tsconfig.json");
})

beforeEach(() => {
	expect(generator).not.toBeUndefined();
});

test("HeroRecursive", () => {
	const data = generator.generate("test.model.ts", "HeroRecursive");
	expect(data).not.toBeUndefined();
	const expectedData = {
		"heros": [{
			"alt": "[MOCK]",
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
				"heros": [
					{
						"alt": "[MOCK]",
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
	const data = generator.generate("test.model.ts", "Hero", { includeAllProps: true });
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
