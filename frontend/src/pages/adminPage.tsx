import {useState, useEffect} from 'react';
import supabase from '../utils/supabase'
import { useNavigate } from 'react-router-dom'
import {useReactTable, ColumnDef, getCoreRowModel, flexRender} from '@tanstack/react-table'

interface DevicesQuery{
    name: string;
    device_type: string;
    weight: number;
    device_condition: string;
    manufacturer: string;
    date_donated: string;
    ferrous_metals: number;
    aluminum: number;
    copper: number;
    other_metals: number;
    plastics: number;
    pcb: number;
    flat_panel_display_module: number;
    crt_glass_and_lead: number;
    batteries: number;
    co2_emissions: number;
}

function AdminPage() {
    const [devices, setDevices] = useState<DevicesQuery[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(true);
    const navigate = useNavigate();
    // checking for existing user session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (!session) {
                navigate("/welcome");
            }
            setIsAdmin(session?.user?.email?.endsWith('@gmail.com') || false);
            if (!isAdmin) {
                navigate("/welcome");
            }
        });

        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate, isAdmin]);


    //fetching devices data from supabase database
    useEffect(()=>{
        async function fetchData() {
            const { data, error } = await supabase
                .from('devices')
                .select('device_type, weight, device_condition, manufacturer, date_donated, ferrous_metals, aluminum, copper, other_metals, plastics, pcb, flat_panel_display_module, crt_glass_and_lead, batteries, co2_emissions, profiles (first_name, last_name)')
            if (error) {
                console.error("Error fetching devices:", error.message);
            } else {
                console.log("Devices fetched successfully:", data);

                //flattening the data and formatting it to be displayed in the table
                const formattedData = data.map((device) => {
                    return (
                        {
                            name: `${device.profiles.first_name} ${device.profiles.last_name}`,
                            device_type: device.device_type,
                            weight: device.weight,
                            device_condition: device.device_condition,
                            manufacturer: device.manufacturer,
                            date_donated: device.date_donated,
                            ferrous_metals: device.ferrous_metals,
                            aluminum: device.aluminum,
                            copper: device.copper,
                            other_metals: device.other_metals,
                            plastics: device.plastics,
                            pcb: device.pcb,
                            flat_panel_display_module: device.flat_panel_display_module,
                            crt_glass_and_lead: device.crt_glass_and_lead,
                            batteries: device.batteries,
                            co2_emissions: device.co2_emissions
                        }
                    )
                }) ?? [];
                setDevices(formattedData);
                console.log('Devices', devices);
            }
        }
        fetchData();
        
    },[]);

    //columns definition for tanstack table
    const columns: ColumnDef<DevicesQuery>[] = [
        { accessorKey: "name", header: "Full Name", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "device_type", header: "Device Type", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "weight", header: "Weight (lbs)", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "device_condition", header: "Condition", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "manufacturer", header: "Manufacturer", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "date_donated", header: "Date Donated", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "ferrous_metals", header: "Ferrous Metals", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "aluminum", header: "Aluminum", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "copper", header: "Copper", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "other_metals", header: "Other Metals", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "plastics", header: "Plastics", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "pcb", header: "PCB", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "flat_panel_display_module", header: "Flat Panel Display Module", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "crt_glass_and_lead", header: "CRT Glass and Lead", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "batteries", header: "Batteries", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "co2_emissions", header: "CO2 Emissions", cell: (props) => <p>{String(props.getValue())}</p> },
    ];

    //admin table react-table instance declaration
    const adminTable = useReactTable({
        data: devices,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className='flex flex-col justify-center rounded-lg bg-white border border-gray-300 m-4'>
                <div className="m-8 flex flex-row gap-2 mb-0">
                    <table className="table-auto border-collapse">
                        <tr className='[&>td>button]:border-neutral-200 [&>td>button]:border [&>td>button]:bg-gray-100 [&>td>button]:w-full [&>td>button]:py-2 [&>td>button]:px-4 [&>td>button]:text-black [&>td]:border-gray-100'>
                            <td><button className='rounded-l-md'>All</button></td>
                            <td><button className=''>Donor</button></td>
                            <td><button className=''>Devices</button></td>
                            <td><button className='rounded-r-md'>Total</button></td>
                        </tr>
                    </table>
                    <input
                        type="text"
                        placeholder="Search"
                        className="border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white w-full"
                    />
                </div>

                <div className='flex overflow-auto m-8 border border-gray-300 rounded-xl h-[60vh]'>
                    <table className="table-auto border-collapse rounded-xl border-neutral-200 bg-gray-100 w-full">
                        <thead>
                            {adminTable.getHeaderGroups().map(headerGroup => 
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(
                                        header => 
                                        <th key={header.id} className='border-b-[0.5px] border-neutral-200 px-4 py-2 text-left'>
                                            {String(header.column.columnDef.header)}
                                        </th>
                                    )}
                                </tr>
                            )}
                            
                        </thead>
                        <tbody>
                            {adminTable.getRowModel().rows.map(row => 
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => 
                                        <td key={cell.id} className='border-b-[0.5px] border-neutral-200 px-4 py-2 text-left'>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )}                        
                        </tbody>
                    </table>              
                </div>
            </div>
        </>
    )
}


export default AdminPage;