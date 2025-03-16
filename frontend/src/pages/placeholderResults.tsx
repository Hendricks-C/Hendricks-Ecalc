import { calculateCO2Emissions, calculateMaterialComposition } from '../utils/ewasteCalculations'
import {DeviceInfo} from './deviceInfoSubmission'
import { useLocation } from 'react-router-dom';
import Alert from '../components/alert';

function PlaceholderResults() {
    const location = useLocation();
    const devices = location.state.devices as DeviceInfo[];
    const showBadgeAlert = location.state?.alertText;

    return (
        <>
            {showBadgeAlert && <Alert text={showBadgeAlert} show={true} />}
            <h1 className='m-[1vw]'>Results</h1>
            <div className='flex flex-row justify-start'>
                {devices.map((device, index) => (
                    <div className="flex flex-col justify-center m-[1vw]" key={index}>
                        <h2>Device {index + 1}</h2>
                        <p>Device: {device.device}</p>
                        <h3>Materials Saved:</h3>
                        <div className='ml-[1vw]'>
                            <p>Ferrous Metals: {calculateMaterialComposition(device).ferrousMetal} lbs</p>
                            <p>Aluminum: {calculateMaterialComposition(device).aluminum} lbs</p>
                            <p>Copper: {calculateMaterialComposition(device).copper} lbs</p>
                            <p>Other Metals: {calculateMaterialComposition(device).otherMetals} lbs</p>
                            <p>Plastic: {calculateMaterialComposition(device).plastic} lbs</p>
                            <p>PCB: {calculateMaterialComposition(device).pcb} lbs</p>
                            <p>Flat Panel Display Module: {calculateMaterialComposition(device).flatPanelDisplayModule} lbs</p>
                            <p>CRT Glass and Lead: {calculateMaterialComposition(device).crtGlassAndLead} lbs</p>
                            <p>Batteries: {calculateMaterialComposition(device).battery} lbs</p>
                        </div>
                        <h3>CO2 Emissions Saved:</h3>
                            <p className='ml-[1vw]'>{calculateCO2Emissions(device)} lbs</p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default PlaceholderResults;