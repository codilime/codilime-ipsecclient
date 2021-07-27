import React from "react";

export default function Dump(props) {
    let { label, ...otherProps } = props;

    if (label) {
        label = (
            <span>
                <strong>{label || ""}</strong> ={" "}
            </span>
        );
    }

    function isObject(obj) {
        return obj === Object(obj);
    }

    function isFunction(functionToCheck) {
        return (
            functionToCheck &&
            {}.toString.call(functionToCheck) === "[object Function]"
        );
    }

    function prepareObject(object) {
        let newObject = {};

        Object.entries(object).map(([property, value]) => {
            if (isFunction(value)) {
                newObject[property] = "function " + value.name + "()";
            } else {
                newObject[property] = value;
            }
        });

        return newObject;
    }

    function renderSingle(value) {
        if (isObject(value)) {
            value = prepareObject(value);
        }

        return JSON.stringify(prepareObject(value), null, 2);
    }

    function renderProps() {
        let toReturn = [];

        if (Array.isArray(otherProps)) {
            otherProps.map(function (value) {
                toReturn.push(renderSingle(otherProps));
            });
        } else {
            toReturn = renderSingle(otherProps);
        }

        return toReturn;
    }

    return (
        <div style={{ margin: "1rem 0" }}>
            <h3 style={{ fontFamily: "monospace" }} />
            <small>
                <pre style={{ background: "#f0f3f5", padding: ".5rem" }}>
                    {label}
                    {renderProps()}
                </pre>
            </small>
        </div>
    );
}
