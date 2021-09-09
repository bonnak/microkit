type CallbackFn = () => unknown
type Step = {
  step: number
  invokeCommand: CallbackFn
  withCompensation?: CallbackFn
}

export class Orchestrator {
  private steps: Step[] = []

  makeStep(invokeCommand: CallbackFn, withCompensation?: CallbackFn) {
    this.steps.push({
      step: this.steps.length + 1,
      invokeCommand,
      withCompensation,
    })

    return this
  }

  // async build() {
  //   await db.bulkCreateCommands(
  //     this.steps.map(step => ({
  //       commandName: step.invokeCommand.name,
  //       commandPayload: step.invokeCommand.arguments,
  //       ...(step.withCompensation && {
  //         compensationName: step.withCompensation.name,
  //         compensationPayload: step.withCompensation.arguments,
  //       }),
  //       step: step.step
  //     }))
  //   )
  // }
}
