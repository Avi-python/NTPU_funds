import { useGlobalState, setGlobalState } from "../store"
import { toast } from "react-toastify";
import { voteReview } from "../services/blockchain";
import { FaTimes } from "react-icons/fa";

const Vote = ({ projectId }) => {
    const [voteModal] = useGlobalState('voteModal');

    const onClose = () => {
        setGlobalState("voteModal", "scale-0");
    }

    const handleSubmit = async (option) => {
        try {
            await voteReview(projectId, option);
            toast.success('Vote successfully !');
        } catch (error) {
            toast.error('Vote Failed !');
        } finally {
            setGlobalState("voteModal", "scale-0");
        }
    }

    return (
        <div className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${voteModal}`}
        >

            <div className="bg-white shadow-xl shadow-black
        rounded-xl h-7/12 p-6">

                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        className="border-0 bg-transparent focus:outline-none"
                        onClick={() => onClose()}
                    >
                        <FaTimes />
                    </button>
                </div>

                <button className='inline-block px-6 py-2.5
                    bg-red-600 text-white font-medium text-md leading-tight
                    rounded-full shadow-md 
                    hover:bg-red-700 mt-5 mr-5'
                    onClick={() => handleSubmit(0)}
                >
                    Fail
                </button>

                <button className='inline-block px-6 py-2.5
                    bg-emerald-500 text-white font-medium text-md leading-tight
                    rounded-full shadow-md 
                    hover:bg-emerald-700 mt-5'
                    onClick={() => handleSubmit(1)}
                >
                    Pass
                </button>

            </div>
        </div>
    )
}

export default Vote