import { ChevronDown, FolderOpen } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui'

import { useProjectSwitcher } from '../model/useProjectSwitcher.ts'

export function ProjectSwitcher() {
  const navigate = useNavigate()
  const { projects, currentProject, selectProject } = useProjectSwitcher()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='bg-background h-8 w-full justify-between rounded-[5px] px-3 text-sm font-medium'
        >
          <span className='flex min-w-0 items-center gap-2'>
            <FolderOpen className='size-[14px] shrink-0' />
            <span className='truncate'>{currentProject?.name ?? 'Select project'}</span>
          </span>
          <ChevronDown className='size-[14px] shrink-0' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-[var(--radix-dropdown-menu-trigger-width)] min-w-72'>
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onSelect={() => {
              selectProject(project.id)
              navigate(`/projects/${project.id}`)
            }}
          >
            <FolderOpen className='size-4' />
            <span className='truncate'>{project.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
