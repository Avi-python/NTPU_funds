import { setGlobalState, useGlobalState } from "../store"
import { BsPlusLg } from "react-icons/bs"
import { isCreator, isAppOwner } from "../services/blockchain"
import { useEffect, useState } from "react";

const AddButton = () => {

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

    if(!is_creator_or_owner) return null;
    
    return (
        <div className="fixed right-10 bottom-10 flex space-x-2 justify-center">
            <button type='button' className='flex justify-center items-center w-9 h-9
            bg-blue-500 text-white font-medium text-xs leading-tight
            uppercase rounded-full shadow-md 
            hover:bg-green-900' onClick={() => setGlobalState("createModal", "scale-100")}
            >
                <BsPlusLg className="font-bold" size={20}/>
            </button>
        </div>
    )
}

export default AddButton