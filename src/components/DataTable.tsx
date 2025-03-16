import React, { useState, useEffect, useMemo } from 'react';
import './DataTable.css';

// Interface for the CSV data structure
export interface AdData {
    creative_id: string;
    creative_name: string;
    tags: string;
    country: string;
    ad_network: string;
    os: string;
    campaign: string;
    ad_group: string;
    ipm: number;
    ctr: number;
    spend: number;
    impressions: number;
    clicks: number;
    cpm: number;
    cost_per_click: number;
    cost_per_install: number;
    installs: number;
    [key: string]: string | number; // Index signature to allow dynamic access
}

interface DataTableProps {
    data: AdData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    // Only show rows with impressions > 0
    const activeData = useMemo(() => {
        return data.filter(row => row.impressions > 0);
    }, [data]);

    // State for search queries
    const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

    // State for sorting
    const [sortConfig, setSortConfig] = useState<{
        key: keyof AdData | null;
        direction: 'ascending' | 'descending';
    }>({
        key: null,
        direction: 'ascending'
    });

    // Filtered and sorted data
    const [filteredData, setFilteredData] = useState<AdData[]>(activeData);

    // Column definitions
    const columns: {label: string; key: keyof AdData; numeric?: boolean}[] = [
        { label: 'Creative Name', key: 'creative_name' },
        { label: 'Campaign', key: 'campaign' },
        { label: 'Ad Group', key: 'ad_group' },
        { label: 'Country', key: 'country' },
        { label: 'Impressions', key: 'impressions', numeric: true },
        { label: 'Clicks', key: 'clicks', numeric: true },
        { label: 'CTR (%)', key: 'ctr', numeric: true },
        { label: 'Installs', key: 'installs', numeric: true },
        { label: 'IPM', key: 'ipm', numeric: true },
        { label: 'Spend ($)', key: 'spend', numeric: true },
        { label: 'CPM ($)', key: 'cpm', numeric: true },
        { label: 'CPC ($)', key: 'cost_per_click', numeric: true },
        { label: 'CPI ($)', key: 'cost_per_install', numeric: true }
    ];

    // Handle search input change
    const handleSearchChange = (column: keyof AdData, value: string) => {
        setSearchQueries(prev => ({
            ...prev,
            [column]: value
        }));
    };

    // Handle sort request
    const requestSort = (key: keyof AdData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Format cell value based on column type
    const formatCellValue = (column: keyof AdData, value: any) => {
        if (column === 'ctr') {
            return `${(value * 100).toFixed(2)}%`;
        } else if (column === 'spend' || column === 'cpm' || column === 'cost_per_click' || column === 'cost_per_install') {
            return `$${typeof value === 'number' ? value.toFixed(column === 'cost_per_click' ? 4 : 2) : value}`;
        } else if (column === 'ipm') {
            return typeof value === 'number' ? value.toFixed(2) : value;
        } else if (column === 'impressions') {
            return typeof value === 'number' ? value.toLocaleString() : value;
        }
        return value;
    };

    // Get sort direction indicator
    const getSortDirectionIndicator = (column: keyof AdData) => {
        if (sortConfig.key !== column) return null;
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    // Calculate filtered and sorted data when dependencies change
    const calculatedData = useMemo(() => {
        let result = [...activeData];

        // Apply search filters
        Object.entries(searchQueries).forEach(([column, query]) => {
            if (query.trim()) {
                const columnKey = column as keyof AdData;
                result = result.filter(row => {
                    const value = row[columnKey];
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(query.toLowerCase());
                    } else if (typeof value === 'number') {
                        return value.toString().includes(query);
                    }
                    return false;
                });
            }
        });

        // Apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue === bValue) return 0;

                if (sortConfig.direction === 'ascending') {
                    return aValue < bValue ? -1 : 1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        }

        return result;
    }, [activeData, searchQueries, sortConfig]);

    // Update filtered data when calculation changes
    useEffect(() => {
        setFilteredData(calculatedData);
    }, [calculatedData]);

    // Display message when there's no data after filtering
    if (activeData.length === 0) {
        return (
            <div className="data-table-container">
                <h2>Campaign Performance</h2>
                <div className="no-results">No data available or all data has been filtered out</div>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <h2>Campaign Performance {data.length !== activeData.length ? `(Showing ${activeData.length} of ${data.length} records)` : ''}</h2>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                    <tr>
                        {columns.map(column => (
                            <th key={column.key} onClick={() => requestSort(column.key)} className="sortable-header">
                                <div className="header-content">
                                    <span>{column.label}</span>
                                    <span className="sort-indicator">{getSortDirectionIndicator(column.key)}</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Search ${column.label}`}
                                    value={searchQueries[column.key] || ''}
                                    onChange={(e) => handleSearchChange(column.key, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="search-input"
                                />
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.length > 0 ? (
                        filteredData.map((row, index) => (
                            <tr key={index}>
                                {columns.map(column => (
                                    <td key={column.key} className={column.numeric ? 'numeric-cell' : ''}>
                                        {formatCellValue(column.key, row[column.key])}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="no-results">
                                No results found matching your search criteria
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;