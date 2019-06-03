import { Generator } from "../generator";

// let sourceFile: SourceFile;
let generator: Generator;

beforeAll(() => {
	generator = new Generator("./tsconfig.json");
})

beforeEach(() => {
	expect(generator).not.toBeUndefined();
});

test("Hero", () => {
	const data = generator.generate("test.model.ts", "Hero");
	expect(data).not.toBeUndefined();
	const expected = {
		sortOrder: -1,
		heroTypeIds: [-1],
		countryId: -1
	};
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