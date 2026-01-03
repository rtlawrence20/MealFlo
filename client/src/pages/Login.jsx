import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, signup } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const redirectTo = useMemo(() => {
        return location.state?.from || "/overview";
    }, [location.state]);

    const canSubmit = username.trim().length > 0 && password.length > 0;

    async function handle(fn) {
        if (!canSubmit || busy) return;

        setBusy(true);
        try {
            await fn(username.trim(), password);
            navigate(redirectTo, { replace: true });
        } catch (e) {
            notifications.show({
                title: "Authentication failed",
                message: e?.message || "Invalid credentials",
                color: "red",
            });
        } finally {
            setBusy(false);
        }
    }

    return (
        <Stack gap="lg" maw={460} mx="auto" mt="xl" px="md">
            <Stack gap={2}>
                <Title order={2}>MealFlo</Title>
                <Text c="dimmed" size="sm">
                    Log in to manage recipes, plan meals, and generate a shopping list.
                </Text>
            </Stack>

            <Card withBorder radius="md" p="md">
                <Stack gap="md">
                    <TextInput
                        label="Username"
                        placeholder="demo"
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        autoComplete="username"
                    />
                    <TextInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        autoComplete="current-password"
                    />

                    <Group justify="space-between">
                        <Button variant="light" loading={busy} onClick={() => handle(signup)} disabled={!canSubmit}>
                            Create account
                        </Button>
                        <Button loading={busy} onClick={() => handle(login)} disabled={!canSubmit}>
                            Log in
                        </Button>
                    </Group>
                </Stack>
            </Card>
        </Stack>
    );
}
