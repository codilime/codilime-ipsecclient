import React from 'react';
import {Form, Field, Formik} from "formik";
import './NewVRF.scss'
import Dump from "../components/Dump";
import * as Yup from 'yup';

export default function NewVRF({routeProps, cryptoPhaseEncryption}) {

    const newVRFValidation = Yup.object(). shape({
        client_name: Yup.string()
            .min(2, "Too short")
            .max(32, "Too long")
            .required('Required')
    });


    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                {routeProps.location.pathname}
            </div>
            <div className="new-vrf-data-container">
                <Formik
                    initialValues={{ client_name: ''}}
                    validationSchema={newVRFValidation}
                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {
                            alert(JSON.stringify(values, null, 2));
                            setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ errors, touched, isSubmitting}) => (
                        <Form>
                            <Field type="text" name="client_name" />
                            {errors.client_name && touched.client_name ? (
                                <div>{errors.client_name}</div>
                            ) : null}
                            <button type="submit" disabled={isSubmitting}>
                                Submit
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
            <div className="new-vrf-data-container">
                endpoints table
            </div>
            <div className="new-vrf-data-container">
                visualization
            </div>
            <Dump value={cryptoPhaseEncryption} />
        </div>
    );
}
