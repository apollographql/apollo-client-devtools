import type { AnyActorRef, ActorLogic, Snapshot } from "xstate";

type Event = { type: "cancel" };
type PrivateEvent = Event | { type: "done" } | { type: "xstate.stop" };

const timeouts = new WeakMap<AnyActorRef, NodeJS.Timeout>();

function cancelTimeout(actorRef: AnyActorRef) {
  clearTimeout(timeouts.get(actorRef));
  timeouts.delete(actorRef);
}

export const timeoutLogic: ActorLogic<
  Snapshot<undefined> & { input: number },
  Event,
  number
> = {
  transition: (state, event, { self }) => {
    if (state.status !== "active") {
      return state;
    }

    switch (event.type as PrivateEvent["type"]) {
      case "cancel":
      case "xstate.stop": {
        cancelTimeout(self);

        return {
          ...state,
          status: "stopped",
        };
      }
      case "done": {
        timeouts.delete(self);

        return { ...state, error: undefined, status: "done" };
      }
      default:
        return state;
    }
  },
  start: (state, { self }) => {
    const timeoutId = setTimeout(() => {
      if (self.getSnapshot().status !== "active") {
        return;
      }

      self.send({ type: "done" } as unknown as Event);
    }, state.input);

    timeouts.set(self, timeoutId);
  },
  getInitialSnapshot: (_, input) => ({
    status: "active",
    output: undefined,
    error: undefined,
    context: undefined,
    input,
  }),
  getPersistedSnapshot: (snapshot) => snapshot,
};
