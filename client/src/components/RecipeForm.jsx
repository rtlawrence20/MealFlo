import { Button, Group, NumberInput, Stack, Textarea, TextInput } from "@mantine/core";
import { useMemo, useState } from "react";
import IngredientEditor from "./IngredientEditor.jsx";

/**
 * @typedef {import("../services/recipes.service.js").RecipeCreatePayload} RecipeCreatePayload
 */

/**
 * @param {{
 *   initialValue?: Partial<RecipeCreatePayload>,
 *   submitLabel?: string,
 *   onSubmit: (payload: RecipeCreatePayload) => Promise<void>,
 *   onCancel: () => void
 * }} props
 */
export default function RecipeForm({
    initialValue,
    submitLabel,
    onSubmit,
    onCancel,
}) {
    const [title, setTitle] = useState(initialValue?.title || "");
    const [description, setDescription] = useState(initialValue?.description || "");
    const [servings, setServings] = useState(initialValue?.servings ?? 1);
    const [ingredients, setIngredients] = useState(initialValue?.ingredients || []);
    const [isSaving, setIsSaving] = useState(false);

    const canSubmit = useMemo(() => title.trim().length > 0, [title]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit || isSaving) return;

        setIsSaving(true);
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim() ? description.trim() : null,
                servings: servings || 1,
                ingredients: (ingredients || [])
                    .filter((i) => (i.name || "").trim().length > 0)
                    .map((i, idx) => ({
                        ...i,
                        name: (i.name || "").trim(),
                        unit: i.unit ? String(i.unit).trim() : null,
                        notes: i.notes ? String(i.notes).trim() : null,
                        sortOrder: idx,
                    })),
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md">
                <TextInput
                    label="Title"
                    placeholder="e.g., Spaghetti"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    required
                />

                <Group grow>
                    <NumberInput
                        label="Servings"
                        min={1}
                        value={servings}
                        onChange={(val) => setServings(val || 1)}
                    />
                </Group>

                <Textarea
                    label="Description"
                    placeholder="Optional notes"
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    autosize
                    minRows={2}
                />

                <IngredientEditor value={ingredients} onChange={setIngredients} />

                <Group justify="flex-end">
                    <Button variant="subtle" onClick={onCancel} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!canSubmit} loading={isSaving}>
                        {submitLabel || "Save"}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
