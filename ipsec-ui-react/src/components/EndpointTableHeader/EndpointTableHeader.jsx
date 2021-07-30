import React from "react";

import './EndpointTableHeader.scss';

export default function EndpointTableHeader(props) {
    const {hardwareSupport
    } = props;

    if(hardwareSupport) {
        return (
            <tr>
                <th>Remote IP</th>
                <th>Local IP</th>
                <th>Peer IP</th>
                <th>PSK</th>
                <th>Remote AS</th>
                <th>Source interface</th>
                <th>BGP</th>
                <th>Action</th>
            </tr>
        );
    } else {
        return (
            <tr>
                <th>Remote IP</th>
                <th>Local IP</th>
                <th>Peer IP</th>
                <th>PSK</th>
                <th>NAT</th>
                <th>BGP</th>
                <th>Action</th>
            </tr>
        );
    }
}