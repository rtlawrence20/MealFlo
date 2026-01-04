import { Outlet, NavLink } from "react-router-dom";
import { Button, AppShell, Group, Anchor, Text, Container } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";


const navLinkStyle = ({ isActive }) => ({
    textDecoration: "none",
    fontWeight: isActive ? 700 : 500,
    opacity: isActive ? 1 : 0.8,
});

export default function AppLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

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
                        <Anchor component={NavLink} to="/community" style={navLinkStyle}>
                            Community
                        </Anchor>
                    </Group>

                    <Group gap="sm">
                        <Text size="sm" c="dimmed">
                            {user?.username}
                        </Text>
                        <Button
                            size="xs"
                            variant="light"
                            onClick={async () => {
                                await logout();
                                navigate("/login", { replace: true });
                            }}
                        >
                            Logout
                        </Button>
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
