import { ActionIcon, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

/**
 * @typedef {import("../services/recipes.service.js").RecipeIngredient} RecipeIngredient
 */

/**
 * @param {{
 *   value: RecipeIngredient[],
 *   onChange: (next: RecipeIngredient[]) => void
 * }} props
 */
export default function IngredientEditor({ value, onChange }) {
    const ingredients = Array.isArray(value) ? value : [];

    function updateAt(index, patch) {
        const next = ingredients.map((ing, i) => (i === index ? { ...ing, ...patch } : ing));
        onChange(next);
    }

    function addRow() {
        onChange([
            ...ingredients,
            {
                name: "",
                quantity: null,
                unit: null,
                notes: null,
                sortOrder: ingredients.length,
            },
        ]);
    }

    function removeAt(index) {
        const next = ingredients.filter((_, i) => i !== index).map((ing, i) => ({ ...ing, sortOrder: i }));
        onChange(next);
    }

    return (
        <Stack gap="sm">
            {ingredients.map((ing, index) => (
                <Group key={index} align="end" wrap="nowrap">
                    <TextInput
                        label={index === 0 ? "Ingredient" : undefined}
                        placeholder="e.g., Tomato Sauce"
                        value={ing.name || ""}
                        onChange={(e) => updateAt(index, { name: e.currentTarget.value })}
                        required
                        style={{ flex: 2 }}
                    />
                    <NumberInput
                        label={index === 0 ? "Qty" : undefined}
                        placeholder="1"
                        value={ing.quantity}
                        onChange={(val) => updateAt(index, { quantity: val === "" ? null : val })}
                        min={0}
                        step={0.25}
                        style={{ flex: 1 }}
                    />
                    <TextInput
                        label={index === 0 ? "Unit" : undefined}
                        placeholder="oz, lb"
                        value={ing.unit || ""}
                        onChange={(e) => updateAt(index, { unit: e.currentTarget.value || null })}
                        style={{ flex: 1 }}
                    />
                    <TextInput
                        label={index === 0 ? "Notes" : undefined}
                        placeholder="optional"
                        value={ing.notes || ""}
                        onChange={(e) => updateAt(index, { notes: e.currentTarget.value || null })}
                        style={{ flex: 2 }}
                    />
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => removeAt(index)}
                        aria-label="Remove ingredient"
                    >
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
            ))}

            <Group justify="flex-start">
                <ActionIcon variant="light" onClick={addRow} aria-label="Add ingredient">
                    <IconPlus size={18} />
                </ActionIcon>
            </Group>
        </Stack>
    );
}
