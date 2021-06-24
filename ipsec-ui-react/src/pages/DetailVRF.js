import React from 'react';
import Dump from "../components/Dump";

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
        <div>
            /VRFs/{detailVRF.client_name}<br />
            {detailVRF.vlan}<br />
            {detailVRF.crypto_ph1}<br />
            {detailVRF.crypto_ph2}<br />
            <Dump value={detailVRF}/>
        </div>
    )
}