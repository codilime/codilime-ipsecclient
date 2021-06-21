import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MainView from "./MainView";
import './App.scss';


export default function App() {

    return (
        <div className="app-container">
            <TopBar />
            <Sidebar />
            <MainView />
        </div>
    )
}
