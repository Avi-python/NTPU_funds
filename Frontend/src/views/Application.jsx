import React, { useEffect } from 'react'
import { useState } from 'react'
import { requestApplicants, requestLogin } from '../services/user'

function Application() {

    const [applicants, setApplicants] = useState(null);

    useEffect(() => {
        async function getApplicants() {
            try {
                const applicants = await requestApplicants();
                setApplicants(applicants);
            } catch (error) {
                if(error.response.status === 401) {
                    try {
                        await requestLogin();
                        const applicants = await requestApplicants();
                        setApplicants(applicants);
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
        <div className="py-24 px-6 flex justify-start">
            {
                applicants.map((applicant, index) => {
                    return (
                        <div key={index} className="p-4 m-4 bg-gray-100 rounded-lg">
                            <p className="text-lg font-bold">{applicant.name}</p>
                            {/* <p className="text-sm">{applicant.}</p>
                            <p className="text-sm">{applicant.phone}</p> */}
                        </div>
                    )
                })
            }
        </div>
    )

}

export default Application