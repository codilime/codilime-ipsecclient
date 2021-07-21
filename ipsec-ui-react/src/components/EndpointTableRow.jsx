import React  from "react";
import EndpointTableCell from "./EndpointTableCell";
import {v4 as uuidv4} from "uuid";

export default function EndpointTableRow(props) {
    const endpointInRowComponent = props.endpoint;
    // const tableColumns = props.table ['nat', 'remote_ip']


    if(endpointInRowComponent) {
        return (
            <tr>
                {Object.entries(endpointInRowComponent).map(([key,value]) => {  // przefiltrować endpointInRowComponent względem tableColumns i wyświetlić tylko te, które będą matched

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
