import { Fragment, ReactNode, useMemo, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';

export interface Col<T> { key: keyof T & string; label: string; numeric?: boolean; chip?: boolean }
const SEV: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function chipClass(v: string) {
  if (/^(Critical|High|FAIL|Failed|DETECTED|No|Copyleft)$/.test(v)) return 'ng';
  if (/^(Medium|WARN|Weak Copyleft|Unknown|SKIP)$/.test(v)) return 'wn';
  if (/^(PASS|Success|Yes|Low|Permissive|OK)$/.test(v)) return 'ok';
  return '';
}
export const Chip = ({ v }: { v: string }) => <span className={`chip ${chipClass(v)}`}>{v}</span>;

interface Props<T> { rows: T[]; cols: Col<T>[]; detail?: (row: T) => ReactNode; placeholder?: string }

/** 検索・ソート・行展開つきの共通テーブル(TanStack Table) */
export function DataTable<T extends object>({ rows, cols, detail, placeholder = '絞り込み' }: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());

  const columns = useMemo<ColumnDef<T>[]>(
    () => cols.map((c) => ({
      id: c.key,
      header: c.label,
      accessorFn: (r: T) => (r as unknown as Record<string, string | number>)[c.key],
      sortingFn: c.key === 'severity'
        ? (a, b, id) => (SEV[a.getValue<string>(id)] ?? 9) - (SEV[b.getValue<string>(id)] ?? 9)
        : 'auto',
    })),
    [cols],
  );
  const table = useReactTable({
    data: rows, columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const shown = table.getRowModel().rows;
  const toggle = (id: string) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <>
      <div className="bar">
        <input type="search" placeholder={placeholder} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="絞り込み" />
        <span className="mu">{shown.length} / {rows.length} 件</span>
      </div>
      <div className="wrap">
        <table>
          <thead>
            <tr>
              {table.getHeaderGroups()[0].headers.map((h, i) => (
                <th key={h.id} tabIndex={0} className={cols[i].numeric ? 'n' : ''}
                  onClick={h.column.getToggleSortingHandler()}
                  onKeyDown={(e) => e.key === 'Enter' && h.column.toggleSorting()}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{ asc: ' ▲', desc: ' ▼' }[h.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={cols.length} className="mu">該当するデータがありません</td></tr>}
            {shown.map((row) => {
              const d = detail?.(row.original);
              return (
                <Fragment key={row.id}>
                  <tr className={d ? 'row' : ''} onClick={d ? () => toggle(row.id) : undefined}>
                    {cols.map((c) => {
                      const v = (row.original as unknown as Record<string, unknown>)[c.key];
                      return <td key={c.key} className={c.numeric ? 'n' : ''}>{c.chip && v !== '' ? <Chip v={String(v)} /> : String(v ?? '')}</td>;
                    })}
                  </tr>
                  {d && open.has(row.id) && <tr><td colSpan={cols.length} className="det">{d}</td></tr>}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
