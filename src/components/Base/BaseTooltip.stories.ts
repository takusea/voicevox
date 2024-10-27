import type { Meta, StoryObj } from "@storybook/vue3";

import { TooltipProvider } from "radix-vue";
import BaseTooltip from "./BaseTooltip.vue";

const meta: Meta<typeof BaseTooltip> = {
  component: BaseTooltip,
};

export default meta;
type Story = StoryObj<typeof BaseTooltip>;

export const Default: Story = {
  args: {
    label: "Default",
  },
  render: (args) => ({
    components: { BaseTooltip, TooltipProvider },
    setup() {
      return { args };
    },
    template: `
    <TooltipProvider>
      <BaseTooltip v-bind="args">
        <span>Hover</span>
      </BaseTooltip>
    </TooltipProvider>`,
  }),
};

export const Disabled: Story = {
  args: {
    label: "Default",
    disabled: true,
  },
  render: (args) => ({
    components: {
      BaseTooltip,
      TooltipProvider,
    },
    setup() {
      return { args };
    },
    template: `
    <TooltipProvider>
      <BaseTooltip v-bind="args">
        <span>Hover</span>
      </BaseTooltip>
    </TooltipProvider>`,
  }),
};