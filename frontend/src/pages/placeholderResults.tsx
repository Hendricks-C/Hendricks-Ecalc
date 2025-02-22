import { calculateCO2Emissions, calculateMaterialComposition } from './ewasteCalculations'
import {DeviceInfo} from './deviceInfoSubmission'

function PlaceholderResults(props: {device: DeviceInfo[]}) {
    return (
        <>
            <h1>Results</h1>
            <div>
                {props.device.map((device, index) => (
                    <div key={index}>
                        <h2>Device {index + 1}</h2>
                        <p>Device: {device.device}</p>
                        <p>Manufacturer: {device.manufacturer}</p>
                        <p>Device Condition: {device.deviceCondition}</p>
                        <p>Weight: {device.weight} lbs</p>
                        <h3>Material Composition</h3>
                        <p>Ferrous Metal: {calculateMaterialComposition(device).ferrousMetal} lbs</p>
                        <p>Aluminum: {calculateMaterialComposition(device).aluminum} lbs</p>
                        <p>Copper: {calculateMaterialComposition(device).copper} lbs</p>
                        <p>Other Metals: {calculateMaterialComposition(device).otherMetals} lbs</p>
                        <p>Plastic: {calculateMaterialComposition(device).plastic} lbs</p>
                        <p>PCB: {calculateMaterialComposition(device).pcb} lbs</p>
                        <p>Flat Panel Display Module: {calculateMaterialComposition(device).flatPanelDisplayModule} lbs</p>
                        <p>CRT Glass and Lead: {calculateMaterialComposition(device).crtGlassAndLead} lbs</p>
                        <p>Battery: {calculateMaterialComposition(device).battery} lbs</p>
                        <h3>CO2 Emissions Saved</h3>
                        <p>{calculateCO2Emissions(device)} lbs</p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default PlaceholderResults;