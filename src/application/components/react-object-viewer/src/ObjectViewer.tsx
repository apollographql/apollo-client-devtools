import type { ReactNode } from "react";
import {
  useEffect,
  useState,
  useContext,
  createContext,
  Fragment,
  useMemo,
} from "react";
import {
  clsx,
  getConstructorName,
  getIterateDescriptors,
  getType,
} from "./utils";
import {
  IconArray,
  IconBoolean,
  IconEllipsis,
  IconFunction,
  IconNull,
  IconNumber,
  IconObject,
  IconString,
  IconSymbol,
  IconUndefined,
} from "./icon";
import { Tree, TreeItem } from "./Tree";

export enum Sort {
  DEFAULT = 0,
  DESC = 1,
  ASC = 2,
}

type Type = ReturnType<typeof getType>;

export type RenderValueFn = (
  type: Type,
  descriptor: TypedPropertyDescriptor<any>,
  o: {
    level: number;
    expand: boolean;
    canExpand: boolean;
    loadGetter: () => any;
    setExpand: (expand: boolean) => void;
    getValueString: typeof getValueString;
    DefaultRenderValue: typeof RenderItemValue;
  }
) => ReactNode;

interface CtxType {
  showLine: boolean;
  showLevel: number;
  showItems: number;
  showInlineMax: number;
  showIcon: boolean;
  hideNonEnumerability: boolean;
  sort: Sort;
  canClickLabelExtend?: boolean;
  renderValue?: RenderValueFn;
  renderTypeIcon?: (
    type: Type,
    descriptor: TypedPropertyDescriptor<any>,
    level: number,
    DefaultIcon: typeof RenderTypeIcon
  ) => ReactNode;
}

const Ctx = createContext<CtxType>({
  showLine: true,
  showLevel: 0,
  showItems: 20,
  showInlineMax: 5,
  showIcon: false,
  hideNonEnumerability: false,
  sort: Sort.DEFAULT,
});

const useOption = () => {
  return useContext(Ctx);
};

function getValueString({
  type,
  descriptor,
}: {
  type: Type;
  descriptor: TypedPropertyDescriptor<any>;
}): string {
  const value = descriptor.value;
  if (type === "object") {
    if (value instanceof Date) return value.toISOString();
    if (value instanceof RegExp) return value.toString();
    if (value instanceof Set) return `Set(${value.size})`;
    if (value instanceof ArrayBuffer) return `ArrayBuffer(${value.byteLength})`;
    return getConstructorName(value);
  }
  if (type === "array") return `Array(${value.length})`;
  if (type === "string") return JSON.stringify(value);
  if (type === "number") return String(value);
  if (type === "bigint") return `${String(value)}n`;
  if (type === "boolean") return String(value);
  if (type === "null") return "null";
  if (type === "undefined") {
    if (descriptor.get) return "(...)";
    if (descriptor.set) return "ƒ setter(v)";
    return "undefined";
  }
  if (type === "symbol") return value.toString();
  if (type === "function") return `${value}`;
  return String(value);
}

function RenderTypeIcon({
  type,
}: {
  type: Type;
  descriptor: TypedPropertyDescriptor<any>;
}) {
  if (type === "object") return <IconObject />;
  if (type === "array") return <IconArray />;
  if (type === "string") return <IconString />;
  if (type === "number" || type === "bigint") return <IconNumber />;
  if (type === "boolean") return <IconBoolean />;
  if (type === "null") return <IconNull />;
  if (type === "undefined") return <IconUndefined />;
  if (type === "symbol") return <IconSymbol />;
  if (type === "function") return <IconFunction />;
  return null;
}

function RenderArrayInline(props: {
  type: Type;
  descriptor: TypedPropertyDescriptor<any>;
}) {
  const opts = useOption();
  const value = props.descriptor.value;
  const max = opts.showInlineMax;
  const showLen = Math.min(max, value.length);

  return (
    <div className="object-inline">
      <span className="type-system">{"("}</span>
      {value.length}
      <span className="type-system">{")"}</span>
      <span className="type-system is-italic">{"["}</span>
      <div className="object-inline-items">
        {value.slice(0, max).map((e: any, i: number) => {
          const t = getType(e);
          return (
            <Fragment key={i}>
              <span className={"type-" + t + " is-italic"}>
                {getValueString({
                  type: t,
                  descriptor: { value: e, enumerable: true },
                })}
              </span>
              {i < showLen - 1 ? (
                <span className="type-system is-italic">,&nbsp;</span>
              ) : (
                value.length > showLen && (
                  <span className="type-system is-italic">,&nbsp;…</span>
                )
              )}
            </Fragment>
          );
        })}
      </div>
      <span className="type-system is-italic">{"]"}</span>
    </div>
  );
}

function RenderObjectInline(props: {
  type: Type;
  descriptor: TypedPropertyDescriptor<any>;
}) {
  const opts = useOption();
  const value = props.descriptor.value;
  const max = opts.showInlineMax;
  const keys = Object.keys(value);
  const showLen = Math.min(keys.length, max);
  const propertys = [];
  for (let i = 0; i < showLen; i++) {
    const k = keys[i];
    let t: Type;
    try {
      t = getType(value[k]);
    } catch (err) {
      continue;
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, k);
    if (!descriptor) continue;
    propertys.push(
      <Fragment key={i}>
        <span className={clsx(["type-property is-italic"])}>{k}</span>
        <span className="type-system is-italic">:&nbsp;</span>
        <span className={"type-" + t + " is-italic"}>
          {getValueString({
            type: t,
            descriptor: { value: value[k], enumerable: descriptor.enumerable },
          })}
        </span>
        {i < showLen - 1 ? (
          <span className="type-system is-italic">,&nbsp;</span>
        ) : (
          keys.length > showLen && (
            <span className="type-system is-italic">,&nbsp;…</span>
          )
        )}
      </Fragment>
    );
  }
  return (
    <div className="object-inline">
      {value.constructor === Object ? null : (
        <span className="is-italic">{getConstructorName(value)}&nbsp;</span>
      )}
      <span className="type-system is-italic">{"{"}</span>
      <div className="object-inline-items">{propertys}</div>
      <span className="type-system is-italic">{"}"}</span>
    </div>
  );
}

function RenderItemValue(props: {
  type: Type;
  descriptor: TypedPropertyDescriptor<any>;
  loadGetter: () => void;
}) {
  const value = props.descriptor.value;

  if (props.type === "array") {
    return (
      <RenderArrayInline type={props.type} descriptor={props.descriptor} />
    );
  }

  if (
    props.type === "object" &&
    !(value instanceof Date) &&
    !(value instanceof RegExp) &&
    !(value instanceof Set) &&
    !(value instanceof ArrayBuffer)
  ) {
    return (
      <RenderObjectInline type={props.type} descriptor={props.descriptor} />
    );
  }

  return (
    <span
      className={"type-value type-" + props.type}
      onClick={props.loadGetter}
    >
      {getValueString({ type: props.type, descriptor: props.descriptor })}
    </span>
  );
}

function RenderItemPropertys(props: {
  level: number;
  object: object;
  top: any;
}) {
  const opts = useOption();
  const [maxShow, setMaxShow] = useState(opts.showItems);
  const descriptors = useMemo(() => {
    return getIterateDescriptors(props.object);
  }, [props.object]);

  let filterDescriptors = descriptors.filter((e) => {
    return opts.hideNonEnumerability ? e.descriptor.enumerable : true;
  });
  if (opts.sort) {
    filterDescriptors = filterDescriptors.sort((a, b) => {
      return opts.sort === 1
        ? a.key < b.key
          ? 1
          : -1
        : a.key > b.key
          ? 1
          : -1;
    });
  }
  const showDescriptors = filterDescriptors.filter((_, i) => {
    return i < maxShow;
  });
  const hasMore = showDescriptors.length < filterDescriptors.length;

  return (
    <>
      {showDescriptors.map((e, i) => (
        <RenderItem
          key={i}
          level={props.level + 1}
          field={e.key}
          descriptor={e.descriptor}
          top={props.top}
        />
      ))}
      {hasMore && (
        <div key="more">
          <button
            className="more-btn"
            title="Load more"
            onClick={() => setMaxShow(maxShow + opts.showItems)}
          >
            <IconEllipsis />
          </button>
        </div>
      )}
    </>
  );
}

function RenderItem(props: {
  level: number;
  field?: string;
  descriptor: TypedPropertyDescriptor<any>;
  top: any;
}) {
  const opts = useOption();
  const [descriptor, setDescriptor] = useState(props.descriptor);
  const [expand, setExpand] = useState(props.level < opts.showLevel);
  const type = useMemo(() => {
    return getType(descriptor.value);
  }, [descriptor]);
  const fieldIcon = useMemo(() => {
    if (!opts.showIcon) return null;
    let icon;
    if (opts.renderTypeIcon) {
      icon = opts.renderTypeIcon(type, descriptor, props.level, RenderTypeIcon);
    } else {
      icon = <RenderTypeIcon type={type} descriptor={descriptor} />;
    }
    if (icon === null) return null;
    return <i className="type-icon">{icon}</i>;
  }, [props.level, type, descriptor, opts.showIcon, opts.renderTypeIcon]);

  const canExpand =
    type === "array" || type === "object" || type === "function";
  const loadGetter = () => {
    if (!descriptor.get) return;
    console.log(props.top);
    let value;
    try {
      value = descriptor.get.call(props.top);
    } catch (err) {
      value = `[${(err as Error).message}]`;
    }
    const item = {
      ...descriptor,
    };
    item.get = undefined;
    item.value = value;
    setDescriptor(item);
  };

  useEffect(() => {
    setDescriptor(props.descriptor);
  }, [props.descriptor]);

  useEffect(() => {
    setExpand(props.level < opts.showLevel);
  }, [props.level, opts.showLevel]);

  return (
    <TreeItem
      className={!descriptor.enumerable ? "is-no-enumerable" : ""}
      label={
        <>
          {props.field ? (
            <>
              <span className={clsx(["type-property"])}>{props.field}</span>
              <span className="type-system">:&nbsp;</span>
            </>
          ) : null}
          {opts.renderValue ? (
            opts.renderValue(type, descriptor, {
              level: props.level,
              expand,
              canExpand,
              loadGetter,
              setExpand,
              getValueString,
              DefaultRenderValue: RenderItemValue,
            })
          ) : (
            <RenderItemValue
              type={type}
              descriptor={descriptor}
              loadGetter={loadGetter}
            />
          )}
        </>
      }
      icon={fieldIcon}
      expand={expand}
      onExpand={setExpand}
      hideSpece={props.level === 0}
      canClickLabelExtend={opts.canClickLabelExtend}
    >
      {canExpand && (
        <RenderItemPropertys
          level={props.level}
          object={descriptor.value}
          top={props.field === "[[Prototype]]" ? props.top : descriptor.value}
        />
      )}
    </TreeItem>
  );
}

export function ObjectViewer(
  props: {
    value: any;
    header?: ReactNode;
    footer?: ReactNode;
    attrs?: React.ComponentProps<"div">;
  } & Partial<CtxType>
) {
  return (
    <Tree
      {...props.attrs}
      className={clsx(["object-viewer", props.attrs?.className])}
      showLine={props.showLine}
    >
      {props.header}
      <Ctx.Provider
        value={{
          showLine: !!props.showLine,
          showLevel: props.showLevel === undefined ? 1 : props.showLevel,
          showItems: props.showItems || 20,
          showInlineMax: props.showInlineMax || 50,
          showIcon: !!props.showIcon,
          hideNonEnumerability: !!props.hideNonEnumerability,
          sort: props.sort === undefined ? Sort.DEFAULT : props.sort,
          canClickLabelExtend: !!props.canClickLabelExtend,
          renderValue: props.renderValue,
          renderTypeIcon: props.renderTypeIcon,
        }}
      >
        <RenderItem
          level={0}
          descriptor={{ enumerable: true, value: props.value }}
          top={props.value}
        />
      </Ctx.Provider>
      {props.footer}
    </Tree>
  );
}
