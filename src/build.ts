import { forEach, isEmpty } from "lodash";
import { SourceFile, ExpressionWithTypeArguments, Type } from "ts-morph";

export function build<T>(interfaceName: string, sourceFile: SourceFile, skeleton: T, includeAll: boolean): T {
	return builder(interfaceName, sourceFile, skeleton, includeAll);
}

function builder<T>(interfaceName: string, sourceFile: SourceFile, skeleton: T, includeAll: boolean, hasOptionalParent?: boolean): T {
		
	const sanitizedInterfaceName = interfaceName.split(").");
	const interfaceDeclaration = sourceFile.getInterface(sanitizedInterfaceName.pop() || "");

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
		const addProp = includeAll || prop.hasQuestionToken();

		let includeAllChildren: boolean | undefined;
		if (hasOptionalParent === undefined && addProp) {
			includeAllChildren = true;
		}

		const propType = prop.getType().getNonNullableType();
		const isPrimitive = isPrimitiveType(propType);

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
				propType.getText().replace("[]", ""),
				sourceFile,
				tempSkeleton[0],
				includeAll,
				includeAllChildren || hasOptionalParent
			);

			if (!isEmpty(tempSkeleton[0])) {
				skeleton[prop.getName()] = tempSkeleton;
			}
		} else if (propType.isObject() && !isPrimitive) {
			const tempSkeleton = {};
			builder(
				propType.getText().replace("[]", ""),
				sourceFile,
				tempSkeleton,
				includeAll,
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