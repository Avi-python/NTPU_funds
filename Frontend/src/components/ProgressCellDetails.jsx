import { useEffect, useState } from 'react';
import { useGlobalState } from '../store/index';
import { FaTimes } from "react-icons/fa"
import { requestAllProgressCellFiles } from '../services/user';

function ProgressCellDetails({ projectId }) {

    const [closeProgressCell, setCloseProgressCell] = useGlobalState("closeProgressCell");
    const [progressCellDetails, setProgressCellDetails] = useGlobalState("progressCellDetails");

    useEffect(() => {
    }, [progressCellDetails]);

    const onClose = () => {
        setCloseProgressCell(true);
    }

    return (
        <div className={`fixed bottom-0 right-0 sm:left-1/2 h-5/6 flex flex-col md:max-w-2xl max-w-sm items-start justify-start  bg-blue-50 shadow-md
    transform transition-transform duration-300 ${closeProgressCell ? 'translate-y-full' : ''} `}
        >
            <div className="flex justify-between items-center p-3">
                <button
                    type="button"
                    className="border-0 bg-transparent focus:outline-none"
                    onClick={onClose}
                >
                    <FaTimes />
                </button>
            </div>

            <div className="flex flex-col py-6 px-6 h-full overflow-auto">

                <div className="flex justify-start items-center mt-5 ">
                    <p className='px-3 py-2 bg-yellow-100 rounded-xl shadow-md'>
                        Upload Date
                    </p>
                    <p className='px-3 py-2 bg-blue-100 rounded-xl shadow-md'>
                        {progressCellDetails?.upload_date}
                    </p>
                </div>

                <div className="flex justify-start items-center mt-5">
                    <p className='px-3 py-2 bg-yellow-100 rounded-xl shadow-md'>
                        Title
                    </p>
                    <p className='px-3 py-2 bg-blue-100 rounded-xl shadow-md'>
                        {progressCellDetails?.title}
                    </p>
                </div>

                <p className='px-3 py-2 mt-5 bg-yellow-100 rounded-xl shadow-md'>
                    Description
                </p>
                <div className="flex justify-start items-center mt-5">
                    <p className='px-3 py-2 bg-blue-100 rounded-xl shadow-md'>
                        {progressCellDetails?.description}
                    </p>
                </div>

                <div className="flex flex-col justify-between items-start mt-5 px-3 py-2 bg-blue-100 rounded-xl shadow-md">

                    <div className='flex'>
                        <p className='flex justify-start items-center px-3 py-2 bg-yellow-100 rounded-xl shadow-md mb-3'>
                            Docs
                        </p>
                        <button type='button' className='px-3 py-2 ml-3 mb-3 rounded-xl shadow-md bg-green-100'
                        onClick={() => requestAllProgressCellFiles(projectId, progressCellDetails?.id, progressCellDetails?.files)}
                        >
                            Download All
                        </button>
                    </div>

                    <div className='flex flex-wrap'>
                        {
                            progressCellDetails?.files.map((doc, index) => {
                                return <div key={index} >
                                    <p className='px-3 py-2 m-2 bg-red-100 rounded-xl shadow-md word-break: break-all'>
                                        {doc.substring(6)}
                                    </p>
                                </div>
                            })
                        }
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProgressCellDetails