
// Quarterly Chart
// Generates cumulative emissions data grouped by quarter for the current year.
export function getQuarterlyData(devices: any[]) {
    const currentYear = new Date().getFullYear();
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const dataMap = new Map<string, { metals: number; plastics: number; co2: number }>();

    quarters.forEach(q => dataMap.set(q, { metals: 0, plastics: 0, co2: 0 }));

    let cumulativeMetals = 0, cumulativePlastics = 0, cumulativeCO2 = 0;

    // Aggregate device data into the correct quarter
    devices.forEach((d) => {
        const date = new Date(d.date_donated);
        if (date.getFullYear() !== currentYear) return;

        const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
        const metals = (d.ferrous_metals || 0) + (d.aluminum || 0) + (d.copper || 0) + (d.other_metals || 0);
        const plastics = d.plastics || 0;
        const co2 = d.co2_emissions || 0;

        cumulativeMetals += metals;
        cumulativePlastics += plastics;
        cumulativeCO2 += co2;

        dataMap.set(quarter, { metals: cumulativeMetals, plastics: cumulativePlastics, co2: cumulativeCO2 });
    });

    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

    // Return array with a blank origin point followed by quarterly data
    return [
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
// Generates cumulative emissions data grouped by month for the past 12 months.
export function getOneYearMonthlyData(devices: any[]) {
    const result: { label: string, metals: number, plastics: number, co2: number }[] = [];
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1); // 1 year ago from next month
    const months = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(start);
        date.setMonth(start.getMonth() + i);
        months.push(date);
    }

    let cumulativeMetals = 0, cumulativePlastics = 0, cumulativeCO2 = 0;

    months.forEach((monthDate) => {
        const label = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

        devices.forEach((d) => {
            const date = new Date(d.date_donated);
            if (date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth()) {
                cumulativeMetals += (d.ferrous_metals || 0) + (d.aluminum || 0) + (d.copper || 0) + (d.other_metals || 0);
                cumulativePlastics += d.plastics || 0;
                cumulativeCO2 += d.co2_emissions || 0;
            }
        });

        result.push({ label, metals: cumulativeMetals, plastics: cumulativePlastics, co2: cumulativeCO2 });
    });

    return result;
}


//5 Years Yearly Chart
// Returns cumulative yearly emissions for the last 5 years.
export function getFiveYearData(devices: any[]) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;

    let cumulativeMetals = 0;
    let cumulativePlastics = 0;
    let cumulativeCO2 = 0;

    const yearMap = new Map<number, { metals: number; plastics: number; co2: number }>();

    devices.forEach((d) => {
        const date = new Date(d.date_donated);
        const year = date.getFullYear();
        if (year < startYear || year > currentYear) return;

        const metals =
            (d.ferrous_metals || 0) +
            (d.aluminum || 0) +
            (d.copper || 0) +
            (d.other_metals || 0);
        const plastics = d.plastics || 0;
        const co2 = d.co2_emissions || 0;

        cumulativeMetals += metals;
        cumulativePlastics += plastics;
        cumulativeCO2 += co2;

        yearMap.set(year, {
            metals: cumulativeMetals,
            plastics: cumulativePlastics,
            co2: cumulativeCO2,
        });
    });

    const result: { label: string; metals: number; plastics: number; co2: number }[] = [];

    for (let y = startYear; y <= currentYear; y++) {
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

// Returns cumulative emissions for all years from first donation to current year.
export function getAllTimeData(devices: any[]) {
    if (devices.length === 0) return [];

    const firstYear = new Date(devices[0].date_donated).getFullYear();
    const currentYear = new Date().getFullYear();

    let cumulativeMetals = 0;
    let cumulativePlastics = 0;
    let cumulativeCO2 = 0;

    const yearMap = new Map<number, { metals: number; plastics: number; co2: number }>();

    devices.forEach((d) => {
        const date = new Date(d.date_donated);
        const year = date.getFullYear();

        const metals =
            (d.ferrous_metals || 0) +
            (d.aluminum || 0) +
            (d.copper || 0) +
            (d.other_metals || 0);
        const plastics = d.plastics || 0;
        const co2 = d.co2_emissions || 0;

        cumulativeMetals += metals;
        cumulativePlastics += plastics;
        cumulativeCO2 += co2;

        yearMap.set(year, {
            metals: cumulativeMetals,
            plastics: cumulativePlastics,
            co2: cumulativeCO2,
        });
    });

    const result: { label: string; metals: number; plastics: number; co2: number }[] = [
        { label: '', metals: 0, plastics: 0, co2: 0 } // origin point
    ];

    for (let y = firstYear; y <= currentYear; y++) {
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

