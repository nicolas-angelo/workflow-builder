"use client";

import type { JSONSchema7 } from "ai";
import { Asterisk, Brackets, Plus, Save, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { parseJSONSchemaProperty } from "@/lib/workflow/json-schema-utils";

const MAX_NESTING_LEVEL = 5;

const SCHEMA_TYPES = [
	"string",
	"number",
	"integer",
	"boolean",
	"enum",
	"object",
] as const;

export type SchemaEditorJSONSchemaType = (typeof SCHEMA_TYPES)[number];

export interface SchemaEditorInternalSchemaProperty {
	id: string;
	type: SchemaEditorJSONSchemaType;
	isArray?: boolean;
	isRequired?: boolean;
	enumValues?: string[];
	properties?: Record<string, SchemaEditorInternalSchemaProperty>;
	description?: string;
}

export interface SchemaEditorInternalSchema {
	type: "object";
	properties: Record<string, SchemaEditorInternalSchemaProperty>;
	required?: string[];
	additionalProperties?: boolean;
	description?: string;
}

function convertToStandardJSONSchema(
	schema: SchemaEditorInternalSchema,
): JSONSchema7 {
	const convertProperty = (
		prop: SchemaEditorInternalSchemaProperty,
	): Record<string, unknown> => {
		const converted: Record<string, unknown> = {};

		if (prop.isArray) {
			converted.type = "array";
			const itemType: Record<string, unknown> = { type: prop.type };

			if (prop.type === "object" && prop.properties) {
				const nestedProperties: Record<string, unknown> = {};
				const nestedRequired: string[] = [];

				for (const [name, nestedProp] of Object.entries(
					prop.properties,
				)) {
					nestedProperties[name] = convertProperty(nestedProp);
					if (nestedProp.isRequired) {
						nestedRequired.push(name);
					}
				}

				itemType.properties = nestedProperties;
				if (nestedRequired.length > 0) {
					itemType.required = nestedRequired;
				}
			} else if (prop.type === "enum" && prop.enumValues) {
				itemType.enum = prop.enumValues;
			}

			converted.items = itemType;
		} else {
			converted.type = prop.type;

			if (prop.type === "enum" && prop.enumValues) {
				converted.enum = prop.enumValues;
				delete converted.type;
			}

			if (prop.type === "object" && prop.properties) {
				const nestedProperties: Record<string, unknown> = {};
				const nestedRequired: string[] = [];

				for (const [name, nestedProp] of Object.entries(
					prop.properties,
				)) {
					nestedProperties[name] = convertProperty(nestedProp);
					if (nestedProp.isRequired) {
						nestedRequired.push(name);
					}
				}

				converted.properties = nestedProperties;
				if (nestedRequired.length > 0) {
					converted.required = nestedRequired;
				}
			}
		}

		if (prop.description) {
			converted.description = prop.description;
		}

		return converted;
	};

	const result: Record<string, unknown> = {
		type: "object",
		properties: {},
	};

	const properties: Record<string, unknown> = {};
	const required: string[] = [];

	for (const [name, prop] of Object.entries(schema.properties || {})) {
		properties[name] = convertProperty(prop);
		if (prop.isRequired) {
			required.push(name);
		}
	}

	result.properties = properties;
	if (required.length > 0) {
		result.required = required;
	}

	if (schema.description) {
		result.description = schema.description;
	}

	return result;
}

function convertFromStandardJSONSchema(
	schema: JSONSchema7 | null,
): SchemaEditorInternalSchema {
	if (!schema || typeof schema !== "object") {
		return {
			type: "object",
			properties: {},
		};
	}

	const convertProperty = (
		prop: Record<string, unknown>,
		isRequired = false,
	): SchemaEditorInternalSchemaProperty => {
		const parsed = parseJSONSchemaProperty(prop);

		const internal: SchemaEditorInternalSchemaProperty = {
			id: nanoid(),
			type: parsed.type as SchemaEditorJSONSchemaType,
			isArray: parsed.isArray,
			isRequired,
			description: parsed.description,
			enumValues: parsed.enumValues,
		};

		if (parsed.properties) {
			internal.properties = {};
			const requiredArray = Array.isArray(prop.required)
				? prop.required
				: [];

			for (const [name, nestedParsed] of Object.entries(
				parsed.properties,
			)) {
				internal.properties[name] = convertProperty(
					nestedParsed as unknown as Record<string, unknown>,
					requiredArray.includes(name),
				);
			}
		}

		return internal;
	};

	const result: SchemaEditorInternalSchema = {
		type: "object",
		properties: {},
	};

	if (schema.properties && typeof schema.properties === "object") {
		const requiredArray = Array.isArray(schema.required)
			? schema.required
			: [];

		for (const [name, prop] of Object.entries(
			schema.properties as Record<string, unknown>,
		)) {
			if (typeof prop === "object" && prop !== null) {
				const converted = convertProperty(
					prop as Record<string, unknown>,
				);
				converted.isRequired = requiredArray.includes(name);
				result.properties[name] = converted;
			}
		}
	}

	if (schema.description && typeof schema.description === "string") {
		result.description = schema.description;
	}

	return result;
}

interface SchemaEditorPropertyRowProps {
	name: string;
	property: SchemaEditorInternalSchemaProperty;
	onUpdate: (property: SchemaEditorInternalSchemaProperty) => void;
	onRename: (newName: string) => void;
	onDelete: () => void;
	onAddProperty: (parentPath?: string) => void;
	level: number;
}

function SchemaEditorPropertyRow({
	name,
	property,
	onUpdate,
	onRename,
	onDelete,
	onAddProperty,
	level,
}: SchemaEditorPropertyRowProps) {
	const isNested = property.type === "object";
	const canNest = level < MAX_NESTING_LEVEL;

	const handleAddNestedProperty = () => {
		if (!isNested) {
			return;
		}

		const existingKeys = Object.keys(property.properties || {});
		let counter = 1;
		let newName = `property-${counter}`;
		while (existingKeys.includes(newName)) {
			counter++;
			newName = `property-${counter}`;
		}

		const newProperty: SchemaEditorInternalSchemaProperty = {
			id: nanoid(),
			type: "string",
			isArray: false,
			isRequired: false,
		};

		onUpdate({
			...property,
			properties: {
				...(property.properties || {}),
				[newName]: newProperty,
			},
		});
	};

	const handleDeleteNestedProperty = (propName: string) => {
		if (!isNested || !property.properties) {
			return;
		}

		const newProperties = { ...property.properties };
		delete newProperties[propName];

		onUpdate({
			...property,
			properties: newProperties,
		});
	};

	const handleUpdateNestedProperty = (
		propName: string,
		updatedProperty: SchemaEditorInternalSchemaProperty,
	) => {
		if (!isNested) {
			return;
		}

		onUpdate({
			...property,
			properties: {
				...(property.properties || {}),
				[propName]: updatedProperty,
			},
		});
	};

	const handleRenameNestedProperty = (oldName: string, newName: string) => {
		if (!isNested || !property.properties || oldName === newName) {
			return;
		}

		const newProperties: Record<
			string,
			SchemaEditorInternalSchemaProperty
		> = {};
		for (const [key, value] of Object.entries(property.properties)) {
			if (key === oldName) {
				newProperties[newName] = value;
			} else {
				newProperties[key] = value;
			}
		}

		onUpdate({
			...property,
			properties: newProperties,
		});
	};

	return (
		<div className="relative">
			{level > 0 && (
				<div
					className="absolute top-0 bottom-0 w-0.5 bg-border"
					style={{ left: `${(level - 1) * 20 + 20}px` }}
				/>
			)}

			<div
				className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-sm transition-colors w-full"
				style={{ paddingLeft: `${level * 20 + 12}px` }}
			>
				<Input
					value={name}
					onChange={(e) => {
						onRename(e.target.value);
					}}
					className="flex-1 min-w-0 h-8"
					placeholder="property-name"
				/>

				<Input
					value={property.description || ""}
					onChange={(e) => {
						onUpdate({
							...property,
							description: e.target.value,
						});
					}}
					className="flex-1 min-w-0 h-8 text-xs"
					placeholder="Description (optional)"
				/>

				<Select
					value={property.type}
					onValueChange={(newType) => {
						const updated: SchemaEditorInternalSchemaProperty = {
							...property,
							type: newType as SchemaEditorJSONSchemaType,
						};

						if (newType === "object" && !property.properties) {
							updated.properties = {};
						}

						if (newType !== "enum") {
							updated.enumValues = undefined;
						}

						onUpdate(updated);
					}}
				>
					<SelectTrigger size="sm" className="w-28 shrink-0">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						{SCHEMA_TYPES.map((type) => (
							<SelectItem key={type} value={type}>
								{type}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					variant={property.isArray ? "default" : "outline"}
					size="icon-sm"
					onClick={() =>
						onUpdate({
							...property,
							isArray: !property.isArray,
						})
					}
				>
					<Brackets size={16} />
				</Button>

				<Button
					variant={property.isRequired ? "default" : "outline"}
					size="icon-sm"
					onClick={() =>
						onUpdate({
							...property,
							isRequired: !property.isRequired,
						})
					}
				>
					<Asterisk size={16} />
				</Button>

				<Button variant="destructive" size="sm" onClick={onDelete}>
					<Trash2 size={16} />
				</Button>
			</div>

			{property.type === "enum" && (
				<div
					className="py-2"
					style={{ paddingLeft: `${level * 20 + 12}px` }}
				>
					<div className="text-xs font-medium mb-2 text-muted-foreground">
						Enum Values:
					</div>
					<div className="space-y-1 mb-2 ml-4">
						{(property.enumValues || []).map((value, index) => (
							<div
								key={`enum-${value}`}
								className="flex items-center gap-2"
							>
								<Input
									value={value}
									onChange={(e) => {
										const newEnumValues = [
											...(property.enumValues || []),
										];
										newEnumValues[index] = e.target.value;
										onUpdate({
											...property,
											enumValues: newEnumValues,
										});
									}}
									className="flex-1 h-8"
									placeholder="Enum value"
								/>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => {
										onUpdate({
											...property,
											enumValues: (
												property.enumValues || []
											).filter((_, i) => i !== index),
										});
									}}
								>
									<Trash2 size={16} />
								</Button>
							</div>
						))}
					</div>
					<div className="flex gap-2 ml-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								onUpdate({
									...property,
									enumValues: [
										...(property.enumValues || []),
										"",
									],
								});
							}}
							className="h-7 px-2 text-xs"
						>
							<Plus size={12} className="mr-1" />
							Add Value
						</Button>
					</div>
				</div>
			)}

			{isNested && canNest && (
				<div>
					{Object.entries(property.properties || {}).map(
						([propName, prop]) => (
							<SchemaEditorPropertyRow
								key={prop.id}
								name={propName}
								property={prop}
								onUpdate={(updated) =>
									handleUpdateNestedProperty(
										propName,
										updated,
									)
								}
								onRename={(newName) =>
									handleRenameNestedProperty(
										propName,
										newName,
									)
								}
								onDelete={() =>
									handleDeleteNestedProperty(propName)
								}
								onAddProperty={onAddProperty}
								level={level + 1}
							/>
						),
					)}

					<Button
						onClick={handleAddNestedProperty}
						variant="ghost"
						size="sm"
						className="w-full justify-start"
						style={{ paddingLeft: `${(level + 1) * 20 + 16}px` }}
					>
						<Plus size={16} />
						Add Property
					</Button>
				</div>
			)}
		</div>
	);
}

interface SchemaEditorVisualProps {
	initialSchema: JSONSchema7;
	onSave: (schema: JSONSchema7) => void;
	onClose: () => void;
}

export function SchemaEditorVisual({
	initialSchema,
	onSave,
	onClose,
}: SchemaEditorVisualProps) {
	const [internalSchema, setInternalSchema] =
		useState<SchemaEditorInternalSchema>(() =>
			convertFromStandardJSONSchema(initialSchema),
		);

	const [schemaDescription, setSchemaDescription] = useState<string>(
		initialSchema?.description || "",
	);

	const handleInternalChange = (updated: SchemaEditorInternalSchema) => {
		setInternalSchema(updated);
	};

	const handleSave = () => {
		const standardSchema = convertToStandardJSONSchema(internalSchema);
		if (schemaDescription.trim()) {
			standardSchema.description = schemaDescription.trim();
		}
		onSave(standardSchema);
		onClose();
	};

	const handleReset = () => {
		setInternalSchema({
			type: "object",
			properties: {},
		});
	};

	const handleAddProperty = () => {
		const existingKeys = Object.keys(internalSchema.properties || {});
		let counter = 1;
		let newName = `property-${counter}`;
		while (existingKeys.includes(newName)) {
			counter++;
			newName = `property-${counter}`;
		}

		const newProperty: SchemaEditorInternalSchemaProperty = {
			id: nanoid(),
			type: "string",
			isArray: false,
			isRequired: false,
		};

		handleInternalChange({
			...internalSchema,
			properties: {
				...internalSchema.properties,
				[newName]: newProperty,
			},
		});
	};

	const handleUpdateProperty = (
		name: string,
		property: SchemaEditorInternalSchemaProperty,
	) => {
		handleInternalChange({
			...internalSchema,
			properties: {
				...internalSchema.properties,
				[name]: property,
			},
		});
	};

	const handleRenameProperty = (oldName: string, newName: string) => {
		if (oldName === newName) {
			return;
		}

		const newProperties: Record<
			string,
			SchemaEditorInternalSchemaProperty
		> = {};
		for (const [key, value] of Object.entries(internalSchema.properties)) {
			if (key === oldName) {
				newProperties[newName] = value;
			} else {
				newProperties[key] = value;
			}
		}

		handleInternalChange({
			...internalSchema,
			properties: newProperties,
		});
	};

	const handleDeleteProperty = (name: string) => {
		const newProperties = { ...internalSchema.properties };
		delete newProperties[name];

		handleInternalChange({
			...internalSchema,
			properties: newProperties,
		});
	};

	return (
		<div className="flex flex-col h-full gap-4">
			<DialogHeader className="flex flex-row justify-start gap-4">
				<div className="flex flex-col gap-2">
					<DialogTitle>Schema Editor</DialogTitle>
					<DialogDescription>
						Edit the schema for the agent output
					</DialogDescription>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={handleReset} variant="outline" size="sm">
						Reset
					</Button>
					<Button onClick={handleSave} size="sm">
						<Save size={16} className="mr-1" />
						Save
					</Button>
				</div>
			</DialogHeader>
			<div className="space-y-4">
				<label
					htmlFor="schema-description"
					className="text-sm font-medium"
				>
					Schema Description
				</label>
				<Input
					id="schema-description"
					value={schemaDescription}
					onChange={(e) => setSchemaDescription(e.target.value)}
					placeholder="Overall schema description (optional)"
					className="w-full"
				/>
			</div>
			<div className="flex-1 flex flex-col overflow-y-auto">
				{Object.entries(internalSchema.properties || {}).map(
					([name, property]) => (
						<SchemaEditorPropertyRow
							key={property.id}
							name={name}
							property={property}
							onUpdate={(updated) =>
								handleUpdateProperty(name, updated)
							}
							onRename={(newName) =>
								handleRenameProperty(name, newName)
							}
							onDelete={() => handleDeleteProperty(name)}
							onAddProperty={handleAddProperty}
							level={0}
						/>
					),
				)}

				<Button
					onClick={handleAddProperty}
					variant="ghost"
					size="sm"
					className="w-full justify-start mt-2"
				>
					<Plus size={16} />
					Add Property
				</Button>
			</div>
		</div>
	);
}

interface SchemaEditorDialogProps {
	schema: JSONSchema7 | null;
	onSave: (schema: JSONSchema7) => void;
}

export function SchemaEditorDialog({
	schema,
	onSave,
}: SchemaEditorDialogProps) {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="w-full">
					{schema ? "Edit Schema" : "Create Schema"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-4xl h-full sm:max-h-[90vh] flex flex-col overflow-hidden">
				<SchemaEditorVisual
					initialSchema={schema || { type: "object", properties: {} }}
					onSave={onSave}
					onClose={() => setDialogOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
