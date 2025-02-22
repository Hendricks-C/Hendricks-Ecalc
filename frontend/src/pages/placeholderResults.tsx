import { calculateCO2Emissions, calculateMaterialComposition } from './ewasteCalculations'
import {DeviceInfo} from './deviceInfoSubmission'
import { useLocation } from 'react-router-dom';


function PlaceholderResults() {
    const location = useLocation();
    const devices = location.state.devices as DeviceInfo[];

    return (
        <>
            <h1>Results</h1>
            <div>
                {devices.map((device, index) => (
                    <div key={index}>
                        <h2>Device {index + 1}</h2>
                        <p>Device: {device.device}</p>
                        <h3>Material Composition</h3>
                        <p>Ferrous Metal: {calculateMaterialComposition(device).ferrousMetal} kgs</p>
                        <p>Aluminum: {calculateMaterialComposition(device).aluminum} kgs</p>
                        <p>Copper: {calculateMaterialComposition(device).copper} kgs</p>
                        <p>Other Metals: {calculateMaterialComposition(device).otherMetals} kgs</p>
                        <p>Plastic: {calculateMaterialComposition(device).plastic} kgs</p>
                        <p>PCB: {calculateMaterialComposition(device).pcb} kgs</p>
                        <p>Flat Panel Display Module: {calculateMaterialComposition(device).flatPanelDisplayModule} kgs</p>
                        <p>CRT Glass and Lead: {calculateMaterialComposition(device).crtGlassAndLead} kgs</p>
                        <p>Battery: {calculateMaterialComposition(device).battery} kgs</p>
                        <h3>CO2 Emissions Saved</h3>
                        <p>{calculateCO2Emissions(device)} kgs</p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default PlaceholderResults;