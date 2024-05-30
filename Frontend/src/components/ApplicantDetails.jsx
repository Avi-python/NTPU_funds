import { useEffect } from 'react';
import { useGlobalState } from '../store/index';
import { FaTimes } from "react-icons/fa"
import CertifiedDoc from './CertifiedDoc';
import { rejectApplicant, approveApplicant } from '../services/user';

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
        <div className={`fixed bottom-0 right-0 h-full w-5/6 md:w-4/6 xl:w-3/6 flex items-start justify-start bg-blue-50 shadow-md
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

                <div className="flex justify-start items-center mt-5 ">
                    <p className='px-3 py-2 bg-yellow-100 rounded-xl shadow-md'>
                        Account
                    </p>
                    <p className='px-3 py-2 bg-blue-100 rounded-xl shadow-md'>
                        {applicantDetails?.address}
                    </p>
                </div>

                <div className="flex justify-start items-center mt-5">
                    <p className='px-3 py-2 bg-yellow-100 rounded-xl shadow-md'>
                        Name
                    </p>
                    <p className='px-3 py-2 bg-blue-100 rounded-xl shadow-md'>
                        {applicantDetails?.name}
                    </p>
                </div>

                <div className="flex justify-start items-center mt-5">
                    <p className='px-3 py-2 bg-yellow-100 rounded-xl shadow-md'>
                        Email
                    </p>
                    <p className='px-3 py-2 bg-blue-100 rounded-xl shadow-md'>
                        {applicantDetails?.email}
                    </p>
                </div>

                <div className="flex flex-col justify-between items-start mt-5 px-3 py-2 overflow-auto bg-blue-100 rounded-xl shadow-md">

                    <p className='flex justify-start items-center px-3 py-2 bg-yellow-100 rounded-xl shadow-md mb-3'>
                        Certified Docs
                    </p>
                    <div className='flex flex-wrap'>
                        {
                            applicantDetails?.certified_docs.map((doc, index) => {
                                return <CertifiedDoc key={doc} doc={doc} />
                            })
                        }
                    </div>
                </div>

            </div>

            <div className='justify-center items-center absolute bottom-0 ml-20 mb-5 space-x-5'>

                <button
                    type='button'
                    className='inline-block px-6 py-2.5
                        bg-red-400 text-white font-medium text-xs leading-tight
                        uppercase rounded-full shadow-md 
                        hover:bg-red-700'
                    onClick={() => rejectApplicant(applicantDetails?.address)}
                >
                    Reject
                </button>

                <button
                    type='button'
                    className='inline-block px-6 py-2.5
                        bg-green-400 text-white font-medium text-xs leading-tight
                        uppercase rounded-full shadow-md 
                        hover:bg-green-700'
                    onClick={() => approveApplicant(applicantDetails?.address)}
                >
                    Approve
                </button>
            </div>
        </div>
    ) : null;
}

export default ApplicantDetails