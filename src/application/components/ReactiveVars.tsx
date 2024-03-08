import { useEffect } from "react";
import { getPanelActor } from "../../extension/devtools/panelActor";
import {
  reactiveVarsVar,
  registerReactiveVar,
  updateReactiveVar,
} from "../index";
import { useReactiveVar } from "@apollo/client";

const panelWindow = getPanelActor(window);

function subscribeToRegistration() {
  return panelWindow.on("reactiveVar.register", ({ payload }) =>
    registerReactiveVar(payload)
  );
}

function subscribetoUpdates() {
  return panelWindow.on("reactiveVar.update", ({ payload }) =>
    updateReactiveVar(payload.id, payload.value)
  );
}

export function ReactiveVars() {
  const vars = useReactiveVar(reactiveVarsVar);

  useEffect(() => {
    panelWindow.send({ type: "getReactiveVars" });

    return panelWindow.on("sendReactiveVars", ({ vars }) => {
      reactiveVarsVar(vars);
    });
  }, []);

  useEffect(subscribeToRegistration, []);
  useEffect(subscribetoUpdates, []);

  return <div>Reactive vars {vars.length}</div>;
}
