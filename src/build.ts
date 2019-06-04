import { forEach, isEmpty } from "lodash";
import { SourceFile, ExpressionWithTypeArguments, Type } from "ts-morph";

import { Configuration } from './generator.config';

export function build<T>(interfaceName: string, sourceFile: SourceFile, skeleton: T, config: Configuration): T {
	return builder(interfaceName, sourceFile, skeleton, config, {});
}

function builder<T>(interfaceName: string, sourceFile: SourceFile, skeleton: T, config: Configuration, recursions: object, hasOptionalParent?: boolean): T {

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
		// let stopRecursion = false;

		const sanitizedPropType = sanitizePropType(propType);
		if (sanitizedInterfaceName === sanitizedPropType) {
			recursions[sanitizedPropType] = recursions[sanitizedPropType] ? recursions[sanitizedPropType] + 1 : 1;
			if (recursions[sanitizedPropType] > config.maxRecursiveLoop!) {
				console.warn(`[WARNING]: Stopping recursing exceeding maxRecursiveLoop for key: ${sanitizedPropType}`);
				return;
			}
		}

		// if (stopRecursion) {
		// 	console.warn(`[WARNING]: Stopping recursing exceeding maxRecursiveLoop for key: ${sanitizedPropType}`);
		// 	stopRecursion = false;
		// } else 
		if (propType.isEnum()) {
			const sanitizedEnumInterface = propType.getText().split(").");
			const enumInterface = sourceFile.getEnum(sanitizedEnumInterface.pop() || "");
			if (enumInterface) {
				const enumMember = enumInterface.getMembers()[0]; // Get First Member;
				skeleton[prop.getName()] = enumMember.getText();
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
			skeleton[prop.getName()] = getPrimitiveDefaultValue(propType);
		}
	});
	return skeleton;
}

function sanitizePropType(type: Type): string {
	return (type.getText().split(").").pop() || "").replace("[]", "");
}

function isPrimitiveType(type: Type): boolean {
	const t = type.getText();
	return ["string[]", "string", "number[]", "number", "boolean", "boolean[]"].indexOf(t) > -1;
}

// FIXME: this needs to be exposed so that user can add their own defaults (maybe fallback to this)
function getPrimitiveDefaultValue(type: Type) {
	const t = type.getText();
	if (t.indexOf("string[]") > -1) {
		return ["[MOCK]"];
	}
	if (t.indexOf("string") > -1) {
		return "[MOCK]";
	}
	if (t.indexOf("number[]") > -1) {
		return [-1];
	}
	if (t.indexOf("number") > -1) {
		return -1;
	}
	if (t.indexOf("boolean[]") > -1) {
		return [true];
	}
	if (t.indexOf("boolean") > -1) {
		return true;
	}
}