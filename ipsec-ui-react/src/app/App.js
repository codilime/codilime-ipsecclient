import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MainView from "./MainView";
import './App.scss';


export default function App() {
    const [VRFConnections, updateVRFConnections] = useState([]);

    async function fetchVRFsData() {
        const response = await axios.get('http://172.18.0.2/api/vrfs');

        let data = response.data;
        updateVRFConnections(data);
        if (Array.isArray(data.list)) {
        }

    }

    useEffect(() => {
        fetchVRFsData();
    }, []);


    return (
        <div className="app-container">
            <TopBar />
            <Sidebar VRFConnections={VRFConnections} />
            <MainView VRFDetails={VRFConnections}/>
        </div>
    )
}
