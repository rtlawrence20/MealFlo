import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Card,
    Group,
    Modal,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";

import { plannerService } from "../services/planner.service.js";
import { recipesService } from "../services/recipes.service.js";
import { getWeekDays, getWeekStartMonday, toIsoDate } from "../services/date.js";
import MealGroupCard from "../components/MealGroupCard.jsx";

import "@mantine/dates/styles.css";

export default function Planner() {
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [week, setWeek] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [recipes, setRecipes] = useState([]);

    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [newGroupDay, setNewGroupDay] = useState("");
    const [newGroupName, setNewGroupName] = useState("Dinner");

    const [addRecipeOpen, setAddRecipeOpen] = useState(false);
    const [targetGroupId, setTargetGroupId] = useState(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState("");
    const [plannedServings, setPlannedServings] = useState(1);

    const weekStartIso = useMemo(() => {
        const monday = getWeekStartMonday(selectedDate);
        return toIsoDate(monday);
    }, [selectedDate]);

    const weekDays = useMemo(() => getWeekDays(weekStartIso), [weekStartIso]);

    const groupsByDay = useMemo(() => {
        const map = new Map();
        for (const day of weekDays) map.set(day, []);
        const groups = Array.isArray(week?.mealGroups) ? week.mealGroups : [];
        for (const g of groups) {
            if (!map.has(g.day)) map.set(g.day, []);
            map.get(g.day).push(g);
        }
        for (const [day, list] of map.entries()) {
            list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            map.set(day, list);
        }
        return map;
    }, [week, weekDays]);

    async function loadRecipes() {
        try {
            const data = await recipesService.list();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) {
            notifications.show({
                title: "Failed to load recipes",
                message: err?.message || "Unknown error",
                color: "red",
            });
        }
    }

    async function loadOrCreateWeek() {
        setIsLoading(true);
        try {
            const data = await plannerService.createOrGetWeek({ weekStart: weekStartIso });
            setWeek(data);
        } catch (err) {
            notifications.show({
                title: "Failed to load week",
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

    useEffect(() => {
        loadOrCreateWeek();
        setNewGroupDay(weekStartIso);
    }, [weekStartIso]);

    function openCreateGroup(dayIso) {
        setNewGroupDay(dayIso);
        setNewGroupName("Dinner");
        setCreateGroupOpen(true);
    }

    async function handleCreateGroup() {
        if (!week?.id) return;
        if (!newGroupDay || !newGroupName.trim()) return;

        try {
            await plannerService.createMealGroup({
                weekId: week.id,
                day: newGroupDay,
                name: newGroupName.trim(),
                sortOrder: 0,
            });
            notifications.show({
                title: "Meal group created",
                message: "You can now add recipes to it.",
            });
            setCreateGroupOpen(false);
            await loadOrCreateWeek();
        } catch (err) {
            notifications.show({
                title: "Create failed",
                message: err?.message || "Unknown error",
                color: "red",
            });
        }
    }

    async function handleDeleteGroup(groupId) {
        const ok = window.confirm("Delete this meal group? This cannot be undone.");
        if (!ok) return;

        try {
            await plannerService.deleteMealGroup(groupId);
            notifications.show({
                title: "Meal group deleted",
                message: "Group removed.",
            });
            await loadOrCreateWeek();
        } catch (err) {
            notifications.show({
                title: "Delete failed",
                message: err?.message || "Unknown error",
                color: "red",
            });
        }
    }

    function openAddRecipe(groupId) {
        setTargetGroupId(groupId);
        setSelectedRecipeId("");
        setPlannedServings(1);
        setAddRecipeOpen(true);
    }

    async function handleAddRecipe() {
        if (!targetGroupId) return;
        if (!selectedRecipeId) return;

        try {
            await plannerService.addRecipeToGroup(targetGroupId, {
                recipeId: Number(selectedRecipeId),
                plannedServings: plannedServings || 1,
            });
            notifications.show({
                title: "Recipe added",
                message: "Added to meal group.",
            });
            setAddRecipeOpen(false);
            await loadOrCreateWeek();
        } catch (err) {
            notifications.show({
                title: "Add failed",
                message: err?.message || "Unknown error",
                color: "red",
            });
        }
    }

    const recipeOptions = useMemo(
        () =>
            recipes.map((r) => ({
                value: String(r.id),
                label: r.title,
            })),
        [recipes]
    );

    return (
        <Stack gap="md">
            <Group justify="space-between" align="end">
                <Stack gap={0}>
                    <Title order={2}>Planner</Title>
                    <Text c="dimmed" size="sm">
                        Select a week, create meal groups per day, then add recipes (max 5 per group).
                    </Text>
                </Stack>

                <DateInput
                    label="Week of"
                    value={selectedDate}
                    onChange={(d) => setSelectedDate(d || new Date())}
                    valueFormat="MMM D, YYYY"
                    maw={220}
                />
            </Group>

            {isLoading ? (
                <Text c="dimmed">Loading week…</Text>
            ) : (
                <SimpleGrid cols={2} spacing="md">
                    {weekDays.map((dayIso) => {
                        const groups = groupsByDay.get(dayIso) || [];
                        return (
                            <Card key={dayIso} withBorder radius="md" p="md">
                                <Group justify="space-between" align="start">
                                    <Stack gap={2}>
                                        <Text fw={700}>{dayIso}</Text>
                                        <Text size="xs" c="dimmed">
                                            {groups.length} group{groups.length === 1 ? "" : "s"}
                                        </Text>
                                    </Stack>

                                    <Button
                                        size="xs"
                                        variant="light"
                                        leftSection={<IconPlus size={14} />}
                                        onClick={() => openCreateGroup(dayIso)}
                                    >
                                        Group
                                    </Button>
                                </Group>

                                <Stack gap="sm" mt="sm">
                                    {groups.length === 0 ? (
                                        <Text size="sm" c="dimmed">
                                            No meal groups for this day.
                                        </Text>
                                    ) : (
                                        groups.map((g) => (
                                            <MealGroupCard
                                                key={g.id}
                                                group={g}
                                                onAddRecipe={openAddRecipe}
                                                onDeleteGroup={handleDeleteGroup}
                                            />
                                        ))
                                    )}
                                </Stack>
                            </Card>
                        );
                    })}
                </SimpleGrid>
            )}

            <Modal
                opened={createGroupOpen}
                onClose={() => setCreateGroupOpen(false)}
                title="Create meal group"
                centered
            >
                <Stack gap="md">
                    <Select
                        label="Day"
                        data={weekDays.map((d) => ({ value: d, label: d }))}
                        value={newGroupDay}
                        onChange={(v) => setNewGroupDay(v || "")}
                    />
                    <TextInput
                        label="Name"
                        placeholder="Breakfast, Lunch, Dinner…"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.currentTarget.value)}
                    />
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={() => setCreateGroupOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateGroup} disabled={!newGroupDay || !newGroupName.trim()}>
                            Create
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal
                opened={addRecipeOpen}
                onClose={() => setAddRecipeOpen(false)}
                title="Add recipe to group"
                centered
            >
                <Stack gap="md">
                    <Select
                        label="Recipe"
                        placeholder={recipeOptions.length ? "Select a recipe" : "Create a recipe first"}
                        data={recipeOptions}
                        value={selectedRecipeId}
                        onChange={(v) => setSelectedRecipeId(v || "")}
                        searchable
                        nothingFoundMessage="No matches"
                    />

                    <TextInput
                        label="Planned servings"
                        type="number"
                        min={1}
                        value={plannedServings}
                        onChange={(e) => setPlannedServings(Number(e.currentTarget.value || 1))}
                    />

                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={() => setAddRecipeOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddRecipe} disabled={!selectedRecipeId}>
                            Add
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}
