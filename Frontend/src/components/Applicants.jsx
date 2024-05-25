import Identicon from "react-identicons"
import { setGlobalState } from '../store/index';
import { truncate } from "../store"

const Applicants = ({ applicants }) => {

    return (
        <div className="py-24 px-6 flex justify-center">
            <div className="flex flex-col justify-center items-start w-full md:w-2/3 px-6 mx-auto">
                <div className="max-h-[calc(100vh_-_25rem)] overflow-y-auto shadow-md rounded-md w-full mb-10">
                    <table className="min-w-full">
                        <thead className="border-b">
                            <tr>
                                <th scope="col"
                                    className="text-sm font-medium px-6 py-4 text-left"
                                >
                                </th>
                                <th scope="col"
                                    className="text-sm font-medium px-6 py-4 text-left"
                                >
                                    Address
                                </th>
                                <th scope="col"
                                    className="text-sm font-medium px-6 py-4 text-left hidden md:table-cell"
                                >
                                    Username
                                </th>
                                <th scope="col"
                                    className="text-sm font-medium px-6 py-4 text-left hidden lg:table-cell"
                                >
                                    Email
                                </th>
                                <th scope="col"
                                    className="text-sm font-medium px-6 py-4 text-left hidden lg:table-cell"
                                >
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map((applicant, i) => {
                                return <Backer key={i} applicant={applicant} />
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

const Backer = ({ applicant }) => (
    <tr className="border-b border-gray-200">

        <td className="px-6 py-4">
            <button
                type='button'
                className='inline-block px-6 py-2.5
                bg-gray-400 text-white font-medium text-xs leading-tight
                uppercase rounded-full shadow-md 
                hover:bg-gray-700'
                onClick={() => { 
                    setGlobalState("closeApplicant", false); 
                    setGlobalState("applicantDetails", applicant);
                }}
            >
                View
            </button>
        </td>

        <td className="text-sm font-light
                            px-6 py-4 whitespace-nowrap"
        >
            <div className="flex justify-start items-center space-x-2">
                <Identicon
                    className="h-10 w-10 object-contain rounded-full shadow-md"
                    string={applicant?.address}
                    size={25} />
                <span>{truncate(applicant?.address, 4, 4, 11)}</span>
            </div>
        </td>

        <td className="text-lg font-normal
                            px-6 py-4 whitespace-nowrap hidden md:table-cell"
        >
            <small className="flex justify-start items-center">
                {applicant?.name}
            </small>
        </td>
        
        <td className="text-lg font-normal 
                            px-6 py-4 whitespace-nowrap hidden lg:table-cell"
        >
            <small className="flex justify-start items-center space-x-1">
                {applicant?.email}
            </small>
        </td>


        <td className="space-x-3 hidden xl:table-cell">
            <button
                type='button'
                className='inline-block px-6 py-2.5
                bg-red-400 text-white font-medium text-xs leading-tight
                uppercase rounded-full shadow-md 
                hover:bg-red-700'
                // onClick={() => setGlobalState("updateModal", "scale-100")}
            >
                Reject
            </button>

            <button
                type='button'
                className='inline-block px-6 py-2.5
                bg-green-400 text-white font-medium text-xs leading-tight
                uppercase rounded-full shadow-md 
                hover:bg-green-700'
                // onClick={() => setGlobalState("updateModal", "scale-100")}
            >
                Approve
            </button>
        </td>
        {/* <td className="text-sm font-light
                            px-6 py-4 whitespace-nowrap"
        >
            <Moment fromNow>
                {backer?.timestamp}
            </Moment>
        </td> */}
    </tr>
);

export default Applicants