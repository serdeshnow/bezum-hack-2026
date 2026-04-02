import React from 'react'

import cn from 'classnames'

export type IconType =
  | 'chevronDown'
  | 'success'
  | 'exit'
  | 'xCircle'
  | 'filter'
  | 'filtered'
  | 'sorter'
  | 'asc'
  | 'desc'
  | 'bell'
  | 'box'
  | 'graph'
  | 'grid'
  | 'magnifier'
  | 'settings'
  | 'star'
  | 'starred'
  | 'chart'
  | 'cloudImport'
  | 'arrowDown'
  | 'arrowUp'
  | 'chevronLeft'
  | 'chevronRight'
  | 'error'
  | 'x'
  | 'info'
  | 'image'
  | 'dots'
  | 'download'
  | 'edit'
  | 'trash'
  | 'monitor'

type Props = {
  type: IconType
  className?: string
  size?: number | string
  color?: string
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export function Icon(props: Props) {
  const { type, className, size = 24, color, onClick } = props

  return (
    <div
      className={cn(
        'relative box-content block h-6 w-6 p-0.5',
        { 'cursor-pointer rounded-lg hover:bg-black/5 active:bg-black/5': Boolean(onClick) },
        className
      )}
      onClick={onClick}
      style={{
        width: size,
        height: size
      }}
    >
      <svg className='block h-full w-full' style={{ color }} aria-hidden='true'>
        <use href={`/images/icons.svg#${type}`} />
      </svg>
    </div>
  )
}
