import { Outlet, NavLink } from "react-router-dom";
import { AppShell, Group, Anchor, Text, Container } from "@mantine/core";

const navLinkStyle = ({ isActive }) => ({
    textDecoration: "none",
    fontWeight: isActive ? 700 : 500,
    opacity: isActive ? 1 : 0.8,
});

export default function AppLayout() {
    return (
        <AppShell
            header={{ height: 56 }}
            padding="md"
        >
            <AppShell.Header>
                <Group
                    h="100%"
                    px="md"
                    justify="space-between"
                >
                    <Group gap="xs">
                        <Text fw={800}>MealFlo</Text>
                        <Text size="sm" c="dimmed">MVP</Text>
                    </Group>

                    <Group gap="lg">
                        <Anchor component={NavLink} to="/overview" style={navLinkStyle}>
                            Overview
                        </Anchor>
                        <Anchor component={NavLink} to="/recipes" style={navLinkStyle}>
                            Recipes
                        </Anchor>
                        <Anchor component={NavLink} to="/planner" style={navLinkStyle}>
                            Planner
                        </Anchor>
                        <Anchor component={NavLink} to="/shopping" style={navLinkStyle}>
                            Shopping
                        </Anchor>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                <Container size="lg">
                    <Outlet />
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}
