<template>
    <div>
        <textarea
            class="textarea"
            type="text"
            :disabled="disabled"
            v-model="text"
            cols="30"
            rows="10"
        />

        <Command.Dialog
            :visible="true"
            theme="linear"
            class="palette"
        >
            <template #header>
                <div command-linear-badge="">
                    Issue - FUN-343
                </div>
                <Command.Input placeholder="Type a command or search..." />
            </template>
            <template #body>
                <!-- <Command.Loading> Hang on... </Command.Loading> -->
                <Command.List>
                    <Command.Empty>No results found.</Command.Empty>
                    <Command.Item
                        v-for="item in currentItems"
                        :key="item.label"
                        :data-value="item.label"
                        :shortcut="item.shortcut"
                        :perform="item.perform"
                        @select="handleSelectItem(item)"
                    >
                        <component :is="item.icon" />
                        <div>{{ item.label }}</div>
                        <div command-linear-shortcuts>
                            <kbd
                                v-for="key in item.shortcut"
                                :key="key"
                            >{{ key }}</kbd>
                        </div>
                    </Command.Item>
                </Command.List>
            </template>
        </Command.Dialog>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, useTemplateRef, onMounted } from "vue";
import { Command } from 'vue-command-palette'
import { streamText } from "ai"
import { createMistral } from "@ai-sdk/mistral"
import '../scss/linear.scss';

const palette = useTemplateRef("palette");

const mistral = createMistral({
    apiKey: 'tRv8hP3lDmGJhDPRmpEV6WcH28rJeK3U'
});

const text = ref('');
const disabled = ref(false);

onMounted(async () => {
    const clipboardContents = await navigator.clipboard.read();
    for (const item of clipboardContents) {
        console.log('item', item)
        if (item.types.includes("text/plain")) {
            const data = await item.getType("text/plain");
            console.log('data', data)
            text.value = await data.text()
        }
    }
})

const process = async (request: string) => {
    disabled.value = true
    const { textStream } = streamText({
        model: mistral("mistral-large-latest"),
        messages: [
            {
                role: 'system',
                content: 'When providing an answer, please, be sure to only provide the answer, no other text should be included.'
            },
            {
                role: 'system',
                content: request
            },
            {
                role: 'user',
                content: text.value
            }
        ]
    })
    text.value = ''
    for await (const textPart of textStream) {
        text.value += textPart
    }
    disabled.value = false
}

const selectedItem = ref();
const items = [
    {
        label: 'Change tone...',
        shortcut: ['T'],
        children: [
            {
                label: 'Formal',
                shortcut: ['F'],
                perform: async () => {
                    await process('Act as a copywriter. Your goal is to convert a casual text into a formal one.')
                },
            },
            {
                label: 'Informal',
                shortcut: ['I'],
                perform: async () => {
                    await process('Act as a copywriter. Your goal is to convert a casual text into a informal one.')
                },
            },
        ],
    },
    {
        label: 'Translate text...',
        shortcut: ['R'],
        children: [
            {
                label: 'French',
                shortcut: ['F'],
                perform: async () => {
                    await process('Act as a translator. Your goal is to convert a text into French.')
                },
            },
            {
                label: 'English',
                shortcut: ['E'],
                perform: async () => {
                    await process('Act as a translator. Your goal is to convert a text into English.')
                },
            },
        ],
    },
    {
        label: 'Improve text',
        shortcut: ['M'],
        perform: async () => {
            await process('Act as a copywriter. Your goal is to improve the given text')
        },
    },
    {
        label: 'Rewrite text',
        shortcut: ['W'],
        perform: async () => {
            await process('Act as a copywriter. Your goal is to rewrite the given text')
        },
    },
    {
        label: 'Fix mistakes',
        shortcut: ['W'],
        perform: async () => {
            await process('Act as a copywriter. Your goal is to fix the mistakes in the given text')
        },
    },
    {
        label: 'Summarize text',
        shortcut: ['S'],
        perform: async () => {
            await process('Act as a copywriter. Your goal is to summarize the given text')
        },
    }
]

const currentItems = computed(() => {
    if (selectedItem.value) {
        return selectedItem.value.children;
    }
    return items;
});

const handleSelectItem = async (item: any) => {
    console.log('item', item)
    if (item.children) {
        selectedItem.value = item;
    } else {
        selectedItem.value = undefined;
    }
    if (item.perform) {
        await item.perform();
    }
}
</script>

<style lang="scss" scoped>
:deep(.palette) {
    width: 100%;
}

.textarea {
    width: 100%;
}
</style>
