import React from "react";

import { yupResolver } from "@hookform/resolvers/yup";

import { useCreateVRFMainView } from "../../../_hooks/useCreateVRFMainView";
import { useForm } from "react-hook-form";

import { vrfSchema } from "../../../schema";
import { detailForm } from "../../../db/detailForm";

export function FormDetail() {
    const { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView } = useCreateVRFMainView();
    const { register, handleSubmit, errors } = useForm({ resolver: yupResolver(vrfSchema) });

    return (
        <form onSubmit={handleSubmit()} autoComplete='off'>
            <fieldset>
                <div>
                    {VRFColumnOneView}
                </div>
                <div>
                    {VRFColumnTwoView}
                </div>
                <div>
                    {VRFColumnThreeView}
                </div>
            </fieldset>
        </form>
    )
}
