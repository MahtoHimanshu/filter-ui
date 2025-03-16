// src/App.tsx
import React, { useState, useEffect } from 'react';
import FilterSystem, { Filter } from './components/FilterSystem';
import DataTable, { AdData } from './components/DataTable';
import { useCSVData } from './components/CSVParser';
import './App.css';

interface AppProps {}

const App: React.FC<AppProps> = () => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [logicOperator, setLogicOperator] = useState("AND");
    const [filteredData, setFilteredData] = useState<AdData[]>([]);

    // Use our custom hook to fetch and parse the CSV data
    const { data: adData, loading, error } = useCSVData('/data/segwise-report.csv');

    // Apply filters to data
    useEffect(() => {
        if (!adData || adData.length === 0) {
            setFilteredData([]);
            return;
        }

        // If no filters, show all data
        if (filters.length === 0) {
            setFilteredData(adData);
            return;
        }

        // First, check if all filters are complete before applying them
        const hasIncompleteFilters = filters.some(filter =>
            !filter.category || !filter.operator || filter.value === "");

        // If any filter is incomplete, don't filter the data
        if (hasIncompleteFilters) {
            setFilteredData(adData);
            return;
        }

        // Apply filters to data (only complete filters)
        const result = adData.filter(row => {
            // For AND logic, all filters must match
            if (logicOperator === "AND") {
                return filters.every(filter => evaluateFilter(row, filter));
            }
            // For OR logic, at least one filter must match
            else {
                return filters.some(filter => evaluateFilter(row, filter));
            }
        });

        setFilteredData(result);
    }, [adData, filters, logicOperator]);

    // Evaluate a single filter against a data row
    const evaluateFilter = (row: AdData, filter: Filter): boolean => {
        const { category, operator, value } = filter;

        // Skip incomplete filters
        if (!category || !operator || value === "") {
            return true; // Don't filter out rows for incomplete filters
        }

        // Get the actual value from the row
        const rowValue = row[category as keyof AdData];

        // Skip if category doesn't exist in row
        if (rowValue === undefined) {
            return false;
        }

        // For numeric values
        if (typeof rowValue === 'number') {
            const numValue = parseFloat(value);

            switch (operator) {
                case "Equals":
                    return rowValue === numValue;
                case "Lesser than":
                    return rowValue < numValue;
                case "Greater than":
                    return rowValue > numValue;
                default:
                    return false;
            }
        }

        // For string values
        if (typeof rowValue === 'string') {
            const strRowValue = rowValue.toLowerCase();
            const strValue = value.toLowerCase();

            switch (operator) {
                case "is":
                    return strRowValue === strValue;
                case "is not":
                    return strRowValue !== strValue;
                case "contains":
                    return strRowValue.includes(strValue);
                case "does not contain":
                    return !strRowValue.includes(strValue);
                default:
                    return false;
            }
        }

        return false;
    };

    const handleFilterChange = (newFilters: Filter[], newLogicOperator: string) => {
        setFilters(newFilters);
        setLogicOperator(newLogicOperator);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo-container">
                    <div>
                        <img src="/group.svg" alt="Logo" />
                    </div>
                    <div className="app-title">
                        <h1>Segwise</h1>
                        <p>Campaign Performance Dashboard</p>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <div className="app-content">
                    <FilterSystem
                        onFilterChange={handleFilterChange}
                        className="filter"
                        data={adData}
                    />
                </div>
                {loading ? (
                    <div className="loading-state">Loading campaign data...</div>
                ) : error ? (
                    <div className="error-state">Error loading data: {error}</div>
                ) : (
                    <DataTable data={filteredData} />
                )}
            </main>

            <footer className="app-footer">
                <p>2025</p>
            </footer>
        </div>
    );
};

export default App;
