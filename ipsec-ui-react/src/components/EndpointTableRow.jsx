import React  from "react";
import EndpointTableCell from "./EndpointTableCell";
import {v4 as uuidv4} from "uuid";

export default function EndpointTableRow(props) {
    const endpointInRowComponent = props.endpoint;

    if(endpointInRowComponent) {
        return (
            <tr>
                {Object.entries(endpointInRowComponent).map(([key,value]) => {
                    console.log("value", value);
                    let uniqueKey = key + uuidv4();

                    return (
                        <EndpointTableCell
                            key={uniqueKey}
                            endpointTableValue={value}
                        />
                    )
                })}
                <td>
                    <button className="btn edit-btn">...</button>
                </td>
            </tr>
        )
    }
}
