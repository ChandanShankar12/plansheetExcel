'use client';

import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  Menubar,
} from '@/components/ui/menubar';

export function MenuBar() {
  return (
    <Menubar className="border-b px-2">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
          <MenubarItem>Open <MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Cut <MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
          <MenubarItem>Copy <MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
          <MenubarItem>Paste <MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Format</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Bold <MenubarShortcut>⌘B</MenubarShortcut></MenubarItem>
          <MenubarItem>Italic <MenubarShortcut>⌘I</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}