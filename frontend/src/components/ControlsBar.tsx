import { Search } from 'lucide-react';

interface ControlsBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

const STATUS_TABS = [
  { id: 'all', label: 'All Leads' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'lost', label: 'Lost' },
];

export function ControlsBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ControlsBarProps) {
  return (
    <section className="controls-bar" aria-label="Search and Filter Controls">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search leads by name or email..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="status-tabs" role="tablist">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={statusFilter === tab.id}
            className={`status-tab ${statusFilter === tab.id ? 'active' : ''}`}
            onClick={() => onStatusChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
}
