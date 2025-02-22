import { useState, useEffect } from 'react'
import supabase from '../utils/supabase'
import { useNavigate } from 'react-router-dom'
// interface for DeviceInfo values
export interface DeviceInfo {
    device: string;
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
        manufacturer: '',
        deviceCondition: '',
        weight: ''
    }]);
    const navigate = useNavigate(); // hook to navigate to different pages

    // checking for existing user session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (!session) {
                navigate("/welcome");
            }
        });

        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate]);

    // handles submission of device(s) info to supabase database
    const handleNext = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser(); //getting currently logged in user
        
        // mapping device info to the correct table column attributes for bulk insertion as an array
        const mapToInsert = devices.map((device) => {
            return {
                user_id: user?.id,
                device_type: device.device,
                manufacturer: device.manufacturer,
                device_condition: device.deviceCondition,
                weight: parseFloat(device.weight)
            }
        });
        const { error } = await supabase.from('devices').insert(mapToInsert);

        // error handling
        if (error) {
            console.error('Error inserting devices:', error.message);
            return;
        } else {
            console.log('devices successfully added')
            navigate('/results', { state: { devices } });
        }

    }

    // adds more devices when "+ Add more devices" is clicked
    const addDevice = async (event: React.MouseEvent<HTMLAnchorElement>): Promise<void> => {
        setDevices([...devices, { device: '', manufacturer: '', deviceCondition: '', weight: '' }]);
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

    return (
        <>
            <div className='flex justify-center flex-col items-center text-center'>
                <div className="flex flex-col gap-2 mb-4">
                    <h1 className="text-2xl">Details</h1>
                    <p>Enter device details below</p>
                </div>
                <div className="flex flex-col w-1/3 h-auto p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-gray-100 gap-[2vh]">
                    {/* using map so multiple devices can be added*/}
                    {devices.map((device, index) => (
                        <div className="p-10 border border-gray-300 rounded-md bg-opacity-10 bg-gray-50 shadow-md">
                            <div className='flex flex-col gap-1'>
                                <label className="flex">Device:</label>
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
                    <a onClick={addDevice} className="self-end bg-none hover:underline cursor-pointer">+ Add more devices</a>
                </div>
                <button onClick={handleNext} className="mt-5 border p-2 w-1/4 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600" type="submit">Next</button>
            </div>
        </>
    );
}

export default DeviceInfoSubmission;

