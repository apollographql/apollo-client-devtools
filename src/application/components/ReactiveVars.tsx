import { reactiveVarsVar } from "../index";
import { useReactiveVar } from "@apollo/client";

export function ReactiveVars() {
  const vars = useReactiveVar(reactiveVarsVar);

  return <div>Reactive vars {vars.length}</div>;
}
