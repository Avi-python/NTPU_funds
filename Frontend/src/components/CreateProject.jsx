import { useState } from "react"
import { FaTimes } from "react-icons/fa"
import { useGlobalState, setGlobalState } from "../store"
import { createProject } from "../services/blockchain"
import { toast } from "react-toastify"

const CreateProject = () => {
    const [createModal] = useGlobalState('createModal');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [date, setDate] = useState('');
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [imageURL, setImageURL] = useState('');

    const toTimestamp = (dateStr) => {
        const dateObj = Date.parse(dateStr);
        return dateObj / 1000;
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); //  防止表單提交的默認行為 ( 默認行為會刷新頁面 )
        if (!title || !description || !cost || (days == 0 && hours == 0 && minutes == 0) || !date || !imageURL) return;

        const params = {
            title,
            description,
            cost,
            duration: days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60,
            expiresAt: toTimestamp(date),
            imageURL
        };

        try {
            await createProject(params);
            toast.success('Project created successfully, will reflect in 30 seconds');
        } catch (error) {
            toast.error('Failed to create project');
        } finally {
            onClose();
        }
    }

    const onClose = () => {
        setGlobalState("createModal", "scale-0");
        reset();
    }

    const reset = () => {
        setTitle('');
        setDescription('');
        setCost('');
        setDate('');
        setDays(0);
        setHours(0);
        setMinutes(0);
        setImageURL('');
    };

    return (
        <div className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${createModal}`}
        >
            <div className="bg-white shadow-xl shadow-black
        rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">Add Project</p>
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
                            type="number"
                            step={0.01}
                            min={0.01}
                            name="cost"
                            placeholder="Cost {Eth}"
                            onChange={(e) => setCost(e.target.value)}
                            value={cost}
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

                    <div className="flex flex-wrap justify-between items-center rounded-xl">
                        <div className="flex-1 flex flex-col mr-4 mt-4">
                            <small className="ml-1">Days</small>
                            <input className=" bg-gray-300 rounded-xl
                            border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                                type="number"
                                step={1}
                                min={0}
                                name="days"
                                placeholder="Days"
                                onChange={(e) => setDays(e.target.value)}
                                value={days}
                            />
                        </div>
                        <div className="flex-1 flex flex-col mr-4 mt-4">
                            <small className="ml-1">Hours</small>
                            <input className="flex-1 bg-gray-300 rounded-xl
                            border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                                type="number"
                                step={1}
                                min={0}
                                name="hours"
                                placeholder="hours"
                                onChange={(e) => setHours(e.target.value)}
                                value={hours}
                            />
                        </div>
                        <div className="flex-1 flex flex-col mr-4 mt-4">
                            <small className="ml-1">Minutes</small>
                            <input className="flex-1 bg-gray-300 rounded-xl
                            border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                                type="number"
                                step={1}
                                min={0}
                                name="minutes"
                                placeholder="minutes"
                                onChange={(e) => setMinutes(e.target.value)}
                                value={minutes}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
                        <input className="block w-full bg-transparent
                        border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                            type="text"
                            name="imageURL"
                            placeholder="Image URL..."
                            onChange={(e) => setImageURL(e.target.value)}
                            value={imageURL}
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
                        Submit Project
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateProject