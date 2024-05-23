import Identicon from "react-identicons"
import { FaEthereum } from "react-icons/fa"
import { setGlobalState, useGlobalState } from "../store"
import { daysRemaining, truncate } from "../store"
import { payoutProject } from "../services/blockchain"

const ProjectDetails = ({ project }) => {
    const [connectedAccount] = useGlobalState('connectedAccount');
    const isExpired = new Date().getTime() > Number(project?.expiresAt + '000');

    return (
        <div className="py-24 px-6 flex justify-center">
            <div className="flex justify-center flex-col md:w-2/3">

                <div className="flex justify-start items-center sm:space-x-4 flex-wrap">
                        <img
                            src={project?.imageURL || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbDCthbE7NQmM9X_A6oXZyUBbVgXeRV1b_2AN8zEmuZg&s"}
                            alt={project?.title || "Project Title"}
                            className="rounded-xl h-64 w-full sm:w-1/3 object-cover shadow-lg"
                        />

                    <div className="flex-1 sm:py-0 py-4">
                        <div className="flex justify-start flex-wrap">
                            <div className="bg-blue-100 rounded-xl shadow-md px-5 py-3 mb-2">
                                <h5 className="text-gray-900 text-xl font-extrabold">
                                    {project?.title || "Project Title"}
                                </h5>
                            </div>
                        </div>

                        <div className="bg-red-100 rounded-xl shadow-md px-5 py-3 mb-2">
                            <div className="flex flex-col items-start justify-center">

                                <small className="text-gray-500">
                                    {isExpired
                                        ? ('Expired')
                                        : (daysRemaining(project?.expiresAt) + ' left')}
                                </small>
                                <div className="flex justify-between items-center w-full pt-1">
                                    <div className="flex justify-start space-x-2">
                                        <Identicon className="rounded-full shadow-md" string={project?.owner} size={15}></Identicon>
                                        {project?.owner
                                            ? (
                                                <small className="text-gray-700">{truncate(project.owner, 4, 4, 11)}r</small>
                                            ) : null}
                                        <small className="text-gray-500 font-bold">{project?.backers} Backer{project?.backers === 1 ? '' : 's'}</small>
                                    </div>

                                    <div className="font-bold">
                                        {
                                            isExpired ? // TODO : 要調整一下，過期是否要將錢退給 backers，從而變成 Reverted。
                                                (<small className='text-red-500'>Expired</small>)
                                                : project?.status === 0
                                                    ? (<small className='text-gray-500'>Open</small>)
                                                    : project?.status === 1
                                                        ? (<small className='text-green-500'>Accepted</small>)
                                                        : project?.status === 2
                                                            ? (<small className='text-gray-500'>Reverted</small>)
                                                            : project?.status === 3
                                                                ? (<small className='text-red-500'>Deleted</small>)
                                                                : (
                                                                    <small className='text-orange-500'>Paid</small>
                                                                )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="bg-yellow-100 rounded-xl shadow-md px-5 py-3 mb-2">
                                <p className="text-lg font-normal">
                                    {project?.description || "Project Description"}
                                </p>
                            </div>

                            <div className="bg-green-100 rounded-xl shadow-md px-5 py-3 mb-2">
                            <div className="w-full bg-gray-300 mt-4">
                                <div className="bg-green-600 text-xs font-medium text-green-100
          text-center p-0.5 leading-none rounded-l-full" style={{ width: (`${(project.raised / project.cost) * 100 > 100 ? 100 : (project.raised / project.cost) * 100}%`) }}></div>
                            </div>

                            <div className="flex justify-between items-center font-bold mt-2">
                                <small>{project.raised} ETH Raised</small>
                                <small className="flex justify-start item-center">
                                    <FaEthereum />
                                    <span>{project.cost} ETH</span>
                                </small>
                            </div>
                            </div>

                            <div className="flex justify-start item-center space-x-2 mt-4">

                                {project?.status === 0 && !isExpired ? (
                                    <button
                                        type='button'
                                        className='inline-block px-6 py-2.5
                            bg-blue-500 text-white font-medium text-xs leading-tight
                            uppercase rounded-full shadow-md 
                            hover:bg-blue-700'
                                        onClick={() => setGlobalState("backModal", "scale-100")}
                                    >
                                        Back Project
                                    </button>
                                ) : null}

                                {/* 也就是當前操作者所使用的 wallet 要是 project owner 才能執行的相關操作 */}
                                {connectedAccount === project?.owner
                                    ? (
                                        project?.status !== 3  // 如果還沒有被刪掉
                                            ? (
                                                project?.status === 1 // 如果已經 APPROVED ( 達標 ) 
                                                    ? (
                                                        <button type='button' className='inline-block px-6 py-2.5
                                                bg-orange-600 text-white font-medium text-xs leading-tight
                                                uppercase rounded-full shadow-md 
                                                hover:bg-orange-700'
                                                            onClick={() => payoutProject(project?.id)}
                                                        >
                                                            Payout
                                                        </button>
                                                    )
                                                    : project?.status !== 4 // 如果還沒有達標且還沒有 PAIDOUT 就可以 Edit 和 delete
                                                        ? (
                                                            <>
                                                                {!isExpired ? (
                                                                    <button
                                                                        type='button'
                                                                        className='inline-block px-6 py-2.5
                                                        bg-gray-400 text-white font-medium text-xs leading-tight
                                                        uppercase rounded-full shadow-md 
                                                        hover:bg-gray-700'
                                                                        onClick={() => setGlobalState("updateModal", "scale-100")}
                                                                    >
                                                                        Edit
                                                                    </button>)
                                                                    : null}

                                                                <button
                                                                    type='button'
                                                                    className='inline-block px-6 py-2.5
                                                    bg-red-500 text-white font-medium text-xs leading-tight
                                                    uppercase rounded-full shadow-md 
                                                    hover:bg-red-700'
                                                                    onClick={() => setGlobalState("deleteModal", "scale-100")}

                                                                >
                                                                    Delete
                                                                </button>

                                                            </>
                                                        )
                                                        : (  // 如果還沒有達標且但已經 PAIDOUT 就只剩下關掉 project
                                                            // TODO : 還沒有實做功能 
                                                            <button
                                                                type='button'
                                                                className='inline-block px-6 py-2.5
                                                    bg-gray-600 text-white font-medium text-xs leading-tight
                                                    uppercase rounded-full shadow-md 
                                                    hover:bg-gray-700'

                                                            >
                                                                Project Closed
                                                            </button>
                                                        )
                                            ) : (null)
                                    ) : null
                                }
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div >
    )
}

export default ProjectDetails