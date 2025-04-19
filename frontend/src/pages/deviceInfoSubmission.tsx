import { useState, useEffect } from 'react'
import supabase from '../utils/supabase'
import { useNavigate } from 'react-router-dom'
import { calculateCO2Emissions, calculateMaterialComposition, MaterialComposition } from '../utils/ewasteCalculations'
import { deviceFormOptions, deviceTypes } from '../utils/deviceFormSelections'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {currentBadges} from '../utils/api'

import { User } from '@supabase/supabase-js'
import { Profile } from '../utils/types'
import { IconButton } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

// interface for DeviceInfo values
export interface DeviceInfo {
    device: string;
    model: string;
    manufacturer: string;
    deviceCondition: string;
    weight: string;
    serial_number?: File | string | undefined;
}
const ocr_manufacturers: string[] = [
    "Apple", "Dell", "HP", "Lenovo", "Samsung", "Microsoft", "Acer", "Asus",
];
function DeviceInfoSubmission() {
    // state to store and update device info using DeviceInfo objects in an array
    const [devices, setDevices] = useState<DeviceInfo[]>([{
        device: '',
        model: '',
        manufacturer: '',
        deviceCondition: '',
        weight: '',
        serial_number: undefined
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
    const handleNext = async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        //making sure all fields are filled
        for (let i = 0; i < devices.length; i++) {
            if (devices[i].device === '' || devices[i].model === '' || devices[i].manufacturer === '' || devices[i].deviceCondition === '' || devices[i].weight === '' || devices[i].serial_number === undefined) {
                console.log(devices[i]);
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
            if (device.serial_number instanceof File) {
                // Upload the image to Supabase Storage
            
            }
            return {
                user_id: user.user.id,
                device_type: device.device,
                model: device.model,
                manufacturer: device.manufacturer,
                device_condition: device.deviceCondition,
                weight: parseFloat(device.weight),
                serial_number: typeof device.serial_number === 'string' ? device.serial_number : null, //only save the serial number if it is a string
                serial_number_image_path: null, // this will be updated after the image is uploaded
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
        const { data, error } = await supabase.from('devices').insert(mapToInsert).select(); //actual insertion of devices into supabase database

        const alertText = await checkForBadge(user.user.id);

        // error handling
        if (error) {
            console.error('Error inserting devices:', error.message);
            return;
        } else {
            console.log('devices successfully added')
        }

        //need to submit serial number images to supabase storage if they exist
        for (let i = 0; i < devices.length; i++) {
            const sn_image: File | string | undefined = devices[i].serial_number;
            console.log(data);
            const deviceId: string = data?.[i]?.device_id; // get the device ID from the inserted data
            console.log('deviceId:', deviceId);
            if (sn_image instanceof File) {
                const {data, error:uploadError} = await supabase.storage // upload the image to supabase storage
                    .from('device-serial-numbers')
                    .upload(`${user.user.id}/serial_number_${deviceId}`, sn_image)
                if (uploadError) {
                    console.error('Error uploading serial number image:', uploadError.message);
                    alert('Error uploading serial number image, please enter manually under your profile page');
                } else {
                    console.log('Serial number image uploaded successfully');
                }
                
                if (data) {
                    // console.log('Attempting to update image path for device:', deviceId);
                    // console.log('Image path:', data.path);
                    const { data: updateResult, error: updateError } = await supabase
                        .from('devices')
                        .update({ serial_number_image_path: data.path })
                        .eq('device_id', deviceId)
                        .select();
                    if (updateError) {
                        console.error('Error updating device with serial number image path:', updateError.message);
                        alert('Error updating device with serial number image path, please enter manually under your profile page');
                    } else {
                        console.log('Successfully updated:', updateResult);
                    }
                }
            }

        }
        navigate('/results', { state: { devices, alertText} }); //redirect to results page on successful submission
    }

    // adds more devices when "+ Add more devices" is clicked
    const addDevice = async (_event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        setDevices([...devices, { device: '', model: '', manufacturer: '', deviceCondition: '', weight: '' }]);
    }

    // removes a device when "- Remove device" is clicked if there is more than one device
    const removeDevice = async (_event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        const newDevices = [...devices];
        newDevices.pop();
        setDevices(newDevices);
    }

    // function that updates device info values in devices array according to user input
    const handleFormValueChange = (index: number, field: keyof DeviceInfo, value: string | File | undefined) => {
        const newDevices = [...devices];
        if (field === 'serial_number') {
            if (value instanceof File) {
                newDevices[index][field] = value;
            } else if (typeof value === 'string') {
                newDevices[index][field] = value;
            } else {
                newDevices[index][field] = undefined;
            }
        } else {
            newDevices[index][field] = String(value);
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
            {/* Device Submission Form Wrapper */}
            <form onSubmit={handleNext} className='flex justify-center flex-col items-center text-center' encType='multipart/form-data'>
                <div className="flex flex-col gap-2 mt-[4vh] mb-[2vh] text-white">
                    <h1 className="font-semibold text-3xl md:text-5xl drop-shadow-md tracking-widest leading-tight capitalize">
                        Details
                    </h1>
                    <p className="drop-shadow-md text-sm font-medium">
                        Enter device details below
                    </p>
                </div>
                {/*Device Submission Input Box(s)*/}
                <div className="flex flex-col w-[90vw] md:w-[50vw] h-auto p-0 md:p-[4vw] md:pb-0 md:border md:border-gray-300 rounded-2xl bg-opacity-10 bg-auto md:bg-white/50 backdrop-blur-md gap-[2vh]">
                    {devices.map((device, index) => (
                        <div className="p-4 md:p-10 mb-4 border border-gray-300 rounded-md bg-opacity-10 bg-white/50 shadow-md">
                            {/* Device Type Field */}
                            <div className='flex flex-col gap-1'>
                                <label htmlFor={`device-input-${index}`} className="flex mt-[0.5vh]">Device Type:</label>
                                <Autocomplete
                                    id={`device-input-${index}`} 
                                    options={deviceTypes}
                                    value={device.device || ''}
                                    disableClearable
                                    onChange={(_event, newInputValue) => {
                                       handleFormValueChange(index, 'device', newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Device Type"
                                            variant="outlined"
                                            className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-500 focus:outline-none focus:ring-2 bg-white"
                                        />
                                    )}
                                />
                            </div>
                            {/* Device Manufacturer Field */}
                            <div className='flex flex-col gap-1'>
                                <label htmlFor={`manufacturer-input-${index}`} className="flex mt-[0.5vh]">Manufacturer:</label>
                                <Autocomplete
                                    id={`manufacturer-input-${index}`}
                                    freeSolo 
                                    options={Object.keys(deviceFormOptions[device.device] || {})}
                                    value={device.manufacturer || ''}
                                    onInputChange={(_event, newInputValue) => {
                                       handleFormValueChange(index, 'manufacturer', newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Manufacturer"
                                            variant="outlined"
                                            className="w-full border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 bg-white"
                                        />
                                    )}
                                />
                            </div>
                            {/* Device Model Field */}
                            <div className='flex flex-col gap-1'>
                                <label htmlFor={`model-input-${index}`} className="flex mt-[0.5vh]">Model:</label>
                                <Autocomplete
                                    id={`model-input-${index}`}
                                    freeSolo 
                                    options={deviceFormOptions[device.device]?.[device.manufacturer] || []}
                                    value={device.model || ''}
                                    onInputChange={(_event, newInputValue) => {
                                       handleFormValueChange(index, 'model', newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Model"
                                            variant="outlined"
                                            className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-500 focus:outline-none focus:ring-2 bg-white"
                                        />
                                    )}
                                />
                            </div>
                            {/* Device Condition Field */}
                            <div className='flex flex-col gap-1'>
                                <label className="flex mt-[0.5vh]">Device Condition:</label>
                                <Autocomplete
                                    id={`device-condition-input-${index}`}
                                    options={['Excellent', 'Lightly Used', 'Worn/Damaged']}
                                    value={device.deviceCondition || ''}
                                    disableClearable
                                    onChange={(_event, newInputValue) => {
                                       handleFormValueChange(index, 'deviceCondition', newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Device Condition"
                                            variant="outlined"
                                            className="w-full border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 bg-white"
                                        />
                                    )}
                                    
                                />
                            </div>
                            {/* Device Weight Field */}
                            <div className='flex flex-col gap-1'>
                                <label className="flex mt-[0.5vh]">Weight(lbs):</label>
                                <TextField
                                    type="number"
                                    placeholder="Value"
                                    variant="outlined"
                                    value={device.weight || ''} 
                                    onChange={(e) => handleFormValueChange(index, 'weight', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 bg-white"
                                />
                            </div>
                            {/* Serial Number Input Field or Upload Box */}
                            <div className="flex flex-col gap-1">
                                <label className="flex mt-[0.5vh]">Serial Number:</label>
                                {/* if the device of a manufacturer Hendricks has serial_number data for, allow image upload. Else, use manual input. */}
                                {ocr_manufacturers.includes(devices[index].manufacturer) ? (
                                    <>
                                        <input
                                            id={`serial_number_${index}`}
                                            type="file"
                                            accept="image/*"
                                            onClick={e => {(e.target as HTMLInputElement).value = ''}} // Clear the input value to allow re-uploading the same file
                                            onChange={e => handleFormValueChange(index, 'serial_number', e.target.files?.[0] || undefined)}
                                            className="hidden"
                                        />
                                        <label htmlFor={`serial_number_${index}`} className="w-full border border-gray-300 rounded-md pl-3 p-2 placeholder-gray-500 focus:outline-none focus:ring-2 bg-white hover:cursor-pointer ">Upload Image</label>
                                        {/* preview the uploaded image if it exists */}
                                        { devices[index].serial_number && typeof devices[index].serial_number !== 'string' ? (
                                            <div>
                                                <img
                                                    src={URL.createObjectURL(devices[index].serial_number as File)}
                                                    alt="Preview"
                                                    className="max-h-40 object-contain border border-gray-300 rounded justify-self-center mt-2 mb-2"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleFormValueChange(index, 'serial_number', undefined)}
                                                    className="text-right text-red-500 underline hover:text-red-700 hover:text-text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            ) : null
                                        }
                                    </>
                                ) : (
                                    // <input type="text" placeholder="Serial Number" onChange={e => handleFormValueChange(index, 'serial_number', e.target.value)} className="w-full border border-gray-300 rounded-md pl-3 p-2 placeholder-gray-500 focus:outline-none focus:ring-2 bg-white" />
                                    <TextField
                                        type="text"
                                        placeholder="Serial Number"
                                        variant="outlined"
                                        value={device.serial_number || ''}
                                        onChange={(e) => handleFormValueChange(index, 'serial_number', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 bg-white"
                                    />
                                )}
                                
                            </div>
                        </div>
                    ))}
                    {/* Remove/Add Devices */}
                    <div className="flex-col my-[2vh] md:my-[2vh] hidden md:flex">
                        <a onClick={addDevice} className="hidden md:flex self-end bg-none hover:underline cursor-pointer">
                            + Add a device
                        </a>
                        {devices.length > 1 ? 
                            <a onClick={removeDevice} className="hidden md:flex self-end bg-none hover:underline cursor-pointer">
                                - Remove device
                            </a> 
                            : 
                            null
                        }
                    </div> 
                </div>
                {/* On Mobile, Remove/Add are Buttons */}
                <div className="flex justify-center items-center gap-6 md:hidden mt-[1vh]">
                        <button
                            onClick={addDevice}
                            className="bg-white text-green-600 border border-green-300 rounded-full w-12 h-12 shadow-md hover:bg-green-50 active:scale-95 transition"
                            aria-label="Add Device"
                            type="button"
                        >
                            <AddCircleIcon fontSize="large" />
                        </button>
                        { devices.length > 1 ? 
                            <button
                                onClick={removeDevice}
                                className="bg-white text-red-600 border border-red-300 rounded-full w-12 h-12 shadow-md hover:bg-red-50 active:scale-95 transition"
                                aria-label="Remove Device"
                                type='button'
                            >
                                <RemoveCircleIcon fontSize="large" />
                            </button> 
                            : 
                            null
                        }
                </div>
                <button className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-4 px-10 m-10 mt-5 md:mt-10 rounded-full w-[90vw] md:w-1/4 transition duration-200 cursor-pointer hover:brightness-105" type="submit">
                    Next
                </button>
            </form>
        </>
    );
}

export default DeviceInfoSubmission;

