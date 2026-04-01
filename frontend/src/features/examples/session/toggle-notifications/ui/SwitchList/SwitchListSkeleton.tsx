import s from './SwitchList.module.scss'
import { Skeleton } from '@/shared/ui'

type Props = {}

export function SwitchListSkeleton(props: Props) {
  const {} = props

  return (
    <ul className={s.list}>
      <li className={s.item}>
        <Skeleton variant='rounded' width={44} height={24} />
        <Skeleton variant='rounded' width={250} height={24} />
      </li>
    </ul>
  )
}
