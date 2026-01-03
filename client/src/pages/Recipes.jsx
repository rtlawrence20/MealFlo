import { useEffect, useMemo, useState } from "react";
import {
    ActionIcon,
    Button,
    Card,
    Group,
    Modal,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import { recipesService } from "../services/recipes.service.js";
import RecipeForm from "../components/RecipeForm.jsx";
import CsvImportModal from "../components/CsvImportModal.jsx";

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return recipes;
        return recipes.filter((r) => (r.title || "").toLowerCase().includes(q));
    }, [recipes, query]);

    async function loadRecipes() {
        setIsLoading(true);
        try {
            const data = await recipesService.list();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) {
            notifications.show({
                title: "Failed to load recipes",
                message: err?.message || "Unknown error",
                color: "red",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadRecipes();
    }, []);

    async function handleCreate(payload) {
        try {
            await recipesService.create(payload);
            notifications.show({
                title: "Recipe created",
                message: "Your recipe is ready to use in the planner.",
            });
            setCreateOpen(false);
            await loadRecipes();
        } catch (err) {
            notifications.show({
                title: "Create failed",
                message: err?.message || "Unknown error",
                color: "red",
            });
        }
    }

    async function handleDelete(recipeId) {
        const ok = window.confirm("Delete this recipe? This cannot be undone.");
        if (!ok) return;

        try {
            await recipesService.remove(recipeId);
            notifications.show({
                title: "Recipe deleted",
                message: "The recipe was removed.",
            });
            setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
        } catch (err) {
            notifications.show({
                title: "Delete failed",
                message: err?.message || "Unknown error",
                color: "red",
            });
        }
    }

    return (
        <Stack gap="md">
            <Group justify="space-between" align="end">
                <Stack gap={0}>
                    <Title order={2}>Recipes</Title>
                    <Text c="dimmed" size="sm">
                        Create recipes and ingredients, then use them in your weekly planner.
                    </Text>
                </Stack>

                <Group gap="sm">
                    <Button variant="light" onClick={() => setImportOpen(true)}>
                        Import CSV
                    </Button>
                    <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
                        New Recipe
                    </Button>
                </Group>
            </Group>

            <TextInput
                placeholder="Search recipes..."
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
            />

            {isLoading ? (
                <Text c="dimmed">Loading…</Text>
            ) : filtered.length === 0 ? (
                <Text c="dimmed">No recipes yet.</Text>
            ) : (
                <Stack gap="sm">
                    {filtered.map((r) => (
                        <Card key={r.id} withBorder radius="md" p="md">
                            <Group justify="space-between" align="start">
                                <Stack gap={4}>
                                    <Text fw={700}>{r.title}</Text>
                                    <Text size="sm" c="dimmed">
                                        Servings: {r.servings}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        Prep: {r.prepMin ? `${r.prepMin}m` : "—"} • Cook: {r.cookMin ? `${r.cookMin}m` : "—"}
                                    </Text>

                                    {r.instructions ? (
                                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                            <Text span fw={600}>Instructions: </Text>
                                            {r.instructions}
                                        </Text>
                                    ) : null}

                                    {r.notes ? (
                                        <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                                            <Text span fw={600}>Notes: </Text>
                                            {r.notes}
                                        </Text>
                                    ) : null}
                                </Stack>

                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={() => handleDelete(r.id)}
                                    aria-label="Delete recipe"
                                >
                                    <IconTrash size={18} />
                                </ActionIcon>
                            </Group>
                        </Card>
                    ))}
                </Stack>
            )}

            <Modal
                opened={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create Recipe"
                centered
                size="lg"
            >
                <RecipeForm
                    submitLabel="Create"
                    onSubmit={handleCreate}
                    onCancel={() => setCreateOpen(false)}
                />
            </Modal>

            <CsvImportModal
                opened={importOpen}
                onClose={() => setImportOpen(false)}
                onImported={loadRecipes}
            />
        </Stack>
    );
}
