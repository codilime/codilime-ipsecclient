import React from 'react';
import Dump from "../components/Dump";
import './DetailVRF.scss';

export default function detailViewVrf(props) {
    const detailVRF = props.VRFdata;

    if(detailVRF == null){
        return(
            <div>
                error, no data
            </div>
        )
    }

    return(
        <div className="vrf-detail-container">
            /vrf/{detailVRF.client_name}<br />
            <div className="vrf-detail-section-container">
                main settings
            </div>
            <div className="vrf-detail-section-container">
                endpoints
            </div>
            <div className="vrf-detail-section-container">
                visu
            </div>
            {detailVRF.vlan}<br />
            {detailVRF.crypto_ph1}<br />
            {detailVRF.crypto_ph2}<br />
            <Dump value={detailVRF}/>
        </div>
    )
}