import { Link } from 'react-router-dom'
import Laptop from '../assets/laptop.png'
import { useEffect, useState } from 'react'
import supabase from '../utils/supabase.ts'

function ThankYou() {

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-white text-2xl sm:text-5xl md:text-7xl font-bold font-bitter leading-large tracking-widest capitalize drop-shadow-md mt-20">
                Thank you!
            </h1>

            <img src={Laptop} alt="Laptop" className="w-[50%] h-auto" />
            <Link to="/Home">
                <button className="bg-[#FFE017] text-white font-bold text-xl md:text-2xl px-10 md:px-20 py-3 rounded-full shadow-md hover:brightness-105 transition mb-5 md:mb-10">
                    HOME
                </button>
            </Link>
        </div>
    );
}

export default ThankYou;