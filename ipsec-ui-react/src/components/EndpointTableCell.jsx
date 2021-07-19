import React from "react";
import {v4 as uuidv4} from "uuid";

export default function EndpointTableCell(thisEndpoint) {
    const data = thisEndpoint;
    console.log("dump in table cell: ", data);

    if(data) {
        return (
            <>
                <td>
                    <div>{data}</div>
                </td>
            </>
        )
    }


}
