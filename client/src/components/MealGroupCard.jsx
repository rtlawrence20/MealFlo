import { ActionIcon, Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

/**
 * @param {{
 *   group: any,
 *   onAddRecipe: (groupId: number) => void,
 *   onDeleteGroup: (groupId: number) => void
 * }} props
 */
export default function MealGroupCard({ group, onAddRecipe, onDeleteGroup }) {
    const recipes = Array.isArray(group.recipes) ? group.recipes : [];

    return (
        <Card withBorder radius="md" p="sm">
            <Group justify="space-between" align="start">
                <Stack gap={2}>
                    <Text fw={700}>{group.name}</Text>
                    <Text size="xs" c="dimmed">
                        {recipes.length}/5 recipes
                    </Text>
                </Stack>

                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => onDeleteGroup(group.id)}
                        aria-label="Delete meal group"
                    >
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
            </Group>

            <Stack gap="xs" mt="sm">
                {recipes.length === 0 ? (
                    <Text size="sm" c="dimmed">
                        No recipes yet.
                    </Text>
                ) : (
                    recipes.map((gr) => (
                        <Group key={gr.id} justify="space-between">
                            <Text size="sm">
                                {gr.recipe?.title || `Recipe #${gr.recipeId}`}
                            </Text>
                            <Badge variant="light">
                                {gr.plannedServings} servings
                            </Badge>
                        </Group>
                    ))
                )}

                <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => onAddRecipe(group.id)}
                >
                    Add recipe
                </Button>
            </Stack>
        </Card>
    );
}
