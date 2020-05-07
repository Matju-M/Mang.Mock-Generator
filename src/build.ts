import {
	forEach,
	isEmpty,
	Dictionary,
	head,
	map,
	compact,
	isNull
} from "lodash";
import {
	SourceFile,
	ExpressionWithTypeArguments,
	Type,
	InterfaceDeclaration,
	PropertySignature
} from "ts-morph";

import { Configuration, PRIMITIVE_TYPES } from './generator.config';

export function build<T>(interfaceName: string, sourceFiles: SourceFile[], skeleton: T, config: Required<Configuration>): T {
	return builder(interfaceName, sourceFiles, skeleton, config, {});
}

function builder<T>(
	interfaceName: string,
	sourceFiles: SourceFile[],
	skeleton: T,
	config: Required<Configuration>,
	recursions: object,
	hasOptionalParent?: boolean
): T {

	const sanitizedInterfaceName = sanitizeInterface(interfaceName);
	const interfaceDeclaration = getInterfaceByName(sourceFiles, sanitizedInterfaceName);
	if (!interfaceDeclaration) {
		return skeleton;
	}

	// interfaceDeclaration.getExtends().forEach(x => console.log("::1>>", x.getText(), head(x.getDescendants()).));
	const props = interfaceDeclaration.getProperties();

	props.push(...getExtendedProps(interfaceDeclaration, sourceFiles));

	props.forEach(prop => {

		const addProp = config.includeAllProps || prop.hasQuestionToken();

		let includeAllChildren: boolean | undefined;
		if (hasOptionalParent === undefined && addProp) {
			includeAllChildren = true;
		}

		const propType = prop.getType().getNonNullableType();
		const isPrimitive = isPrimitiveType(propType);

		const sanitizedPropType = sanitizePropType(propType);
		if (sanitizedInterfaceName === sanitizedPropType) {
			recursions[sanitizedPropType] = recursions[sanitizedPropType] ? recursions[sanitizedPropType] + 1 : 1;
			if (recursions[sanitizedPropType] > config.maxRecursiveLoop) {
				console.warn(`[WARNING]: Stopping recursing exceeding maxRecursiveLoop for key: ${sanitizedPropType}`);
				return;
			}
		}
		const fieldValue = getFieldValue(config.fieldValues, interfaceName, prop.getName());
		if (fieldValue !== undefined) {
			skeleton[prop.getName()] = fieldValue;
		}
		else if (propType.isEnum() && (addProp || hasOptionalParent)) {

			const sanitizedEnumInterface = propType.getText().split(").");
			const sanitizedInterfaceItem = sanitizedEnumInterface.pop() || "";
			const enumInterface = head(compact(map(sourceFiles, x => x.getEnum(sanitizedInterfaceItem))))
			if (enumInterface) {
				const fieldValue = getFieldValue(config.fieldValues, interfaceName, prop.getName());
				const enumMember = enumInterface.getMembers()[0]; // Get First Member;

				skeleton[prop.getName()] = fieldValue || isNull(fieldValue) ? fieldValue : enumMember.getText();
			} else {
				console.error(`[ERROR]: Enum Interface ${propType.getText()} not found!`);
			}
		} else if (propType.isArray() && !isPrimitive) {
			const tempSkeleton = [{}];
			builder(
				sanitizedPropType,
				sourceFiles,
				tempSkeleton[0],
				config,
				recursions,
				includeAllChildren || hasOptionalParent
			);

			if (!isEmpty(tempSkeleton[0])) {
				skeleton[prop.getName()] = tempSkeleton;
			}
		} else if (propType.isObject() && !isPrimitive) {
			const tempSkeleton = {};
			builder(
				sanitizedPropType,
				sourceFiles,
				tempSkeleton,
				config,
				recursions,
				includeAllChildren || hasOptionalParent
			);
			if (!isEmpty(tempSkeleton)) {
				skeleton[prop.getName()] = tempSkeleton;
			}
		} else if (addProp || hasOptionalParent) {
			skeleton[prop.getName()] = getValue(prop.getName(), propType, sanitizedInterfaceName, config);
		}
	});
	return skeleton;
}

function sanitizePropType(type: Type): string {
	return (type.getText().split(").").pop() || "").replace("[]", "");
}

function isPrimitiveType(type: Type): boolean {
	const t = type.getText();
	return PRIMITIVE_TYPES.indexOf(t) > -1;
}

function getValue(key: string, type: Type, interfaceName: string, config: Required<Configuration>, ): any {
	const fieldValue = getFieldValue(config.fieldValues, interfaceName, key);
	if (fieldValue || isNull(fieldValue)) {
		return fieldValue;
	}
	return getPrimitiveDefaultValue(type, config.primitiveValues)
}

function getPrimitiveDefaultValue(type: Type, primitiveValues: Dictionary<any>): any {
	const t = type.getText();
	return primitiveValues[t];
}

function getFieldValue(fieldValues: Dictionary<any>, interfaceName: string, key: string): any {
	const fieldValueKey = `${interfaceName}-${key}`;
	return fieldValues[fieldValueKey];
}

function getExtendedProps(declaration: InterfaceDeclaration, sourceFiles: SourceFile[]): PropertySignature[] {
	const props: PropertySignature[] = [];
	const interfaceExtends = declaration.getExtends();

	if (!interfaceExtends.length) {
		return declaration.getProperties();
	}

	forEach(interfaceExtends, (e: ExpressionWithTypeArguments) => {
		const extendedDeclaration = getInterface(sourceFiles, e);

		if (extendedDeclaration) {
			const extended = extendedDeclaration.getExtends();
			if (extended) {
				forEach(extended, a => {
					const propType = a.getType().getNonNullableType();
					if (!isPrimitiveType(propType)) {
						const interfaceDeclaration = getInterface(sourceFiles, a);
						if (interfaceDeclaration) {
							const extendedProps = getExtendedProps(interfaceDeclaration, sourceFiles);
							props.push(...extendedProps);
						}
					}
				});
			}
			props.push(...extendedDeclaration.getProperties());
		}
	});

	return props;
}

function getInterface(sourceFiles: SourceFile[], exp: ExpressionWithTypeArguments): InterfaceDeclaration | undefined {
	const name = sanitizeInterface(exp.getText());
	return getInterfaceByName(sourceFiles, name);
}

function getInterfaceByName(sourceFiles: SourceFile[], name: string): InterfaceDeclaration | undefined {
	const extendedDeclaration = head(compact(sourceFiles.map(x => {
		if (x.isInNodeModules()) {
			const interfaceFound = x.getInterface(name);
			if (interfaceFound) {
				return interfaceFound;
			}
			return head(compact(x.getNamespaces().map(x => x.getInterface(name))));
		} else {
			return x.getInterface(name);
		}
	})));
	return extendedDeclaration;
}

function sanitizeInterface(interfaceName: string): string {
	return interfaceName.split(").").pop() || "";
}
