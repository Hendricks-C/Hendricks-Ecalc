import { calculateCO2Emissions, calculateMaterialComposition } from '../utils/ewasteCalculations';
import { DeviceInfo } from './deviceInfoSubmission';
import { useLocation, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import supabase from '../utils/supabase';
import { useEffect, useState } from 'react';

function ResultsPage() {
    const location = useLocation();
    const devices_from_submission = location.state?.devices as DeviceInfo[] || [];

    const [userDevices, setUserDevices] = useState<any[]>([]);
    const [cumulativeChartData, setCumulativeChartData] = useState<any[]>([]);


    useEffect(() => {
        const fetchUserDevices = async () => {
            const { data: { user } } = await supabase.auth.getUser(); // Get current user

            if (!user) {
                console.error("User not authenticated");
                return;
            }

            // Fetch past donations order by `date_donated`
            const { data, error } = await supabase
                .from('devices')
                .select('*')
                .eq('user_id', user.id)
                .order('date_donated', { ascending: true });

            if (error) {
                console.error("Error fetching past submissions:", error.message);
            } else {
                setUserDevices(data || []);
            }
        };

        fetchUserDevices();
    }, []);

    useEffect(() => {
        console.log("Fetched User Devices:", userDevices); // Check if we have valid data

        if (userDevices.length > 0) {
            const updatedChartData = aggregateCumulativeDataByMonth(userDevices);
            setCumulativeChartData(updatedChartData);
            //console.log("Updated Chart Data:", updatedChartData);
        }
    }, [userDevices]);



    // Function to aggregate cumulative emissions by month
    const aggregateCumulativeDataByMonth = (devices: any[]) => {
        const monthlyData: Record<string, { metals: number; plastics: number; co2: number }> = {};

        let cumulativeMetals = 0;
        let cumulativePlastics = 0;
        let cumulativeCO2 = 0;

        devices.forEach(device => {
            if (!device.date_donated) {
                console.warn("Skipping device with missing date:", device);
                return;
            }

            // Debugging
            //console.log("Processing device:", device);

            // Extract materials from db
            const metals =
                (device.ferrous_metals || 0) +
                (device.aluminum || 0) +
                (device.copper || 0) +
                (device.other_metals || 0);
            const plastics = device.plastics || 0;
            const co2 = device.co2_emissions || 0;

            // Parse date to month format
            const month = new Date(device.date_donated).toLocaleString('default', {
                month: 'short',
                year: 'numeric',
            });

            // Cumulative sum
            cumulativeMetals += metals;
            cumulativePlastics += plastics;
            cumulativeCO2 += co2;

            // Store cumulative values per month
            if (!monthlyData[month]) {
                monthlyData[month] = { metals: 0, plastics: 0, co2: 0 };
            }

            monthlyData[month].metals = cumulativeMetals;
            monthlyData[month].plastics = cumulativePlastics;
            monthlyData[month].co2 = cumulativeCO2;
        });

        console.log("Final Aggregated Data:", monthlyData);

        return Object.keys(monthlyData).map(month => ({
            month,
            metals: monthlyData[month].metals,
            plastics: monthlyData[month].plastics,
            co2: monthlyData[month].co2,
        }));
    };




    const totalMaterials = devices_from_submission.reduce((acc, device) => {
        const materials = calculateMaterialComposition(device);
        return {
            ferrousMetal: acc.ferrousMetal + materials.ferrousMetal,
            aluminum: acc.aluminum + materials.aluminum,
            copper: acc.copper + materials.copper,
            otherMetals: acc.otherMetals + materials.otherMetals,
            plastic: acc.plastic + materials.plastic,
            battery: acc.battery + materials.battery,
            co2Emissions: acc.co2Emissions + calculateCO2Emissions(device),

            pcb: acc.pcb + materials.pcb,
            flatPanelDisplayModule: acc.flatPanelDisplayModule + materials.flatPanelDisplayModule,
            crtGlassAndLead: acc.crtGlassAndLead + materials.crtGlassAndLead,
        };
    }, {
        ferrousMetal: 0,
        aluminum: 0,
        copper: 0,
        otherMetals: 0,
        plastic: 0,
        battery: 0,
        co2Emissions: 0,


        pcb: 0,
        flatPanelDisplayModule: 0,
        crtGlassAndLead: 0,
    });

    const pieChartData = [
        { id: 0, value: totalMaterials.ferrousMetal + totalMaterials.aluminum + totalMaterials.copper + totalMaterials.otherMetals, label: "Metals", color: "#6b7280" },
        { id: 1, value: totalMaterials.plastic, label: "Plastics", color: "#10b981" },
        { id: 2, value: totalMaterials.co2Emissions, label: "CO2 Emissions", color: "#facc15" }
    ];

    const totalSum = pieChartData.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className="flex flex-col items-center justify-center p-10">

            <div className="flex justify-between w-full">

                {/* Left side - Title & Description */}
                <div className="w-1/2 p-5 border rounded-lg">
                    <h1 className="text-2xl font-bold">Results</h1>
                    <p>Here is where a description of the results is displayed!</p>
                </div>

                {/* Right side - Material Composition List */}
                <div className="w-1/3 p-5 border rounded-lg">
                    <h2 className="text-xl font-bold">Material Breakdown</h2>
                    <p>Ferrous Metals: {totalMaterials.ferrousMetal} lbs</p>
                    <p>Aluminum: {totalMaterials.aluminum} lbs</p>
                    <p>Copper: {totalMaterials.copper} lbs</p>
                    <p>Other Metals: {totalMaterials.otherMetals} lbs</p>
                    <p>Plastic: {totalMaterials.plastic} lbs</p>
                    <p>Batteries: {totalMaterials.battery} lbs</p>
                    <p>CO2 Emissions: {totalMaterials.co2Emissions} lbs</p>
                    <p className="mt-2 font-bold">Not in Figma:</p>
                    <p>PCB: {totalMaterials.pcb} lbs</p>
                    <p>Flat Panel Display Module: {totalMaterials.flatPanelDisplayModule} lbs</p>
                    <p>CRT Glass and Lead: {totalMaterials.crtGlassAndLead} lbs</p>

                </div>
            </div>

            <div className="w-full p-5 mt-5 border rounded-lg">
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <PieChart
                        height={300}
                        series={[
                            {
                                data: pieChartData,
                                innerRadius: 100,
                                arcLabel: (params) => `${((params.value / totalSum) * 100).toFixed(0)}%`, // Show percentage
                                arcLabelMinAngle: 20,
                            },
                        ]}
                        skipAnimation={true} // Disables animation
                    />
                </Box>
            </div>

            <div className="w-full p-5 mt-5 border rounded-lg">
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <LineChart
                        width={600}
                        height={300}
                        series={[
                            { data: cumulativeChartData.map((d) => d.metals), label: 'Metals', color: "#6b7280" },
                            { data: cumulativeChartData.map((d) => d.plastics), label: 'Plastics', color: "#10b981" },
                            { data: cumulativeChartData.map((d) => d.co2), label: 'CO2 Emissions', color: "#facc15" },
                        ]}
                        xAxis={[{ data: cumulativeChartData.map((d) => d.month), scaleType: 'point' }]}
                        yAxis={[{ scaleType: 'linear' }]}
                        grid={{ vertical: true, horizontal: true }}
                    />
                </Box>
            </div>


            {/* Next Button */}
            <button className="mt-5 border p-2 w-1/4 rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600">
                <Link to="/profile" className="no-underline">Next -Profile</Link>
            </button>
        </div>
    );
}

export default ResultsPage;
