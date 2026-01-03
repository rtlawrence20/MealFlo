import { useEffect, useMemo, useState } from "react";
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

import { overviewService } from "../services/overview.service.js";

export default function Overview() {
    const [payload, setPayload] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [openRecipeIds, setOpenRecipeIds] = useState(() => new Set());

    const mealGroups = useMemo(() => {
        if (!payload?.mealGroups) return [];
        return Array.isArray(payload.mealGroups) ? payload.mealGroups : [];
    }, [payload]);

    function toggleRecipe(recipeId) {
        setOpenRecipeIds((prev) => {
            const next = new Set(prev);
            if (next.has(recipeId)) next.delete(recipeId);
            else next.add(recipeId);
            return next;
        });
    }

    async function loadToday() {
        setIsLoading(true);
        try {
            const data = await overviewService.today();
            setPayload(data);
        } catch (err) {
            notifications.show({
                title: "Failed to load overview",
                message: err?.message || "Unknown error",
                color: "red",
            });
            setPayload(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadToday();
    }, []);

    if (isLoading) {
        return (
            <Stack gap="md">
                <Title order={2}>Overview</Title>
                <Text c="dimmed">Loading…</Text>
            </Stack>
        );
    }

    if (mealGroups.length === 0) {
        return (
            <Stack gap="md">
                <Title order={2}>Overview</Title>

                <Card withBorder radius="md" p="md">
                    <Text fw={600}>No meals planned for today</Text>
                    <Text size="sm" c="dimmed">
                        Add meals in Planner, then come back here to see today&apos;s cooking plan.
                    </Text>
                </Card>
            </Stack>
        );
    }
    
    return (
        <Stack gap="md">
            <Stack gap={2}>
                <Title order={2}>Overview</Title>
                <Text c="dimmed" size="sm">
                    Today&apos;s plan{payload?.date ? ` (${payload.date})` : ""}.
                </Text>
            </Stack>

            <Stack gap="sm">
                {mealGroups.map((group) => (
                    <Card key={group.id} withBorder radius="md" p="md">
                        <Stack gap="sm">
                            <Group justify="space-between" align="baseline">
                                <Text fw={700}>{group.title}</Text>
                                <Text size="sm" c="dimmed">
                                    {group.recipes?.length || 0} recipe(s)
                                </Text>
                            </Group>

                            <Stack gap="sm">
                                {(group.recipes || []).map((gr) => {
                                    const recipe = gr.recipe || gr;
                                    const recipeId = recipe.id || gr.recipeId || gr.id;
                                    const isOpen = openRecipeIds.has(recipeId);

                                    const instructions = (recipe.instructions || "").trim();
                                    const notes = (recipe.notes || "").trim();
                                    const fallback = instructions || notes;

                                    return (
                                        <Card
                                            key={gr.id || recipeId}
                                            withBorder
                                            radius="md"
                                            p="sm"
                                        >
                                            <Stack gap={6}>
                                                <Group justify="space-between" align="start">
                                                    <Stack gap={2}>
                                                        <Text fw={600}>{recipe.title}</Text>
                                                        <Text size="sm" c="dimmed">
                                                            {recipe.prepMin ? `Prep: ${recipe.prepMin}m` : "Prep: —"}
                                                            {" • "}
                                                            {recipe.cookMin ? `Cook: ${recipe.cookMin}m` : "Cook: —"}
                                                            {" • "}
                                                            {recipe.servings ? `Servings: ${recipe.servings}` : "Servings: —"}
                                                        </Text>
                                                    </Stack>

                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        rightSection={
                                                            isOpen
                                                                ? <IconChevronUp size={14} />
                                                                : <IconChevronDown size={14} />
                                                        }
                                                        onClick={() => toggleRecipe(recipeId)}
                                                    >
                                                        {isOpen ? "Hide" : "Instructions"}
                                                    </Button>
                                                </Group>

                                                <Collapse in={isOpen}>
                                                    <Stack gap={6} pt="xs">
                                                        {!fallback ? (
                                                            <Text size="sm" c="dimmed">
                                                                No instructions provided.
                                                            </Text>
                                                        ) : (
                                                            <>
                                                                {instructions && (
                                                                    <>
                                                                        <Text fw={600} size="sm">
                                                                            Instructions
                                                                        </Text>
                                                                        <Text
                                                                            size="sm"
                                                                            style={{ whiteSpace: "pre-wrap" }}
                                                                        >
                                                                            {instructions}
                                                                        </Text>
                                                                    </>
                                                                )}

                                                                {notes && (
                                                                    <>
                                                                        <Text fw={600} size="sm">
                                                                            Notes
                                                                        </Text>
                                                                        <Text
                                                                            size="sm"
                                                                            style={{ whiteSpace: "pre-wrap" }}
                                                                        >
                                                                            {notes}
                                                                        </Text>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </Stack>
                                                </Collapse>
                                            </Stack>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        </Stack>
                    </Card>
                ))}
            </Stack>
        </Stack>
    );
}
