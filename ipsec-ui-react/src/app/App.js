import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DetailVRF from '../pages/DetailVRF';
import NewVRF from "../pages/NewVRF";
import './App.scss';


export default function App() {
    const [VRFConnections, updateVRFConnections] = useState([]);

    async function fetchVRFsData() {
        const response = await axios.get('/api/vrfs');

        let data = response.data;
        if (Array.isArray(data)) {
            updateVRFConnections(data);
        }
    }

    useEffect(() => {
        fetchVRFsData();
    }, []);


    return (
        <Router>
            <div className="app-container">
                <TopBar />
                <Sidebar VRFConnections={VRFConnections} />
                <div className="main-view-container">
                    <Switch>
                        <Route path="/vrf/create" render={routeProps => <div><NewVRF routeProps={routeProps} /></div>} />
                        <Route path="/vrf/:index" render={routeProps => <div style={{ display: "flex" }}>
                            <DetailVRF VRFdata={VRFConnections[routeProps.match.params.index]}/>
                        </div>} />
                        <Route path="*" render={() => 404} />
                    </Switch>
                </div>
            </div>
        </Router>
    )
}
