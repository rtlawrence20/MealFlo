import { useEffect, useState } from "react";
import {
    Button,
    Card,
    Collapse,
    Group,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import { publicRecipesService } from "../services/publicRecipes.service.js";

export default function Community() {
    const [isLoading, setIsLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [openIds, setOpenIds] = useState(() => new Set());
    const [detailsById, setDetailsById] = useState({}); // { [id]: recipeWithIngredients }

    function toggle(id) {
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function load() {
        setIsLoading(true);
        try {
            const data = await publicRecipesService.list();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) {
            notifications.show({
                title: "Failed to load community recipes",
                message: err?.message || "Unknown error",
                color: "red",
            });
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function ensureDetails(recipeId) {
        if (detailsById[recipeId]) return;

        try {
            const detail = await publicRecipesService.getById(recipeId);
            setDetailsById((prev) => ({ ...prev, [recipeId]: detail }));
        } catch (err) {
            notifications.show({
                title: "Failed to load recipe details",
                message: err?.message || "Unknown error",
                color: "red",
            });
        }
    }

    useEffect(() => {
        load();
    }, []);

    if (isLoading) {
        return (
            <Stack gap="md">
                <Title order={2}>Community</Title>
                <Text c="dimmed">Loading…</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Stack gap={2}>
                <Title order={2}>Community</Title>
                <Text size="sm" c="dimmed">
                    Public recipes shared by users. Browse and get inspired.
                </Text>
            </Stack>

            {recipes.length === 0 ? (
                <Card withBorder radius="md" p="md">
                    <Text fw={600}>No public recipes yet</Text>
                    <Text size="sm" c="dimmed">
                        Publish one of your recipes to make it appear here.
                    </Text>
                </Card>
            ) : (
                <Stack gap="sm">
                    {recipes.map((r) => {
                        const isOpen = openIds.has(r.id);
                        const detail = detailsById[r.id];

                        return (
                            <Card key={r.id} withBorder radius="md" p="md">
                                <Group justify="space-between" align="start">
                                    <Stack gap={2}>
                                        <Text fw={700}>{r.title}</Text>
                                        <Text size="sm" c="dimmed">
                                            {r.description || "No description"}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {r.prepMin ? `Prep: ${r.prepMin}m` : "Prep: —"}
                                            {" • "}
                                            {r.cookMin ? `Cook: ${r.cookMin}m` : "Cook: —"}
                                            {" • "}
                                            {r.servings ? `Servings: ${r.servings}` : "Servings: —"}
                                        </Text>
                                    </Stack>

                                    <Button
                                        size="xs"
                                        variant="light"
                                        rightSection={isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                                        onClick={async () => {
                                            if (!isOpen) await ensureDetails(r.id);
                                            toggle(r.id);
                                        }}
                                    >
                                        {isOpen ? "Hide" : "View"}
                                    </Button>
                                </Group>

                                <Collapse in={isOpen}>
                                    <Stack gap="sm" pt="sm">
                                        {!detail ? (
                                            <Text size="sm" c="dimmed">
                                                Loading details…
                                            </Text>
                                        ) : (
                                            <>
                                                <Stack gap={4}>
                                                    <Text fw={600} size="sm">
                                                        Ingredients
                                                    </Text>
                                                    {detail.ingredients?.length ? (
                                                        detail.ingredients.map((ing) => (
                                                            <Text key={ing.id} size="sm">
                                                                • {ing.quantity ?? ""} {ing.unit ?? ""} {ing.name}
                                                                {ing.notes ? ` (${ing.notes})` : ""}
                                                            </Text>
                                                        ))
                                                    ) : (
                                                        <Text size="sm" c="dimmed">
                                                            No ingredients listed.
                                                        </Text>
                                                    )}
                                                </Stack>

                                                <Stack gap={4}>
                                                    <Text fw={600} size="sm">
                                                        Instructions
                                                    </Text>
                                                    {detail.instructions ? (
                                                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                                            {detail.instructions}
                                                        </Text>
                                                    ) : (
                                                        <Text size="sm" c="dimmed">
                                                            No instructions provided.
                                                        </Text>
                                                    )}
                                                </Stack>

                                                {detail.notes ? (
                                                    <Stack gap={4}>
                                                        <Text fw={600} size="sm">
                                                            Notes
                                                        </Text>
                                                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                                            {detail.notes}
                                                        </Text>
                                                    </Stack>
                                                ) : null}
                                            </>
                                        )}
                                    </Stack>
                                </Collapse>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
}
