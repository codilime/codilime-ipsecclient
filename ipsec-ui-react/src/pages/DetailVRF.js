import React, {useState, useEffect} from 'react';
import './DetailVRF.scss';
import './NewVRF.scss';
import {v4 as uuidv4} from 'uuid';
import Dump from "../components/Dump";
import axios from "axios";
import {useParams} from "react-router";


export default function DetailViewVrf() {
    const [thisVrfDetail, updateDetailVrf] = useState();
    const [loading, updateLoading] = useState(true);

    const {index} = useParams();
    console.log("detail", thisVrfDetail);

    async function fetchThisVrfDetails() {
        const response = await axios.get('/api/vrfs')

        let data = response.data[index];
        console.log("data", data);
        if (data && Object.keys(data).length > 0) {
            updateDetailVrf(data);
        }
    }

    useEffect(() => {
        fetchThisVrfDetails().then(() => updateLoading(false));
    }, [index]);

    // const [vrfName, updateVrfName] = useState("");

    // useEffect(() => {
    //     updateVrfName("janek");
    // }, [detailVrf]);
    //
    // if (detailVrf == null){
    //     return(
    //         <div>
    //             No data
    //         </div>
    //     )
    // }

    if (loading === true) {
        return(
            <div>fetching data, please wait</div>
        )
    }

    return(
        <div>
            {index}
            <Dump value={thisVrfDetail} />
            {thisVrfDetail.client_name} <br />
            {thisVrfDetail.crypto_ph2[0]}<br />
            {thisVrfDetail.crypto_ph2[1]}<br />
            {thisVrfDetail.crypto_ph2[2]}<br />
        </div>
    )
}

        // <div className="vrf-detail-container">
        //     /vrf/{detailVrf.client_name} <button className="btn red-btn delete-btn">Delete VRF</button> <br />
        //     <div className="vrf-detail-section-container">
        //         <div className="vrf-details-bar">VRF Details</div>
        //         <form>
        //             {/*inputs need to have onChange property responsible for updating their state, ie name change and so on
        //             additionally active checkbox needs some kind of a handler to display proper value*/}
        //             <div className="vrf-column-1">
        //                 <div className="vrf-column-item">
        //                     <label htmlFor="client_name">Name:</label>
        //                     <input type="text"
        //                            name="client_name"
        //                            id="client_name"
        //                            // defaultValue={detailVrf.client_name}
        //                            value={vrfName}
        //                            onChange={event => updateVrfName(event.target.value)}
        //                     />
        //                 </div>
        //                 <div className="vrf-column-item">
        //                     <input type="checkbox" name="active" id="active"/>
        //                     <label htmlFor="Active">Active</label>
        //                 </div>
        //                 <button className="btn" id="save-changes-to-vrf-button">Save changes</button>
        //             </div>
        //             <div className="vrf-column-2">
        //                 <div className="vrf-column-item-number">
        //                     <label htmlFor="vlan">VLAN</label>
        //                     <input type="number"
        //                            name="vlan"
        //                            id="vlan"
        //                            step="1"
        //                            readOnly={detailVrf.vlan}
        //                            value={detailVrf.vlan}
        //                     />
        //                 </div>
        //                 <div className="vrf-column-item-number">
        //                     <label htmlFor="local_as">BGP local AS</label>
        //                     <input type="number"
        //                            name="local_as" id="local_as"
        //                            step="1"
        //                            readOnly={detailVrf.local_as}
        //                            value={detailVrf.local_as}
        //                     />
        //                 </div>
        //             </div>
        //             <div className="vrf-column-3">
        //                 <div className="vrf-crypto-container">
        //                     <label htmlFor="crypto_ph1">Crypto phase 1</label>
        //                     <input type="text" id="crypto_ph1_1" name="crypto_ph1" readOnly={detailVrf.crypto_ph1[0]} value={detailVrf.crypto_ph1[0]} />
        //                     <input type="text" id="crypto_ph1_2" name="crypto_ph1" readOnly={detailVrf.crypto_ph1[1]} value={detailVrf.crypto_ph1[1]} />
        //                     <input type="text" id="crypto_ph1_3" name="crypto_ph1" readOnly={detailVrf.crypto_ph1[2]} value={detailVrf.crypto_ph1[2]} />
        //                 </div>
        //                 <div className="vrf-crypto-container">
        //                     <label htmlFor="crypto_ph2">Crypto phase 2</label>
        //                     <input type="text" id="crypto_ph2_1" name="crypto_ph2" readOnly={detailVrf.crypto_ph2[0]} value={detailVrf.crypto_ph2[0]} />
        //                     <input type="text" id="crypto_ph2_2" name="crypto_ph2" readOnly={detailVrf.crypto_ph2[1]} value={detailVrf.crypto_ph2[1]} />
        //                     <input type="text" id="crypto_ph2_3" name="crypto_ph2" readOnly={detailVrf.crypto_ph2[2]} value={detailVrf.crypto_ph2[2]} />
        //                 </div>
        //             </div>
        //         </form>
        //     </div>
        //     <div className="vrf-detail-section-container">
        //         <table id="endpoints-table">
        //             <thead>
        //             <tr>
        //                 <th colSpan="7">
        //                     Endpoints
        //                 </th>
        //             </tr>
        //             </thead>
        //             <tbody>
        //                 <tr>
        //                     <th>Remote IP</th>
        //                     <th>Local IP</th>
        //                     <th>Peer IP</th>
        //                     <th>PSK</th>
        //                     <th>NAT</th>
        //                     <th>BGP</th>
        //                     <th>Action</th>
        //                 </tr>
        //                     {detailVrf && detailVrf.endpoints && detailVrf.endpoints.map(function(endpoint) {
        //                         return (
        //                             <tr key={uuidv4()}>
        //                                 <td>{endpoint.remote_ip_sec}</td>
        //                                 <td>{endpoint.local_ip}</td>
        //                                 <td>{endpoint.peer_ip}</td>
        //                                 <td>{endpoint.psk}</td>
        //                                 <td>{endpoint.nat}</td>
        //                                 <td>{endpoint.bgp}</td>
        //                                 <td>
        //                                     <button className="btn edit-btn">...</button>
        //                                 </td>
        //                             </tr>
        //                         )
        //                     })}
        //             </tbody>
        //         </table>
        //     </div>
        //     <div className="vrf-detail-section-container">
        //         visu
        //     </div>
        //     <Dump value={detailVrf} />
        // </div>
