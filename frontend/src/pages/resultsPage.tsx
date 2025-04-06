import { calculateCO2Emissions, calculateMaterialComposition } from '../utils/ewasteCalculations';
import { DeviceInfo } from './deviceInfoSubmission';
import { useLocation, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import supabase from '../utils/supabase';
import { useEffect, useState } from 'react';
import { getQuarterlyData, getOneYearMonthlyData, getFiveYearData, getAllTimeData } from '../utils/lineChartUtils';

function ResultsPage() {
    const location = useLocation();
    const devices_from_submission = location.state?.devices as DeviceInfo[] || [];

    const [userDevices, setUserDevices] = useState<any[]>([]);

    //Line Chart Data
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [selectedRange, setSelectedRange] = useState('Quarter');

    useEffect(() => {
        const fetchUserDevices = async () => {
            const { data: { user } } = await supabase.auth.getUser(); // Get current user

            if (!user) {
                console.error("User not authenticated");
                return;
            }

            // Fetch past donations ordered by `date_donated`
            // from oldest to newest
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
        if (userDevices.length === 0) return;

        //set line chart data
        if (selectedRange === 'Quarter') {
            setLineChartData(getQuarterlyData(userDevices));
        } else if (selectedRange === '1 Year') {
            setLineChartData(getOneYearMonthlyData(userDevices));
        } else if (selectedRange === '5 Years') {
            setLineChartData(getFiveYearData(userDevices));
        } else if (selectedRange === 'All Time') {
            setLineChartData(getAllTimeData(userDevices));
        }
    }, [userDevices, selectedRange]);

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

    //Pie chart data
    const pieChartData = [
        { id: 0, value: totalMaterials.ferrousMetal + totalMaterials.aluminum + totalMaterials.copper + totalMaterials.otherMetals, label: "Metals", color: "#6b7280" },
        { id: 1, value: totalMaterials.plastic, label: "Plastics", color: "#10b981" },
        { id: 2, value: totalMaterials.co2Emissions, label: "CO2 Emissions", color: "#facc15" }
    ];

    const totalSum = pieChartData.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className="flex flex-col items-center justify-center p-10">

            <div className="flex w-full gap-6 justify-center mb-6">

                {/* Left side - Title & Description */}
                <div className="w-1/2 p-5 border rounded-lg">
                    <h1 className="text-2xl font-bold text-center">Results</h1>
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


            <div className="w-full p-5 mt-5 border rounded-lg relative">

                {/* Dropdown top-right */}
                <div className="absolute top-4 right-4 z-10">
                    <select
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(e.target.value)}
                        className="border border-[#2E7D32] text-[#2E7D32] font-medium px-4 py-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] bg-white"
                    >
                        <option value="Quarter">Quarter</option>
                        <option value="1 Year">1 Year</option>
                        <option value="5 Years">5 Years</option>
                        <option value="All Time">All Time</option>
                    </select>
                </div>

                {/* Line Chart */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <LineChart
                        width={600}
                        height={300}
                        series={[
                            { data: lineChartData.map((d) => d.metals), label: 'Metals', color: "#6b7280" },
                            { data: lineChartData.map((d) => d.plastics), label: 'Plastics', color: "#10b981" },
                            { data: lineChartData.map((d) => d.co2), label: 'CO2 Emissions', color: "#facc15" },
                        ]}
                        xAxis={[{ data: lineChartData.map((d) => d.label), scaleType: 'point' }]}
                        yAxis={[{ scaleType: 'linear' }]}
                        grid={{ vertical: true, horizontal: true }}
                    />
                </Box>
            </div>


            {/* Next Button */}
            <button className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-1/4 transition duration-200 cursor-pointer hover:brightness-105 mt-5">
                <Link to="/thank-you" className="no-underline">Next</Link>
            </button>
        </div>
    );
}

export default ResultsPage;
