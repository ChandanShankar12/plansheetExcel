'use client';

import { Button } from '@/components/ui/button';
import { DollarSign, Percent } from 'lucide-react';
import { ToolbarSection } from './toolbar-section';

export function NumberTools() {
  return (
    <ToolbarSection>
      <Button variant="ghost" size="icon" className="rounded-none">
        <DollarSign className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-none">
        <Percent className="h-4 w-4" />
      </Button>
    </ToolbarSection>
  );
}