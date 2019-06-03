import { Project, SourceFile } from "ts-morph";
import { build } from "..";

let sourceFile: SourceFile;
beforeAll(() => {
	const project = new Project();
	sourceFile = project.addExistingSourceFile("./src/tests/test.model.ts");
})

beforeEach(() => {
	expect(sourceFile).not.toBeUndefined();
});

test("Hero", () => {
	const data = build("Hero", sourceFile, {});
	expect(data).not.toBeUndefined();
	const expected = {
		sortOrder: -1,
		heroTypeIds: [-1],
		countryId: -1
	};
	expect(data).toEqual(expected);
});

test("HeroTypesMenu", () => {
	const data = build("HeroTypesMenu", sourceFile, {});
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
	const data = build("Bricks", sourceFile, {});
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