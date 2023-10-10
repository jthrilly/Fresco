'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { Row } from '@tanstack/react-table';
import { Fragment } from 'react';

interface Actions {
  label: string;
  row: Row<unknown>;
  component: React.ReactNode;
}

interface Props<TMenuItem = Actions> {
  menuItems?: TMenuItem[];
}

export const ActionsDropdown = <TMenuItem extends Actions>({
  menuItems,
}: Props<TMenuItem>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {menuItems &&
          menuItems.map((item, index) => (
            <Fragment key={index}>{item.component}</Fragment>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
