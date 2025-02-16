import {useState, useEffect} from 'react';
import supabase from '../utils/supabase'
import { useNavigate } from 'react-router-dom'
import {useReactTable, ColumnDef, getCoreRowModel, flexRender} from '@tanstack/react-table'

interface DevicesQuery{
    user_id: string;
    device_type: string;
    weight: number;
    device_condition: string;
    manufacturer: string;
    date_donated: string;
}

function AdminPage() {
    const [devices, setDevices] = useState<DevicesQuery[]>([]);

    //fetching devices data from supabase database
    useEffect(()=>{
        async function fetchData() {
            const { data, error } = await supabase
                .from('devices')
                .select('user_id, device_type, weight, device_condition, manufacturer, date_donated');
            if (error) {
                console.error("Error fetching devices:", error.message);
            } else {
                setDevices(data ?? []);
            }
        }
        fetchData();
    },[]);

    //columns definition for tanstack table
    const columns: ColumnDef<DevicesQuery>[] = [
        { accessorKey: "user_id", header: "User ID", cell: (props) => <p>{String(props.getValue()).split('-')[0]}</p> },
        { accessorKey: "device_type", header: "Device Type", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "weight", header: "Weight (lbs)", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "device_condition", header: "Condition", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "manufacturer", header: "Manufacturer", cell: (props) => <p>{String(props.getValue())}</p> },
        { accessorKey: "date_donated", header: "Date Donated", cell: (props) => <p>{String(props.getValue())}</p> },
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

                <div className='flex'>
                    <table className="table-auto w-full border-collapse rounded-xl border-neutral-200 bg-gray-100 m-8">
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