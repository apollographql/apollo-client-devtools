import { ReactNode, useEffect, useMemo, useState } from 'react'
import { IconArrow } from '../icon'
import { clsx } from '../utils'

export interface TreeProps extends React.ComponentProps<'div'> {
  children: ReactNode
  showLine?: boolean
}

export function Tree({children, showLine, ...attrs }: TreeProps) {
  return (
    <div {...attrs} className={clsx([attrs.className, 'tree', showLine && 'show-line'])}>{children}</div>
  )
}

export interface TreeItemProps {
  label: ReactNode
  icon?: ReactNode
  expand?: boolean
  hideSpece?: boolean
  children?: ReactNode
  className?: string
  canClickLabelExtend?: boolean
  attrs?: React.ComponentProps<'div'>
  onExpand?: (expand: boolean) => void
}

export function TreeItem(props: TreeItemProps) {
  const hasChild = useMemo(() => props.children, [props.children])
  const [expand, setExpand] = useState(!!props.expand)

  const handleExpand = (check?: boolean) => {
    if (check) {
      const select = getSelection()
      if (select && select.anchorOffset !== select.focusOffset) {
        return
      }
    }
    if (hasChild) {
      setExpand(!expand)
      props.onExpand?.(!expand)
    }
  }

  useEffect(() => {
    setExpand(!!props.expand)
  }, [props.expand])

  return (
    <div className={clsx(['tree-item', props.className])} {...props.attrs}>
      <div className="tree-item-label" onMouseUp={() => {props.canClickLabelExtend && handleExpand(true)}}>
        {hasChild &&
          <button
            className={clsx(['tree-item-fold-btn', expand && 'is-expand'])}
            onMouseUp={e => {e.stopPropagation()}}
            onClick={() => {handleExpand();}}>
            <IconArrow/>
          </button>}
        {(!hasChild && !props.hideSpece) && <span className="tree-item-space"></span>}
        {props.icon && <i className="tree-item-icon">{props.icon}</i>}
        {props.label}
      </div>
      {hasChild && expand && <div className="tree-item-content">{props.children}</div>}
    </div>
  )
}
