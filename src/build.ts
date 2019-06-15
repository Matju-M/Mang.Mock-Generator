import { forEach, isEmpty, Dictionary } from "lodash";
import { SourceFile, ExpressionWithTypeArguments, Type } from "ts-morph";

import { Configuration, PRIMITIVE_TYPES } from './generator.config';

export function build<T>(interfaceName: string, sourceFile: SourceFile, skeleton: T, config: Required<Configuration>): T {
	return builder(interfaceName, sourceFile, skeleton, config, {});
}

function builder<T>(
	interfaceName: string,
	sourceFile: SourceFile,
	skeleton: T,
	config: Required<Configuration>,
	recursions: object,
	hasOptionalParent?: boolean
): T {

	const sanitizedInterfaceName = interfaceName.split(").").pop() || "";
	const interfaceDeclaration = sourceFile.getInterface(sanitizedInterfaceName);

	if (!interfaceDeclaration) {
		return skeleton;
	}
	const props = interfaceDeclaration.getProperties();
	const interfaceExtends = interfaceDeclaration.getExtends();

	if (interfaceExtends) {
		forEach(interfaceExtends, (e: ExpressionWithTypeArguments) => {
			const extendedDeclaration = sourceFile.getInterface(e.getText());
			if (extendedDeclaration) {
				props.push(...extendedDeclaration.getProperties());
			}
		});
	}

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

		if (propType.isEnum() && (addProp || hasOptionalParent)) {
			const sanitizedEnumInterface = propType.getText().split(").");
			const enumInterface = sourceFile.getEnum(sanitizedEnumInterface.pop() || "");
			if (enumInterface) {
				const fieldValue = getFieldValue(config.fieldValues, interfaceName, prop.getName());
				const enumMember = enumInterface.getMembers()[0]; // Get First Member;

				skeleton[prop.getName()] = fieldValue ? fieldValue : enumMember.getText();
			} else {
				console.error(`[ERROR]: Enum Interface ${propType.getText()} not found!`);
			}
		} else if (propType.isArray() && !isPrimitive) {
			const tempSkeleton = [{}];
			builder(
				sanitizedPropType,
				sourceFile,
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
				sourceFile,
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
	return getFieldValue(config.fieldValues, interfaceName, key) || getPrimitiveDefaultValue(type, config.primitiveValues)
}

function getPrimitiveDefaultValue(type: Type, primitiveValues: Dictionary<any>): any {
	const t = type.getText();
	return primitiveValues[t];
}

function getFieldValue(fieldValues: Dictionary<any>, interfaceName: string, key: string): any {
	const fieldValueKey = `${interfaceName}-${key}`;
	return fieldValues[fieldValueKey];
}