'use client';

export function HeaderRow({ columns }: { columns: number }) {
  return (
    <tr>
      <th className="border w-12 bg-muted"></th>
      {Array.from({ length: columns }).map((_, i) => (
        <th key={i} className="border bg-muted px-2">
          {String.fromCharCode(65 + i)}
        </th>
      ))}
    </tr>
  );
}