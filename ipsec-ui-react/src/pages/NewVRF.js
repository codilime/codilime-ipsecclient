import React from 'react';
import {ErrorMessage, Form, Field, Formik} from "formik";
import './NewVRF.scss'
import Dump from "../components/Dump";

export default function NewVRF({routeProps, cryptoPhaseEncryption}) {

    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                {routeProps.location.pathname}
            </div>
            <div className="new-vrf-data-container">
                <Formik
                    initialValues={{ client_name: ''}}
                    validate={values => {
                        const errors = {};
                        if (!values.client_name) {
                            errors.client_name = 'Please submit a name';
                        }
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {
                            alert(JSON.stringify(values, null, 2));
                            setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ isSubmitting}) => (
                        <Form>
                            <Field type="text" name="client_name" />
                            <ErrorMessage name="client_name" />
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
