'use client';

import { MenuBar } from './menu-bar';
import { FormulaBar } from './formula-bar';

export function Header() {
  return (
    <div className="border-b">
      <MenuBar />
      <FormulaBar />
    </div>
  );
}