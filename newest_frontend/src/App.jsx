import React from 'react';
import { Outlet } from 'react-router';
import './styles/global/fonts.css';



const App = () => {
    return(
    <div className='mainContainer w-full h-screen bg-[#0A57FF]'>
        <Outlet/>
    </div>
)
};

export default App;
