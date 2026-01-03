import { useEffect, useMemo, useState } from "react";
import {
    Card,
    Group,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";

import { plannerService } from "../services/planner.service.js";
import { shoppingService } from "../services/shopping.service.js";
import { getWeekStartMonday, toIsoDate } from "../services/date.js";

import "@mantine/dates/styles.css";

export default function ShoppingList() {
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [week, setWeek] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const weekStartIso = useMemo(() => {
        const monday = getWeekStartMonday(selectedDate);
        return toIsoDate(monday);
    }, [selectedDate]);

    async function loadWeekAndList() {
        setIsLoading(true);
        try {
            const w = await plannerService.createOrGetWeek({
                weekStart: weekStartIso,
            });
            setWeek(w);

            const res = await shoppingService.getForWeek(w.id);
            setItems(Array.isArray(res.items) ? res.items : []);
        } catch (err) {
            notifications.show({
                title: "Failed to load shopping list",
                message: err?.message || "Unknown error",
                color: "red",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadWeekAndList();
    }, [weekStartIso]);

    return (
        <Stack gap="md">
            <Group justify="space-between" align="end">
                <Stack gap={0}>
                    <Title order={2}>Shopping List</Title>
                    <Text c="dimmed" size="sm">
                        Aggregated ingredients for the selected week.
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
                <Text c="dimmed">Loading…</Text>
            ) : items.length === 0 ? (
                <Card withBorder radius="md" p="md">
                    <Text c="dimmed">
                        No items yet. Add recipes to your planner to generate a shopping list.
                    </Text>
                </Card>
            ) : (
                <Card withBorder radius="md" p="md">
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Ingredient</Table.Th>
                                <Table.Th ta="right">Quantity</Table.Th>
                                <Table.Th>Unit</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {items.map((item, idx) => (
                                <Table.Tr key={`${item.name}-${idx}`}>
                                    <Table.Td>{item.name}</Table.Td>
                                    <Table.Td ta="right">{item.quantity}</Table.Td>
                                    <Table.Td>{item.unit || ""}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>
            )}
        </Stack>
    );
}
