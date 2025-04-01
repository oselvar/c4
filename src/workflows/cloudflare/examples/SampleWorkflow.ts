import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "@oselvar/noflare";

export class SampleWorkflow extends WorkflowEntrypoint<unknown, unknown> {
  async run(event: WorkflowEvent<unknown>, step: WorkflowStep) {
    await step.do("Step-X", async () => {});

    const c1 = false;
    if (c1) {
      await step.do("step-a", async () => {});
    } else {
      await step.do("step-b", async () => {});
      await step.do("step-c", async () => {});
    }

    await step.do("Step-Y", async () => {});

    const c2 = false;
    if (c2) {
      // Do stuff in parallel
      await Promise.all(
        [1, 2, 3].map(async () => {
          await step.do("parallel-p", async () => {});
          await step.do("parallel-q", async () => {});
        }),
      );
    }

    await step.do("step-Z", async () => {});

    const items = [1, 2, 3];
    // Process all items
    for (const item of items) {
      console.log(item);
      await step.do("step-serial-s", async () => {
        const widgets = [1, 2, 3];
        for (const widget of widgets) {
          console.log(widget);
        }

        const ignoredCondition = true;
        if (ignoredCondition) {
          return 1;
        } else {
          return 2;
        }
      });
    }
  }
}
