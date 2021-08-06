export const tableHeaderSchema = [
    { item: "Remote IP" },
    { item: "Local IP" },
    { item: "Peer IP" },
    { item: "PSK" },
    { item: "NAT" },
    { item: "BGP" },
    { item: "ACTION" },
];

export const emptyEndpointSchema = {
    remote_ip_sec: "",
    local_ip: "",
    peer_ip: "",
    psk: "",
    nat: false,
    bgp: false,
};
export const endpointInputSchema = [
    { type: "text", name: "remote_ip_sec", placeholder: "Enter remote IP" },
    { type: "text", name: "local_ip", placeholder: "Enter local IP" },
    { type: "text", name: "peer_ip", placeholder: "Enter peer IP" },
    { type: "password", name: "psk", placeholder: "Enter PSK" },
    { type: "checkbox", name: "nat" },
    { type: "checkbox", name: "bgp" },
];

export const endpoint = [
    {
        remote_ip_sec: "192.158.1.38",
        local_ip: "192.158.1.38",
        peer_ip: "192.158.1.38",
        psk: "Tajne hasło",
        nat: true,
        bgp: true,
    },
    {
        remote_ip_sec: "192.158.1.38",
        local_ip: "192.158.1.38",
        peer_ip: "192.158.1.38",
        psk: "Tajne hasło",
        nat: true,
        bgp: true,
    },
    {
        remote_ip_sec: "192.158.1.38",
        local_ip: "192.158.1.38",
        peer_ip: "192.158.1.38",
        psk: "Tajne hasło",
        nat: true,
        bgp: true,
    },
];
