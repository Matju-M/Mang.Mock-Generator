import { forEach, isEmpty } from "lodash";
import { SourceFile, ExpressionWithTypeArguments, Type } from "ts-morph";

export function build<T>(interfaceName: string, sourceFile: SourceFile, skeleton: T): T {
	return builder(interfaceName, sourceFile, skeleton);
}

function builder<T>(interfaceName: string, sourceFile: SourceFile, skeleton: T, hasOptionalParent?: boolean): T {
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
		let includeAllChildren: boolean | undefined;
		if (hasOptionalParent === undefined && prop.hasQuestionToken()) {
			includeAllChildren = true;
		}

		const isPrimitive = !!getPrimitiveDefaultValue(prop.getType());

		if (prop.getType().getNonNullableType().isArray() && !isPrimitive) {
			const tempSkeleton = [{}];
			builder(
				prop.getType().getNonNullableType().getText().replace("[]", ""),
				sourceFile,
				tempSkeleton[0],
				includeAllChildren || hasOptionalParent
			);

			if (!isEmpty(tempSkeleton[0])) {
				skeleton[prop.getName()] = tempSkeleton;
			}
		} else if (prop.getType().getNonNullableType().isObject() && !isPrimitive) {
			const tempSkeleton = {};
			builder(
				prop.getType().getNonNullableType().getText().replace("[]", ""),
				sourceFile,
				tempSkeleton,
				includeAllChildren || hasOptionalParent
			);
			if (!isEmpty(tempSkeleton)) {
				skeleton[prop.getName()] = tempSkeleton;
			}
		} else if (prop.hasQuestionToken() || hasOptionalParent) {
			skeleton[prop.getName()] = getPrimitiveDefaultValue(prop.getType().getNonNullableType());
		}
	});
	return skeleton;
}

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