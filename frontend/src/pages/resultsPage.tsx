import { calculateCO2Emissions, calculateMaterialComposition } from '../utils/ewasteCalculations';
import { DeviceInfo } from './deviceInfoSubmission';
import { useLocation, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';

function ResultsPage() {
    const location = useLocation();
    const devices = location.state?.devices as DeviceInfo[] || [];

    const totalMaterials = devices.reduce((acc, device) => {
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
                {/* TODO */}
            </div>

            {/* Next Button */}
            <button className="mt-5 border p-2 w-1/4 rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600">
                <Link to="/profile" className="no-underline">Next -Profile</Link>
            </button>
        </div>
    );
}

export default ResultsPage;
