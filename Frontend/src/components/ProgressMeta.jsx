import { useState, useEffect } from 'react'
import {
    getFundingInstallment,
    loadProject,
    getFundReviews,
    isProjectCreator,
    createFundReview,
    deleteProject,
    requestRefund,
    isProjectFundReviewing
} from '../services/blockchain';
import { useGlobalState, setGlobalState } from '../store';

function ProgressMeta({ projectId }) {

    const [isLoaded, setIsLoaded] = useState(false);
    const [isTheProjectCreator, setIsTheProjectCreator] = useState(false);
    const [fundingInstallment, setFundingInstallment] = useState(null);
    const [fundReviews, setFundReviews] = useState([]);
    const [project] = useGlobalState('project');
    const [connectedAccount] = useGlobalState('connectedAccount');
    const [isFundReviewing, setIsFundReviewing] = useState(false);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    let fundReviewCount = 0;

    useEffect(() => {
        async function loadFundingInstallment() {
            const res = await getFundingInstallment();
            setFundingInstallment(res);
        }
        async function load() {
            await loadProject(projectId);
            setFundReviews(await getFundReviews(projectId));
            setIsTheProjectCreator(await isProjectCreator(projectId, connectedAccount));
            setIsFundReviewing(await isProjectFundReviewing(projectId));
            await loadFundingInstallment();
            setIsLoaded(true);
        }
        load();
    }, [connectedAccount]);

    if (!isLoaded) {
        return (
            <div className="py-24 px-6 flex justify-center">
                wait for loading...
            </div>
        )
    }

    const isExpired = new Date().getTime() > Number(project?.expiresAt + '000');

    return (
        <div className="pt-24 pb-10 px-6 flex flex-col justify-center shadow-md">
            <div className='flex justify-center items-center space-x-10 mt-4'>
                <div className='flex flex-col'>
                    <p className="text-xl text-center">Next Fund Review At</p>
                    <div className="text-center text-md">{project.reviewDate}</div>
                </div>
                <div className='flex flex-col'>
                    <p className="text-xl text-center">Project Will Expire At</p>
                    <div className="text-center text-md">{project.date}</div>
                </div>
                { // TODO : 要調整一下，過期是否要將錢退給 backers，從而變成 Reverted。

                    project?.status === 0
                        ? (<small className='text-gray-500'>Open</small>)
                        : project?.status === 1
                            ? (<small className='text-green-500'>Approved</small>)
                            : project?.status === 2
                                ? (<small className='text-gray-500'>Reverted</small>)
                                : project?.status === 3
                                    ? (<small className='text-red-500'>Deleted</small>)
                                    : project?.status === 5
                                        ? (<small className='text-orange-500'>Paid</small>)
                                        : isExpired
                                            ? (<small className='text-red-500'>Expired</small>)
                                            : (<small className='text-blue-500'>Progressing</small>)
                }
            </div>
            <div className="h-10 justify-center mt-4 flex items-center">
                <div className="h-8 w-8 bg-emerald-500 rounded-full" />
                {fundReviews.map((fundReview, i) => {
                    if (currentTimestamp >= fundReview.endDate) {
                        if (i === fundReviews.length - 1) {
                            if (!isFundReviewing && (fundReview.passCount <= fundReview.totalVoteCount / 2)) {
                                fundReviewCount++;
                                return <>
                                    <div key={i}
                                        className={`w-1/4 h-2 bg-emerald-200`}
                                    />
                                    <div key={i} className="h-8 w-8 bg-red-400 rounded-full" />
                                </>
                            } else if (!isFundReviewing && (fundReview.passCount > fundReview.totalVoteCount / 2)) {
                                fundReviewCount++;
                                return <>
                                    <div key={i}
                                        className={`w-1/4 h-2 bg-emerald-200`}
                                    />
                                    <div key={i} className="h-8 w-8 bg-emerald-400 rounded-full" />
                                </>
                            }
                        } else {
                            fundReviewCount++;
                            return <>
                                <div key={i}
                                    className={`w-1/4 h-2 bg-emerald-200`}
                                />
                                {project.status === 2 || project.status === 3 ?
                                    <div key={i} className="h-8 w-8 bg-red-400 rounded-full" />
                                    : <div key={i} className="h-8 w-8 bg-emerald-200 rounded-full" />
                                }
                            </>
                        }
                    }
                })}
                {Array.from({ length: fundingInstallment - 1 - fundReviewCount }, (_, i) => {
                    return <>
                        <div key={i}
                            className={`w-1/4 h-2 bg-gray-200`}
                        />
                        <div key={i} className="h-8 w-8 bg-gray-200 rounded-full" />
                    </>
                })}
            </div>

            {isTheProjectCreator && currentTimestamp >= project.fundReviewAt && currentTimestamp < project.expiresAt && !isFundReviewing
                ? (
                    <div className="justify-center flex items-center mt-5">
                        <button
                            type='button'
                            className='inline-block px-6 py-2.5
                bg-green-400 text-white font-medium text-xs leading-tight
                uppercase rounded-full shadow-md 
                hover:bg-green-700 mr-4'
                            onClick={async () => {
                                await createFundReview(projectId);
                            }}
                        >
                            Go Funding Review
                        </button>

                        <button
                            type='button'
                            className='inline-block px-6 py-2.5
                bg-red-400 text-white font-medium text-xs leading-tight
                uppercase rounded-full shadow-md 
                hover:bg-red-700'
                            onClick={async () => {
                                await deleteProject(projectId);
                            }}
                        >
                            Delete Project
                        </button>
                    </div>)
                : !isTheProjectCreator && isExpired && project?.status === 4 ? (
                    <div className="justify-center flex items-center mt-5">
                        <button
                            type='button'
                            className='inline-block px-6 py-2.5
                bg-gray-400 text-white font-medium text-xs leading-tight
                uppercase rounded-full shadow-md 
                hover:bg-gray-700 mr-4'
                            onClick={async () => { await requestRefund(project) }}
                        >
                            Request Refund
                        </button>
                    </div>
                ) : !isTheProjectCreator && isFundReviewing ? (
                    <div className="justify-center flex items-center mt-5">
                        <button
                            type='button'
                            className='inline-block px-6 py-2.5
                bg-green-400 text-white font-medium text-xs leading-tight
                uppercase rounded-full shadow-md 
                hover:bg-green-700 mr-4'
                            onClick={() => setGlobalState('voteModal', 'scale-100')}
                        >
                            Vote
                        </button>
                    </div>
                ) : null}
        </div>
    )
}

export default ProgressMeta