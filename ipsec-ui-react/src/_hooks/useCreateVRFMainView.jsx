import React from "react";

import { DynamicVRFView } from "../db/DynamicVRFView";
import { Field } from "../components/template";


export const useCreateVRFMainView = () => {
    const {mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree} = DynamicVRFView;

    const VRFColumnOneView = mainVRFViewColumnOne.map((el) => {
        switch(el.type) {
            case 'text': {
                return (
                    <Field name={el.name} placeholder={el.placeholder} type={el.type} />
                )
            }
            case 'checkbox': {
                return (
                    <Field name={el.name} type={el.type} />
                )
            }
            default: return;
        }
    });

    return { VRFColumnOneView }
}
