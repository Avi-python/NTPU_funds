import { setGlobalState, useGlobalState } from "../store"
import { isCreator, isAppOwner } from "../services/blockchain"
import { useEffect, useState } from "react";

const Hero = () => {

    const [stats] = useGlobalState('stats');
    const [connectedAccount] = useGlobalState('connectedAccount');
    const [is_creator_or_owner, setIsCreatorOrOwner] = useState(false);

    useEffect(() => {
        async function checkCreator() {
            const is_owner = await isAppOwner(connectedAccount);
            const is_creator = await isCreator(connectedAccount);
            setIsCreatorOrOwner(is_creator || is_owner);
        }
        checkCreator();
    }, [connectedAccount]);

    // console.log('is_creator: ', is_creator);

    return (
        <div className="text-center bg-white 
    text-gray-800 px-6 py-24">
            <h1 className="text-5xl md:text-6xl 
        xl:text-7xl font-bold tracking-tight mt-12
        mb-12">
                <span className='text-blue-700'>台</span> 
                <span className='text-emerald-700'>北</span>
                <span className='text-yellow-400'>大</span>
                <span className='text-red-700'>學</span>
                <span>{'  '}財倍大贏</span>
                <br />
                {/* <span className="uppercase text-green-600">gensis.</span> */}
            </h1>
            <div className="flex justify-center item-center space-x-2">
            {is_creator_or_owner ? (
                    <button type='button' className='inline-block px-6 py-2.5
                    bg-blue-500 text-white font-medium text-xs leading-tight
                    uppercase rounded-full shadow-md 
                    hover:bg-blue-900' onClick={() => setGlobalState("createModal", "scale-100")}
                    >
                        Add Project
                    </button>
                ) : null 
            }

                <button type='button' className='inline-block px-6 py-2.5 border
            border-blue-500 font-medium text-xs leading-tight
            uppercase text-green-600 rounded-full shadow-md bg-transparent
            hover:bg-blue-900 hover:text-white'
                >
                    Back Projects
                </button>
            </div>

            <div className="flex justify-center items-center mt-10">
                <div className="flex flex-col justify-center items-center
                h-20 border shadow-md w-full"
                >
                    <span className="text-lg font-bold text-green-900 
                    leading-5"
                    >
                     {stats?.totalProject || 0}
                    </span>
                    <span>Projects</span>
                </div>
                <div className="flex flex-col justify-center items-center
                h-20 border shadow-md w-full"
                >
                    <span className="text-lg font-bold text-green-900 
                    leading-5"
                    >
                     {stats?.totalBacking || 0}
                    </span>
                    <span>Backings</span>
                </div>
                <div className="flex flex-col justify-center items-center
                h-20 border shadow-md w-full"
                >
                    <span className="text-lg font-bold text-green-900 
                    leading-5"
                    >
                     {stats?.totalDonations || 0} ETH
                    </span>
                    <span>Donated</span>
                </div>
            </div>
        </div>
    )
}

export default Hero