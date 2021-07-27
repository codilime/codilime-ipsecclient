import React from "react";

export default function EndpointTableCell(props) {
  const cellValue = props.endpointTableValue;
  console.log(cellValue);

  function checkboxTemporaryHandler() {
    console.log("changing");
  }

  if (typeof cellValue === "boolean") {
    if (cellValue === true) {
      return (
        <td>
          <input type="checkbox" checked onChange={checkboxTemporaryHandler} />
        </td>
      );
    }
    return (
      <td>
        <input type="checkbox" onChange={checkboxTemporaryHandler} />
      </td>
    );
  }

  return <td>{cellValue}</td>;
}
