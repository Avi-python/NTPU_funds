import { useState } from "react"
import { FaTimes } from "react-icons/fa"
import { useGlobalState, setGlobalState } from "../store"
import { updateProject } from "../services/blockchain"
import { toast } from "react-toastify"

const UpdateProject = ({ project }) => {
    const [updateModal] = useGlobalState('updateModal');
    const [title, setTitle] = useState(project?.title);
    const [description, setDescription] = useState(project?.description);
    const [date, setDate] = useState(project?.date);
    const [imageURL, setImageURL] = useState(project?.imageURL);

    const toTimestamp = (dateStr) => {
        const dateObj = Date.parse(dateStr);
        return dateObj / 1000;
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); //  防止表單提交的默認行為 ( 默認行為會刷新頁面 )
        if (!title || !description || !date || !imageURL) return;

        const params = {
            id: project?.id,
            title,
            description,
            expiresAt: toTimestamp(date),
            imageURL
        };

        try {
            await updateProject(params);
            toast.success('Project Update successfully, will reflect in 30 seconds');
        } catch (error) {
            toast.error('Failed to update project');
        } finally {
            onClose();
        }
    }

    const onClose = () => {
        setGlobalState("updateModal", "scale-0");
    }

    return (
        <div className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${updateModal}`}
        >
            <div className="bg-white shadow-xl shadow-black
        rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">Edit Project</p>
                        <button
                            type="button"
                            className="border-0 bg-transparent focus:outline-none"
                            onClick={onClose}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="flex justify-center items-center mt-5">
                        <div className="shrink-0 rounded-xl overflow-hidden h-20 w-20">
                            <img
                                src={imageURL ? imageURL : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbDCthbE7NQmM9X_A6oXZyUBbVgXeRV1b_2AN8zEmuZg&s"}
                                alt="project title"
                                className="w-full h-full object-cover cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
                        <input className="block w-full bg-transparent
                        border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                            type="text"
                            name="title"
                            placeholder="Title..."
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
                        <input className="block w-full bg-transparent
                        border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                            type="date"
                            name="date"
                            placeholder="Expires"
                            onChange={(e) => setDate(e.target.value)}
                            value={date}
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
                        <input className="block w-full bg-transparent
                        border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                            type="text"
                            name="imageURL"
                            placeholder="Image URL..."
                            onChange={(e) => setImageURL(e.target.value)}
                            value={imageURL}
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
                        <textarea className="block w-full bg-transparent
                        border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                            type="text"
                            name="description"
                            placeholder="Description..."
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                            required
                        ></textarea>
                    </div>

                    <button type='submit' className='inline-block px-6 py-2.5
                bg-green-600 text-white font-medium text-md leading-tight
                rounded-full shadow-md 
                hover:bg-green-700 mt-5'
                    >
                        Update Project
                    </button>
                </form>
            </div>
        </div>
    )
}

export default UpdateProject