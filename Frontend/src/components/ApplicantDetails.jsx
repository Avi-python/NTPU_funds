import { useEffect } from 'react';
import { useGlobalState } from '../store/index';
import { FaTimes } from "react-icons/fa"
import CertifiedDoc from './CertifiedDoc';

function ApplicantDetails() {

    const [closeApplicant, setCloseApplicant] = useGlobalState("closeApplicant");
    const [headerHeight, setCloseHeaderHeight] = useGlobalState("headerHeight");
    const [applicantDetails, setApplicantDetails] = useGlobalState("applicantDetails");

    useEffect(() => {
    }, [applicantDetails]);

    const onClose = () => {
        setCloseApplicant(true);
    }

    return headerHeight !== 0 ? (
        <div className={`fixed bottom-0 right-0 w-5/6 md:w-4/6 xl:w-3/6 flex items-start justify-start bg-blue-100 shadow-md
    transform transition-transform duration-300 ${closeApplicant ? 'translate-x-full' : ''} `}
            style={{ height: `calc(100vh - ${headerHeight}px)` }}
        >
            
                <div className="flex flex-col py-6 px-6"> 
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            className="border-0 bg-transparent focus:outline-none"
                            onClick={onClose}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="flex justify-center items-center mt-5">
                        {applicantDetails?.address}
                    </div>

                    <div className="flex justify-between items-center mt-5">
                        {applicantDetails?.name}
                    </div>

                    <div className="flex justify-between items-center mt-5">
                        {applicantDetails?.email}
                    </div>

                    <div className="flex flex-col justify-between items-center mt-5">
                        {
                            applicantDetails?.certified_docs.map((doc, index) => {
                                return <CertifiedDoc key={doc} doc={doc} />
                            })
                        }
                    </div>

                    <button type='submit' className='inline-block px-6 py-2.5
                bg-green-600 text-white font-medium text-md leading-tight
                rounded-full shadow-md 
                hover:bg-green-700 mt-5'
                    >
                        Submit Project
                    </button>
                </div>
        </div>
    ) : null;
}

export default ApplicantDetails