export interface Configuration {
	includeAllProps?: boolean;
	maxRecursiveLoop?: number;
};

export const DEFAULT_CONFIGURATION = {
	includeAllProps: false,
	maxRecursiveLoop: 1
}