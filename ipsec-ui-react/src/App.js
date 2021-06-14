import React, {useState} from 'react';
import SideBarComponent from './SideBarComponent';
import TopBarComponent from './TopBarComponent';


export default function App(props) {

    return (
        <div className="app">
            <TopBarComponent />
            <SideBarComponent />
        </div>
    )
}
