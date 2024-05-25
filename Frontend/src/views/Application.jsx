import React, { useEffect } from 'react'
import { useState } from 'react'
import { requestApplicants, requestLogin } from '../services/user'
import Applicants from '../components/Applicants'
import ApplicantDetails from '../components/ApplicantDetails'

function Application() {

    const [applicants, setApplicants] = useState(null);

    useEffect(() => {
        async function getApplicants() {
            try {
                const res = await requestApplicants();
                setApplicants(res.applicants);
            } catch (error) {
                if(error.response.status === 401) {
                    try {
                        await requestLogin();
                        const res = await requestApplicants();
                        setApplicants(res.applicants);
                        console.log("applicants:", applicants);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
        getApplicants();
    }, [])


    if(applicants === null) {

        return (
            <div className="py-24 px-6 flex justify-center">
                wait for request...
            </div>
        )

    }

    if(applicants.length === 0) {
        return (
            <div className="py-24 px-6 flex justify-center">
                no applicants
            </div>
        )
    }

    return (
        <>
            <Applicants applicants={applicants} />
            <ApplicantDetails />
        </>
    )

}

export default Application