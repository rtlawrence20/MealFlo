import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { http } from "../services/http.js";

/**
 * @param {{
 *   opened: boolean,
 *   onClose: () => void,
 *   onImported: () => Promise<void>
 * }} props
 */
export default function CsvImportModal({ opened, onClose, onImported }) {
    const [csvText, setCsvText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleImport() {
        if (!csvText.trim()) return;

        setIsSaving(true);
        try {
            const res = await http.post("/recipes/from-csv", { csvText });
            notifications.show({
                title: "Import complete",
                message: `Created ${res.createdCount || 0} recipe(s).`,
            });
            setCsvText("");
            onClose();
            await onImported();
        } catch (err) {
            notifications.show({
                title: "Import failed",
                message: err?.message || "Unknown error",
                color: "red",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Import recipes from CSV" centered size="lg">
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    Header columns supported: title, description, servings, ingredient_name (or ingredient), quantity, unit, notes.
                    Rows with the same title are grouped into one recipe.
                </Text>

                <Textarea
                    label="CSV text"
                    placeholder="Paste CSV here..."
                    value={csvText}
                    onChange={(e) => setCsvText(e.currentTarget.value)}
                    autosize
                    minRows={8}
                />

                <Group justify="flex-end">
                    <Button variant="subtle" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} loading={isSaving} disabled={!csvText.trim()}>
                        Import
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
