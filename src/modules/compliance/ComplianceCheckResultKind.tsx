// src/components/ComplianceResultTable.tsx
import { useState, useMemo } from 'react';
import {
  Label,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, TableText, ThProps } from '@patternfly/react-table';
import CriticalRiskIcon from '@patternfly/react-icons/dist/esm/icons/arrow-circle-up-icon';
import HighRiskIcon from '@patternfly/react-icons/dist/esm/icons/warning-triangle-icon';
import MediumRiskIcon from '@patternfly/react-icons/dist/esm/icons/arrow-circle-up-icon';
import LowRiskIcon from '@patternfly/react-icons/dist/esm/icons/arrow-circle-down-icon';
import { ComplianceCheckResultKind, ComplianceStatus, ComplianceSeverity } from '../../types/ComplianceCheckResult';
import * as React from 'react';

interface ComplianceResultTableProps {
  data: ComplianceCheckResultKind[];
  onRowClick: (row: ComplianceCheckResultKind) => void;
  selectedRow: ComplianceCheckResultKind | null;
}

const renderStatusLabel = (status: ComplianceStatus) => {
  switch (status) {
    case 'PASS':
      return <Label color="green">{status}</Label>;
    case 'FAIL':
      return <Label color="red">{status}</Label>;
    case 'MANUAL':
      return <Label color="blue">{status}</Label>;
    case 'INFO':
      return <Label color="teal">{status}</Label>;
    case 'INCONSISTENT':
      return <Label color="orange">{status}</Label>;
    default:
      return <Label color="grey">{status}</Label>;
  }
};

const renderSeverityLabel = (severity: ComplianceSeverity) => {
  switch (severity) {
    case 'critical':
      return (
        <Label color="purple" icon={<CriticalRiskIcon />}>
          Critical
        </Label>
      );
    case 'high':
      return (
        <Label color="red" icon={<HighRiskIcon />}>
          High
        </Label>
      );
    case 'medium':
      return (
        <Label color="orange" icon={<MediumRiskIcon />}>
          Medium
        </Label>
      );
    case 'low':
      return (
        <Label color="green" icon={<LowRiskIcon />}>
          Low
        </Label>
      );
    default:
      return <Label color="grey">{severity}</Label>;
  }
};

type SortDirection = 'asc' | 'desc';

interface SortState {
  column: string;
  direction: SortDirection;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const columns = ['Name', 'Severity', 'Status', 'Suite', 'Scan', 'Rule', 'Last Scanned'];

export const ComplianceResultTable: React.FC<ComplianceResultTableProps> = ({ data, onRowClick, selectedRow }) => {
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'ALL'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<ComplianceSeverity | 'ALL'>('ALL');
  const [sort, setSort] = useState<SortState>({ column: 'Severity', direction: 'asc' });
  const [statusOpen, setStatusOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const status = row.metadata.labels['compliance.openshift.io/check-status'];
      const severity = row.metadata.labels['compliance.openshift.io/check-severity'];
      const name = row.metadata.name.toLowerCase();

      if (nameFilter && !name.includes(nameFilter.toLowerCase())) return false;
      if (statusFilter !== 'ALL' && status !== statusFilter) return false;
      if (severityFilter !== 'ALL' && severity !== severityFilter) return false;
      return true;
    });
  }, [data, nameFilter, statusFilter, severityFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sort.column) {
        case 'Name':
          valA = a.metadata.name;
          valB = b.metadata.name;
          break;
        case 'Severity':
          valA = SEVERITY_ORDER[a.metadata.labels['compliance.openshift.io/check-severity']] ?? 99;
          valB = SEVERITY_ORDER[b.metadata.labels['compliance.openshift.io/check-severity']] ?? 99;
          break;
        case 'Status':
          valA = a.metadata.labels['compliance.openshift.io/check-status'];
          valB = b.metadata.labels['compliance.openshift.io/check-status'];
          break;
        case 'Suite':
          valA = a.metadata.labels['compliance.openshift.io/suite'];
          valB = b.metadata.labels['compliance.openshift.io/suite'];
          break;
        case 'Last Scanned':
          valA = a.metadata.annotations['compliance.openshift.io/last-scanned-timestamp'];
          valB = b.metadata.annotations['compliance.openshift.io/last-scanned-timestamp'];
          break;
      }

      if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sort]);

  const paginated = useMemo(() => {
    return sorted.slice((page - 1) * perPage, page * perPage);
  }, [sorted, page, perPage]);

  const getSortParams = (column: string): ThProps['sort'] => ({
    sortBy: {
      index: columns.indexOf(column),
      direction: sort.column === column ? sort.direction : undefined,
      defaultDirection: 'asc',
    },
    onSort: (_event, _index, direction) => {
      setSort({ column, direction });
      setPage(1);
    },
    columnIndex: columns.indexOf(column),
  });

  const onClearFilters = () => {
    setNameFilter('');
    setStatusFilter('ALL');
    setSeverityFilter('ALL');
    setPage(1);
  };

  const hasActiveFilters = nameFilter || statusFilter !== 'ALL' || severityFilter !== 'ALL';

  const renderPagination = (variant: PaginationVariant | 'top' | 'bottom', isCompact: boolean) => (
    <Pagination
      isCompact={isCompact}
      itemCount={filtered.length}
      page={page}
      perPage={perPage}
      onSetPage={(_e, p) => setPage(p)}
      onPerPageSelect={(_e, pp) => {
        setPerPage(pp);
        setPage(1);
      }}
      variant={variant}
    />
  );

  return (
    <PageSection>
      <Toolbar clearAllFilters={onClearFilters} collapseListedFiltersBreakpoint="xl">
        <ToolbarContent>
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <SearchInput
                placeholder="Filter by name..."
                value={nameFilter}
                onChange={(_e, val) => {
                  setNameFilter(val);
                  setPage(1);
                }}
                onClear={() => {
                  setNameFilter('');
                  setPage(1);
                }}
              />
            </ToolbarItem>

            <ToolbarItem>
              <Select
                isOpen={statusOpen}
                onOpenChange={setStatusOpen}
                selected={statusFilter}
                onSelect={(_e, val) => {
                  setStatusFilter(val as ComplianceStatus | 'ALL');
                  setStatusOpen(false);
                  setPage(1);
                }}
                toggle={(ref: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={ref} onClick={() => setStatusOpen(!statusOpen)}>
                    {statusFilter === 'ALL' ? 'All statuses' : statusFilter}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="ALL">All statuses</SelectOption>
                  <SelectOption value="PASS">PASS</SelectOption>
                  <SelectOption value="FAIL">FAIL</SelectOption>
                  <SelectOption value="MANUAL">MANUAL</SelectOption>
                  <SelectOption value="INFO">INFO</SelectOption>
                  <SelectOption value="INCONSISTENT">INCONSISTENT</SelectOption>
                </SelectList>
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              <Select
                isOpen={severityOpen}
                onOpenChange={setSeverityOpen}
                selected={severityFilter}
                onSelect={(_e, val) => {
                  setSeverityFilter(val as ComplianceSeverity | 'ALL');
                  setSeverityOpen(false);
                  setPage(1);
                }}
                toggle={(ref: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={ref} onClick={() => setSeverityOpen(!severityOpen)}>
                    {severityFilter === 'ALL' ? 'All severities' : severityFilter}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="ALL">All severities</SelectOption>
                  <SelectOption value="critical">Critical</SelectOption>
                  <SelectOption value="high">High</SelectOption>
                  <SelectOption value="medium">Medium</SelectOption>
                  <SelectOption value="low">Low</SelectOption>
                </SelectList>
              </Select>
            </ToolbarItem>
          </ToolbarGroup>

          <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
            {renderPagination('top', false)}
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="Compliance Check Results" isStickyHeader variant="compact">
        <Thead>
          <Tr>
            <Th width={20} sort={getSortParams('Name')}>
              {columns[0]}
            </Th>
            <Th width={10} sort={getSortParams('Severity')}>
              {columns[1]}
            </Th>
            <Th width={10} sort={getSortParams('Status')}>
              {columns[2]}
            </Th>
            <Th width={10} sort={getSortParams('Suite')}>
              {columns[3]}
            </Th>
            <Th width={10} sort={getSortParams('Scan')}>
              {columns[4]}
            </Th>
            <Th width={20}>{columns[5]}</Th>
            <Th width={20} sort={getSortParams('Last Scanned')}>
              {columns[6]}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.length === 0 ? (
            <Tr>
              <Td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                No results found.{' '}
                {hasActiveFilters && (
                  <a onClick={onClearFilters} style={{ cursor: 'pointer' }}>
                    Clear all filters
                  </a>
                )}
              </Td>
            </Tr>
          ) : (
            paginated.map((row) => (
              <Tr
                key={row.metadata.uid}
                isClickable
                onRowClick={() => onRowClick(row)}
                isRowSelected={selectedRow?.metadata.uid === row.metadata.uid}
              >
                <Td dataLabel={columns[0]}>
                  <TableText wrapModifier="truncate">{row.metadata.name}</TableText>
                </Td>
                <Td dataLabel={columns[1]}>
                  {renderSeverityLabel(row.metadata.labels['compliance.openshift.io/check-severity'])}
                </Td>
                <Td dataLabel={columns[2]}>
                  {renderStatusLabel(row.metadata.labels['compliance.openshift.io/check-status'])}
                </Td>
                <Td dataLabel={columns[3]}>{row.metadata.labels['compliance.openshift.io/suite']}</Td>
                <Td dataLabel={columns[4]}>{row.metadata.labels['compliance.openshift.io/scan-name']}</Td>
                <Td dataLabel={columns[5]}>
                  <TableText wrapModifier="truncate">
                    {row.metadata.annotations['compliance.openshift.io/rule']}
                  </TableText>
                </Td>
                <Td dataLabel={columns[6]}>
                  {new Date(
                    row.metadata.annotations['compliance.openshift.io/last-scanned-timestamp'],
                  ).toLocaleString()}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {renderPagination('bottom', false)}
    </PageSection>
  );
};
