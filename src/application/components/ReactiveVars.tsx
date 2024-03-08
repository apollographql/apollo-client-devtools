import { useEffect, useState } from "react";
import { getPanelActor } from "../../extension/devtools/panelActor";
import {
  reactiveVarsVar,
  registerReactiveVar,
  updateReactiveVar,
} from "../index";
import { useReactiveVar } from "@apollo/client";
import { JSONTreeViewer } from "./JSONTreeViewer";
import { SidebarLayout } from "./Layouts/SidebarLayout";
import { List } from "./List";
import { ListItem } from "./ListItem";
import { EmptyMessage } from "./EmptyMessage";

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
  const [selected, setSelected] = useState<number | undefined>(vars[0]?.id);

  useEffect(() => {
    panelWindow.send({ type: "getReactiveVars" });

    return panelWindow.on("sendReactiveVars", ({ vars }) => {
      reactiveVarsVar(vars);
    });
  }, []);

  useEffect(subscribeToRegistration, []);
  useEffect(subscribetoUpdates, []);

  const selectedVar = vars.find((rv) => rv.id === selected);

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List className="h-full">
          {vars.map((rv) => {
            return (
              <ListItem
                key={rv.id}
                selected={selectedVar?.id === rv.id}
                onClick={() => setSelected(rv.id)}
                className="font-code h-8 text-sm"
              >
                {rv.displayName || "(anonymous)"}
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <SidebarLayout.Main className="flex flex-col gap-2 !overflow-y-auto !overflow-x-hidden">
        {selectedVar ? (
          <>
            <header>
              <h1 className="font-code font-medium text-2xl text-heading dark:text-heading-dark">
                {selectedVar.displayName || "(anonymous)"}
              </h1>
            </header>
            <div>
              <JSONTreeViewer
                hideRoot
                data={selectedVar.value}
                labelRenderer={(keyPath) =>
                  keyPath.length === 0 ? null : <span>{keyPath[0]}:</span>
                }
              />
            </div>
          </>
        ) : (
          <EmptyMessage className="m-auto mt-20" />
        )}
      </SidebarLayout.Main>
    </SidebarLayout>
  );
}
