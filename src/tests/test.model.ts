export interface Hero {
	id: number;
	name: string;
	code: string;
	sortOrder?: number;
	heroTypeIds?: number[];
	countryId?: number;
}

export interface Bricks {
	name: string;
	material: Material;
	details: BricksDetails[];
	optional?: string;
}

export enum ConcreteClassType {
	C5,
	C10,
	C16,
	C20,
	C25,
	C30
}

interface Material {
	name?: string;
	code?: number;
	strength: number;
	location?: MaterialLocation;
}

interface MaterialLocation {
	name: string;
	iso: string;
}

interface BricksDetails {
	name: string;
	code?: string;
	concreteClass?: ConcreteClassType;
	alternatives?: MaterialLocation[];
}

export interface HeroTypesMenu {
	heroTypes: HeroTypes[];
}

export interface Menu {
	id: number;
}

export interface EntityMenu extends Menu {
	name: string;
}

export interface HeroTypes extends EntityMenu {
	continents: ContinentsMenu[];
}

export interface ContinentsMenu extends EntityMenu {
	countries?: CountriesMenu[];
}

export interface CountriesMenu extends EntityMenu {
	localities?: LocalitiesMenu[];
}

export interface LocalitiesMenu extends Menu {
	heroName: string;
	heroType: string;
}

export interface HeroRecursive {
	alt: string;
	codes: string[];
	heroType: HeroType,
	heros?: HeroRecursive[],
	name: string;
}

export enum HeroType {
	Fire,
	Wood,
	Ice,
	Rock
}
