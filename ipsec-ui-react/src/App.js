import React, {useState} from 'react';
import SideBar from './SideBar';
import TopBar from './TopBar';


export default function App(props) {

    return (
        <div className="app">
            <TopBar />
            <SideBar />
        </div>
    )
}
