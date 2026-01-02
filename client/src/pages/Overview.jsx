import { Stack, Title, Text, Paper } from "@mantine/core";

export default function Overview() {
    return (
        <Stack gap="md">
            <Title order={2}>Overview</Title>
            <Text c="dimmed">
                This is the MVP navigation shell.
            </Text>

            <Paper withBorder p="md" radius="md">
                <Text fw={600}>TODO</Text>
                <Text size="sm" c="dimmed">
                    Add API services, build Recipes UI, Planner, Shopping List.
                </Text>
            </Paper>
        </Stack>
    );
}
