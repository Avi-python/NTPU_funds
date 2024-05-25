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
            <div>wait for request...</div>
        )

    }

    if(applicants.length === 0) {
        return (
            <div>no applicants</div>
        )
    }

    return (
        <div>Application</div>
    )

}

export default Application