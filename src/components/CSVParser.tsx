import { useEffect, useState } from 'react';
import { AdData } from './DataTable';

// This hook fetches and parses CSV data
export const useCSVData = (csvPath: string) => {
    const [data, setData] = useState<AdData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(csvPath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
                }

                const text = await response.text();
                const parsedData = parseCSV(text);
                setData(parsedData);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, [csvPath]);

    return { data, loading, error };
};

// Parse CSV string into an array of objects
const parseCSV = (csv: string): AdData[] => {
    // Split the CSV into rows
    const rows = csv.trim().split('\n');

    // Extract headers
    const headers = rows[0].split(',');

    // Parse data rows
    return rows.slice(1).map(row => {
        const values = row.split(',');
        const entry: any = {};

        headers.forEach((header, i) => {
            // Convert numeric values
            const value = values[i];

            if (header === 'tags') {
                entry[header] = value;
            } else if (['ipm', 'ctr', 'spend', 'impressions', 'clicks', 'cpm',
                'cost_per_click', 'cost_per_install', 'installs'].includes(header)) {
                entry[header] = value === '' ? 0 : parseFloat(value);
            } else {
                entry[header] = value;
            }
        });

        return entry as AdData;
    });
};