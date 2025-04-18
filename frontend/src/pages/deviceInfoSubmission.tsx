import { useState, useEffect } from 'react'
import supabase from '../utils/supabase'
import { useNavigate } from 'react-router-dom'
import { calculateCO2Emissions, calculateMaterialComposition, MaterialComposition } from '../utils/ewasteCalculations'

import {currentBadges} from '../utils/api'

import { User } from '@supabase/supabase-js'
import { Profile } from '../utils/types'

// interface for DeviceInfo values
export interface DeviceInfo {
    device: string;
    model: string;
    manufacturer: string;
    deviceCondition: string;
    weight: string;
}

const manufacturers = [
    "Acer", "Alienware", "Apple", "Asus", "Averatec", "Clevo", "Compaq", "Dell", "Digital Storm",
    "eMachines", "Everex", "EVGA Corporation", "Falcon Northwest", "Founder", "Fujitsu", "Gateway",
    "Gigabyte Technology", "Google", "Gradiente", "Haier", "Hasee", "HP", "Huawei", "Hyundai",
    "iBall", "IBM", "Lanix", "Lemote", "Lenovo", "LG", "Maingear", "Medion", "Micro-Star International (MSI)",
    "Microsoft", "NEC", "Origin PC", "Panasonic", "Positivo", "Razer", "Samsung Electronics",
    "Sharp", "Sony", "System76", "Toshiba", "Tongfang", "VIA", "Vizio", "Walton", "Xiaomi"
  ];

function DeviceInfoSubmission() {
    // state to store and update device info using DeviceInfo objects in an array
    const [devices, setDevices] = useState<DeviceInfo[]>([{
        device: '',
        model: '',
        manufacturer: '',
        deviceCondition: '',
        weight: ''
    }]);
    const navigate = useNavigate(); // hook to navigate to different pages

    // checking for existing user session
    useEffect(() => {
        async function checkUser(user: User) {
            const { data: rawData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError || !rawData) {
                console.error("Profile lookup failed", userError);
                navigate("/login");
                return;
            }
            
            const userData = rawData as Profile;
            if (userData.two_fa_verified === false) {
                navigate("/login");
            }
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (!session) {
                navigate("/");
            } else {
                checkUser(session.user)
            }
        });

        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate]);

    // handles submission of device(s) info to supabase database
    const handleNext = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        //making sure all fields are filled
        for (let i = 0; i < devices.length; i++) {
            if (devices[i].device === '' || devices[i].model === '' || devices[i].manufacturer === '' || devices[i].deviceCondition === '' || devices[i].weight === '') {
                alert('Please fill in all fields');
                return;
            }
        }

        const { data: user, error: authError } = await supabase.auth.getUser(); //getting currently logged in user
        
        if (authError || !user?.user) {
            console.error("Error fetching user:", authError?.message);
            return;
        }
        
        // function for mapping device info to the correct table column attributes for bulk insertion as an array
        const mapToInsert = devices.map((device) => {
            const materialCompositionSaved: MaterialComposition = calculateMaterialComposition(device);
            const co2Emissions: number = calculateCO2Emissions(device);
            return {
                user_id: user.user.id,
                device_type: device.device,
                model: device.model,
                manufacturer: device.manufacturer,
                device_condition: device.deviceCondition,
                weight: parseFloat(device.weight),
                ferrous_metals: materialCompositionSaved.ferrousMetal,
                aluminum: materialCompositionSaved.aluminum,
                copper: materialCompositionSaved.copper,
                other_metals: materialCompositionSaved.otherMetals,
                plastics: materialCompositionSaved.plastic,
                pcb: materialCompositionSaved.pcb,
                flat_panel_display_module: materialCompositionSaved.flatPanelDisplayModule,
                crt_glass_and_lead: materialCompositionSaved.crtGlassAndLead,
                batteries: materialCompositionSaved.battery,
                co2_emissions: co2Emissions,
            }
        });
        const { error } = await supabase.from('devices').insert(mapToInsert); //actual insertion of devices into supabase database

        const alertText = await checkForBadge(user.user.id);

        // error handling
        if (error) {
            console.error('Error inserting devices:', error.message);
            return;
        } else {
            console.log('devices successfully added')
            navigate('/results', { state: { devices, alertText} });
        }

    }

    // adds more devices when "+ Add more devices" is clicked
    const addDevice = async (event: React.MouseEvent<HTMLAnchorElement>): Promise<void> => {
        setDevices([...devices, { device: '', model: '', manufacturer: '', deviceCondition: '', weight: '' }]);
    }

    // removes a device when "- Remove device" is clicked if there is more than one device
    const removeDevice = async (event: React.MouseEvent<HTMLAnchorElement>): Promise<void> => {
        const newDevices = [...devices];
        newDevices.pop();
        setDevices(newDevices);
    }

    // function that updates device info values in devices array according to user input
    const handleFormValueChange = (index: number, field: keyof DeviceInfo, value: string) => {
        const newDevices = [...devices];
        if (field === 'weight') {
            newDevices[index][field] = String(value);
        } else {
            newDevices[index][field] = value;
        }
        setDevices(newDevices);
    };

    const checkForBadge = async (userId:string) => {
        let gotBadge = "";

        const { data: deviceData, error: deviceError } = await supabase
            .from("devices")
            .select("*")
            .eq("user_id", userId);

        if (deviceError) {
            console.error("Error fetching user donated devices:", deviceError.message);
            return;
        }

        const badgeIds = await currentBadges(userId);

        if (deviceData.length >= 1 && !badgeIds.includes(2)){
            const { error } = await supabase
            .from("user_badges")
            .insert({ user_id: userId, badge_id: 2 });

            if (error) {
                console.error("Error inserting badge for user:", error.message);
                return;
            } else {
                gotBadge = "You have unlocked a badge for donating a device for the first time! ";
            }

        } else if (deviceData.length >= 5 && !badgeIds.includes(3)){
            const { error } = await supabase
            .from("user_badges")
            .insert({ user_id: userId, badge_id: 3 });

            if (error) {
                console.error("Error inserting badge for user:", error.message);
                return;
            } else {
                gotBadge = "You have unlocked a badge for donating 5 devices! ";
            }

        } else if (deviceData.length >= 10 && !badgeIds.includes(4)){
            const { error } = await supabase
            .from("user_badges")
            .insert({ user_id: userId, badge_id: 4 });

            if (error) {
                console.error("Error inserting badge for user:", error.message);
                return;
            } else {
                gotBadge = "You have unlocked a badge for donating 10 devices! ";
            }

        }

        return gotBadge;
    }

    return (
        <>
            <div className='flex justify-center flex-col items-center text-center px-4 py-8 md:px-10 md:py-10'>
                <div className="flex flex-col gap-2 mb-4">
                    <h1 className="text-white text-2xl sm:text-5xl font-bold font-bitter leading-tight tracking-widest capitalize drop-shadow-md">
                        Details
                    </h1>
                    <p className="text-white text-sm sm:text-xl font-medium font-bitter drop-shadow-md">
                        Enter device details below
                    </p>
                </div>
                <div className="flex flex-col w-full max-w-lg h-auto text-left p-4 sm:p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-white/50 backdrop-blur-md gap-[2vh]">
                    {/* using map so multiple devices can be added*/}
                    {devices.map((device, index) => (
                        <div className="p-4 sm:p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-white/50 shadow-md">
                            <div className='flex flex-col gap-1'>
                                <label className="flex">Device Type:</label>
                                <select id="device-options" onChange={e => handleFormValueChange(index, 'device', e.target.value)} className="w-full border border-gray-300 text-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 bg-white">
                                    <option value="none">Device</option>
                                    <option value="CPU">CPU</option>
                                    <option value="Smartphone">Smartphone</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Modern Monitor">Modern Monitor</option>
                                    <option value="Laptop Screen">Laptop Screen</option>
                                    <option value="CRT Monitor (Older, Not In Laptop)">CRT monitor (older, not in laptop)</option>
                                    <option value="Mouse">Mouse</option>
                                    <option value="Keyboard">Keyboard</option>
                                    <option value="External Hard Drive">External hard drive</option>
                                    <option value="Charger">Charger</option>
                                    <option value="Printer">Printer</option>
                                    <option value="Scanner">Scanner</option>
                                    <option value="Copier">Copier</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className="flex">Device Model:</label>
                                <input type="text" placeholder="Model" onChange={e => handleFormValueChange(index, 'model', e.target.value)} className="w-full border border-gray-300 rounded-md pl-3 p-2 placeholder-gray-500 focus:outline-none focus:ring-2 bg-white" />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className="flex">Manufacturer:</label>
                                <select id="device-options" onChange={e => handleFormValueChange(index, 'manufacturer', e.target.value)} className="w-full border border-gray-300 text-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 bg-white">
                                    <option value="none">Manufacturer</option>
                                    {manufacturers.map((manufacturer) => (
                                        <option value={manufacturer}>{manufacturer}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className="flex">Device Condition:</label>
                                <select id="device-options" onChange={e => handleFormValueChange(index, 'deviceCondition', e.target.value)} className="w-full border border-gray-300 text-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 bg-white">
                                    <option value="none">Device Condition</option>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Lightly Used">Lightly Used</option>
                                    <option value="Worn/Damaged">Worn/Damaged</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className="flex">Weight(lbs):</label>
                                <input type="number" placeholder="Value" onChange={e => handleFormValueChange(index, 'weight', e.target.value)} className="w-full border border-gray-300 rounded-md pl-3 p-2 placeholder-gray-500 focus:outline-none focus:ring-2 bg-white" />
                            </div>
                        </div>
                    ))}
                    <div className="flex flex-col">
                        <a onClick={addDevice} className="self-end bg-none hover:underline cursor-pointer">+ Add a device</a>
                        {devices.length > 1 ? <a onClick={removeDevice} className="self-end bg-none hover:underline cursor-pointer">- Remove device</a> : null}
                    </div> 
                </div>

                <button 
                    onClick={handleNext} 
                    className="bg-[#FFE017] shadow-md text-white capitalize text-lg mt-8 py-2 px-10 rounded-full transition duration-200 cursor-pointer hover:brightness-105">
                    Next
                </button>
            </div>
        </>
    );
}

export default DeviceInfoSubmission;

