import React, { useState, useEffect, useRef } from "react";
import "./FilterSystem.css";
import { FaTrash } from "react-icons/fa";
import { AdData } from "./DataTable.tsx";


export interface Filter {
    category: string;
    type: string;
    operator: string;
    value: string;
}

interface FilterSystemProps {
    onFilterChange: (filters: Filter[], logicOperator: string) => void;
    data?: AdData[];
    className?: string;
}

const categories: Record<string, string[]> = {
    Dimensions: ["Width", "Height", "Depth"],
    Tags: ["Character", "Background", "Elements", "CTA Position", "CTA Text"],
    Metrics: ["ipm", "ctr", "spend", "impressions", "clicks", "cpm", "cost_per_click", "cost_per_install", "installs"],
    Campaign: ["campaign", "ad_group", "creative_name", "country", "ad_network", "os"]
};

const tagValues = {
    Character: ["Hero", "Villain", "Sidekick"],
    Background: ["Urban", "Nature", "Abstract"],
    Elements: ["Fire", "Water", "Earth"],
    "CTA Position": ["Top Left", "Bottom Right", "Center"],
    "CTA Text": ["Buy Now", "Learn More", "Subscribe"]
};

const operators = ["Equals", "Lesser than", "Greater than"];
const conditions = ["is", "is not", "contains", "does not contain"];

const FilterSystem: React.FC<FilterSystemProps> = ({ onFilterChange, data, className }) => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [activeTab, setActiveTab] = useState("Campaign");
    const [searchTerm, setSearchTerm] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchValues, setSearchValues] = useState<Record<number, string>>({});
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [logicOperator, setLogicOperator] = useState("AND");

    // Create ref for the filter dropdown
    const filterRef = useRef<HTMLDivElement>(null);

    // Effect to notify parent component when filters change
    useEffect(() => {
        onFilterChange(filters, logicOperator);
    }, [filters, logicOperator, onFilterChange]);

    // Effect to handle clicks outside the filter dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node) && isFilterOpen) {
                setIsFilterOpen(false);
            }
        };

        // Add event listener when the dropdown is open
        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Clean up the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen]);

    const toggleFilterMenu = () => setIsFilterOpen(!isFilterOpen);

    // const handleCategoryChange = (index: number, category: string) => {
    //     const type = Object.keys(categories).find((key) => categories[key].includes(category)) || "";
    //     const updatedFilters = [...filters];
    //     updatedFilters[index] = { ...updatedFilters[index], category, type, operator: "", value: "" };
    //     setFilters(updatedFilters);
    // };

    const handleOperatorChange = (index: number, operator: string) => {
        const updatedFilters = [...filters];
        updatedFilters[index].operator = operator;
        setFilters(updatedFilters);
    };

    const handleValueChange = (index: number, value: string) => {
        const updatedFilters = [...filters];
        updatedFilters[index].value = value;
        setFilters(updatedFilters);
        setOpenDropdownIndex(null);
    };

    const handleRemoveFilter = (index: number) => {
        const updatedFilters = filters.filter((_, i) => i !== index);

        // Clean up search values when removing a filter
        const newSearchValues = { ...searchValues };
        delete newSearchValues[index];
        setSearchValues(newSearchValues);

        setFilters(updatedFilters);
        if (openDropdownIndex === index) setOpenDropdownIndex(null);
    };

    const handleSearchChange = (index: number, value: string) => {
        setSearchValues({
            ...searchValues,
            [index]: value
        });
    };

    const toggleDropdown = (index: number) => {
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    const addFilter = (category: string) => {
        if (filters.length === 0 || (filters[filters.length - 1].category && filters[filters.length - 1].operator && filters[filters.length - 1].value)) {
            const type = Object.keys(categories).find((key) => categories[key].includes(category)) || "";
            setFilters([...filters, { category, type, operator: "", value: "" }]);
        } else {
            alert("Please complete the current filter before adding a new one.");
        }
    };

    // Get unique values for campaign fields from data
    const getCampaignValues = (field: string): string[] => {
        if (!data) return [];
        const uniqueValues = new Set<string>();

        data.forEach(item => {
            if (item[field] && typeof item[field] === 'string') {
                uniqueValues.add(item[field] as string);
            }
        });

        return Array.from(uniqueValues).sort();
    };

    // Determine available values based on the category
    const getAvailableValues = (category: string): string[] => {
        // For campaign-related fields, get values from the data
        if (categories.Campaign.includes(category) && data) {
            return getCampaignValues(category);
        }

        // For tags, use predefined values
        if (category in tagValues) {
            return tagValues[category as keyof typeof tagValues];
        }

        return [];
    };

    return (
        <div className={`filter-system ${className || ""}`} ref={filterRef}>
            <button className="filter-button" onClick={toggleFilterMenu}>
                {filters.length > 0 ? `Filters (${filters.length})` : "Add Filters"}
            </button>
            {isFilterOpen && (
                <div className="filter-dropdown">
                    <div className="filter-tabs">
                        {Object.keys(categories).map((tab) => (
                            <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Search filters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="filter-search"
                    />
                    <div className="filter-options">
                        {categories[activeTab as keyof typeof categories]
                            .filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((category, idx) => (
                                <div className="filter-option" key={idx} onClick={() => addFilter(category)}>
                                    {category}
                                </div>
                            ))}
                    </div>

                    {filters.length > 0 && (
                        <div className="selected-filters">
                            {filters.map((filter, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && (
                                        <div className="logic-operator">
                                            <button
                                                className={`logic-button ${logicOperator === "AND" ? "active" : ""}`}
                                                onClick={() => setLogicOperator("AND")}
                                            >
                                                AND
                                            </button>
                                            <button
                                                className={`logic-button ${logicOperator === "OR" ? "active" : ""}`}
                                                onClick={() => setLogicOperator("OR")}
                                            >
                                                OR
                                            </button>
                                        </div>
                                    )}
                                    <div className="filter-item">
                                        <span>{filter.category}</span>
                                        <select
                                            onChange={(e) => handleOperatorChange(index, e.target.value)}
                                            value={filter.operator}
                                        >
                                            <option value="">Select Operator</option>
                                            {(filter.type === "Metrics" ? operators : conditions).map((op, idx) => (
                                                <option key={idx} value={op}>{op}</option>
                                            ))}
                                        </select>

                                        {(filter.type === "Tags" || filter.type === "Campaign") && (
                                            <div className="custom-select">
                                                <div
                                                    className="select-selected"
                                                    onClick={() => toggleDropdown(index)}
                                                >
                                                    {filter.value || "Select Value"}
                                                </div>
                                                {openDropdownIndex === index && (
                                                    <div className="select-items">
                                                        <input
                                                            type="text"
                                                            placeholder="Search values"
                                                            value={searchValues[index] || ""}
                                                            onChange={(e) => handleSearchChange(index, e.target.value)}
                                                            className="search-input"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="dropdown-options">
                                                            {getAvailableValues(filter.category)
                                                                .filter(val =>
                                                                    !searchValues[index] ||
                                                                    val.toLowerCase().includes((searchValues[index] || "").toLowerCase())
                                                                )
                                                                .map((val, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="option-item"
                                                                        onClick={() => handleValueChange(index, val)}
                                                                    >
                                                                        {val}
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(filter.type === "Metrics" || filter.type === "Dimensions") && (
                                            <input
                                                type="text"
                                                placeholder="Enter Value"
                                                value={filter.value || ""}
                                                onChange={(e) => handleValueChange(index, e.target.value)}
                                            />
                                        )}
                                        <button className="delete-filter" onClick={() => handleRemoveFilter(index)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterSystem;