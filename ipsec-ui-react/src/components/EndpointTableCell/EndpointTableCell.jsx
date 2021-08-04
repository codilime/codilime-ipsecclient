import React from "react";

export default function EndpointTableCell(props) {
    const { value } = props;

    function handleChange() {
        console.log("changing");
    }

    if (typeof value === "boolean") {
        if (value === true) {
            return (
                <td>
                    <input type="checkbox" checked onChange={handleChange} />
                </td>
            );
        }
        return (
            <td>
                <input type="checkbox" onChange={handleChange} />
            </td>
        );
    }

    return <td>{value}</td>;
}
