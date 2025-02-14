import {useState, useEffect} from 'react';
import supabase from '../utils/supabase'
import { useNavigate } from 'react-router-dom'


function AdminPage() {
    
    useEffect(()=>{
        
    });
    return (
        <>
            <div>
                <table>
                    <th>Donor</th>
                    <th>Device</th>
                    <th>Weight(lbs)</th>
                    <th>Manufacturer</th>
                    <th>Condition</th>
                    <th>Date Donated</th>
                </table>
            </div>
        </>
    )
}


export default AdminPage;