// Chart Utility Functions
// These functions take an array of donated device objects and compute cumulative emission totals (metals, plastics, CO2) 
// grouped by time (quarterly, monthly, yearly, all-time).
// IMPORTANT: Make sure devices are sorted from oldest to newest by `date_donated` to ensure cumulative values are accurate.


// Quarterly Chart
// Fetches cumulative emission totals grouped by quarter for the current calendar year.
// For each device in the current year:
//  - Determines which quarter (Q1–Q4) the donation occurred.
//  - Adds metal, plastic, and CO2 values to running cumulative totals.
//  - Updates the quarter's data in a Map to ensure later quarters include all previous emissions.
export function getQuarterlyData(devices: any[]) {
    const currentYear = new Date().getFullYear(); // Get the current year to filter relevant devices
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];    // Define labels for each quarter

    // Initialize map with each quarter and empty emissions totals
    const dataMap = new Map<string, { metals: number; plastics: number; co2: number }>();

    quarters.forEach(q => dataMap.set(q, { metals: 0, plastics: 0, co2: 0 }));

    let cumulativeMetals = 0, cumulativePlastics = 0, cumulativeCO2 = 0;

    // Aggregate device data into the correct quarter
    // Iterate through each device and assign it to a quarter if it's from the current year
    devices.forEach((d) => {
        const date = new Date(d.date_donated);
        if (date.getFullYear() !== currentYear) return; // Skip devices not from the current year

        // Determine quarter number (0-based index so +1)
        const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;

        // Calculate emissions for this device
        const metals = (d.ferrous_metals || 0) + (d.aluminum || 0) + (d.copper || 0) + (d.other_metals || 0);
        const plastics = d.plastics || 0;
        const co2 = d.co2_emissions || 0;

        // Keep cumulative totals
        cumulativeMetals += metals;
        cumulativePlastics += plastics;
        cumulativeCO2 += co2;

        // Update map with cumulative totals for the quarter
        dataMap.set(quarter, { metals: cumulativeMetals, plastics: cumulativePlastics, co2: cumulativeCO2 });
    });

    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

    // Return array with a blank origin point followed by quarterly data
    return [
        // Format final chart data starting with a blank origin point
        { label: '', metals: 0, plastics: 0, co2: 0 }, //origin point
        ...quarters.map((q, index) => ({
            label: q,
            ...((index + 1 <= currentQuarter ? dataMap.get(q) : { metals: null, plastics: null, co2: null }) as {
                metals: number | null;
                plastics: number | null;
                co2: number | null;
            }),
        })),
    ];
}


//1-Year Monthly Chart
// Fetches cumulative emission totals grouped by month for the past 12 months.
// For each device:
//  - Determines if the donation occurred in the relevant month.
//  - Adds its emission values (metals, plastics, CO2) to running cumulative totals.
//  - Appends a new data point for the month to the final chart data.
export function getOneYearMonthlyData(devices: any[]) {
    const result: { label: string, metals: number, plastics: number, co2: number }[] = [];
    const now = new Date();// Current date
    const start = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1); // 1 year ago from next month
    const months = [];

    // Generate 12 sequential months for the range (labels)
    for (let i = 0; i < 12; i++) {
        const date = new Date(start);
        date.setMonth(start.getMonth() + i);
        months.push(date);
    }

    // Initialize cumulative emission counters
    let cumulativeMetals = 0, cumulativePlastics = 0, cumulativeCO2 = 0;

    // Process emissions month by month
    months.forEach((monthDate) => {

        // Format label like "Jan 2024", "Feb 2024", etc.
        const label = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

        // Loop through devices and include those that match this month
        devices.forEach((d) => {
            const date = new Date(d.date_donated);
            if (date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth()) {
                cumulativeMetals += (d.ferrous_metals || 0) + (d.aluminum || 0) + (d.copper || 0) + (d.other_metals || 0);
                cumulativePlastics += d.plastics || 0;
                cumulativeCO2 += d.co2_emissions || 0;
            }
        });

        // Push cumulative values for the current month
        result.push({ label, metals: cumulativeMetals, plastics: cumulativePlastics, co2: cumulativeCO2 });
    });

    return result;
}


//5 Years Yearly Chart
// Returns cumulative yearly emissions for the last 5 years.
// For each device:
//  - Filters out devices not within the 5-year window.
//  - Adds each device’s emissions to the appropriate year.
//  - Ensures each year includes all prior emissions for cumulative charting.
export function getFiveYearData(devices: any[]) {

    const currentYear = new Date().getFullYear(); // Get the current year
    const startYear = currentYear - 4;            // Start range from 4 years ago

    // Initialize cumulative emission counters
    let cumulativeMetals = 0;
    let cumulativePlastics = 0;
    let cumulativeCO2 = 0;

    // Map to hold cumulative totals per year
    const yearMap = new Map<number, { metals: number; plastics: number; co2: number }>();

    // Loop through all devices and process only those donated in the last 5 years    
    devices.forEach((d) => {
        const date = new Date(d.date_donated);
        const year = date.getFullYear();

        if (year < startYear || year > currentYear) return; // Skip devices donated before the 5-year

        // Calculate emissions for this device
        const metals =
            (d.ferrous_metals || 0) +
            (d.aluminum || 0) +
            (d.copper || 0) +
            (d.other_metals || 0);
        const plastics = d.plastics || 0;
        const co2 = d.co2_emissions || 0;

        // Add to cumulative totals
        cumulativeMetals += metals;
        cumulativePlastics += plastics;
        cumulativeCO2 += co2;

        // Store updated cumulative values in the map
        yearMap.set(year, {
            metals: cumulativeMetals,
            plastics: cumulativePlastics,
            co2: cumulativeCO2,
        });
    });

    // Prepare final result array in sequential order from oldest to newest
    const result: { label: string; metals: number; plastics: number; co2: number }[] = [];

    for (let y = startYear; y <= currentYear; y++) {

        // Use the previous year's data if current year has no data (to maintain continuity in chart)
        const previous = result[result.length - 1] ?? { metals: 0, plastics: 0, co2: 0 };
        const value = yearMap.get(y) ?? previous;

        result.push({
            label: y.toString(),
            metals: value.metals,
            plastics: value.plastics,
            co2: value.co2,
        });
    }

    return result;
}

// ALL-TIME CHART
// Returns cumulative emissions from the first recorded donation year to the current year.
// Assumes devices are sorted by donation date (oldest to newest) to ensure accurate cumulative totals.
export function getAllTimeData(devices: any[]) {

    //Return for empty input
    if (devices.length === 0) return [];

    // Determine the range of years: from the first donation to the current year
    const firstYear = new Date(devices[0].date_donated).getFullYear();
    const currentYear = new Date().getFullYear();

    // Initialize cumulative counters for all emission types
    let cumulativeMetals = 0;
    let cumulativePlastics = 0;
    let cumulativeCO2 = 0;

    // Use a map to store cumulative totals by year
    const yearMap = new Map<number, { metals: number; plastics: number; co2: number }>();

    // Loop through all devices and aggregate emissions by year
    devices.forEach((d) => {
        const date = new Date(d.date_donated);
        const year = date.getFullYear();

        // Extract individual emission values, defaulting to 0 if missing
        const metals =
            (d.ferrous_metals || 0) +
            (d.aluminum || 0) +
            (d.copper || 0) +
            (d.other_metals || 0);
        const plastics = d.plastics || 0;
        const co2 = d.co2_emissions || 0;

        // Update running totals
        cumulativeMetals += metals;
        cumulativePlastics += plastics;
        cumulativeCO2 += co2;

        // Store cumulative total for this year
        yearMap.set(year, {
            metals: cumulativeMetals,
            plastics: cumulativePlastics,
            co2: cumulativeCO2,
        });
    });

    // Initialize result with a blank origin point to improve chart rendering
    const result: { label: string; metals: number; plastics: number; co2: number }[] = [
        { label: '', metals: 0, plastics: 0, co2: 0 } // origin point
    ];

    // Build result array by filling each year between first and current
    for (let y = firstYear; y <= currentYear; y++) {

        // Use previous value if this year had no data (to maintain continuity in the chart)
        const previous = result[result.length - 1] ?? { metals: 0, plastics: 0, co2: 0 };
        const value = yearMap.get(y) ?? previous;

        result.push({
            label: y.toString(),
            metals: value.metals,
            plastics: value.plastics,
            co2: value.co2,
        });
    }

    return result;
}

