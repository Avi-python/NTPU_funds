import { useState } from "react"
import { IconContext } from "react-icons"
import { FaTimes } from "react-icons/fa"
import { AiOutlineMinusCircle } from "react-icons/ai"
import { useGlobalState, setGlobalState } from "../store"
import { createProgressCell } from "../services/user"
import { toast } from "react-toastify"

const CreateProgressCell = ({ projectId }) => {
    const [createProgressCellModal] = useGlobalState('createProgressCellModal');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDocs, setSelectedDocs] = useState(false);

    const handleRemoveDocs = (index) => {
        setSelectedDocs(selectedDocs.filter((image, i) => i !== index));
      };

    const handleSubmit = async (e) => {
        e.preventDefault(); //  防止表單提交的默認行為 ( 默認行為會刷新頁面 )
        if (!title || !description) return;

        const form_data = new FormData();
        form_data.append('projectId', projectId);
        form_data.append('title', title);
        form_data.append('description', description);
        for (let i = 0; i < selectedDocs.length; i++) {
            form_data.append(`file${i}`, selectedDocs[i]);
        }

        try {
            await createProgressCell(form_data);
            toast.success('Progress Cell create successfully');
        } catch (error) {
            toast.error('Failed to create Progress Cell');
        } finally {
            onClose();
        }
    }

    const onClose = () => {
        setGlobalState("createProgressCellModal", "scale-0");
        reset();
    }

    const reset = () => {
        setTitle('');
        setDescription('');
    };

    return (
        <div className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50
    transform transition-transform duration-300 ${createProgressCellModal}`}
        >
            <div className="bg-white shadow-xl shadow-black
        rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">Add Progress Cell</p>
                        <button
                            type="button"
                            className="border-0 bg-transparent focus:outline-none"
                            onClick={onClose}
                        >
                            <FaTimes />
                        </button>
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

                    <div className='flex flex-col mt-5'>
                        <input
                            className='border-0'
                            type="file"
                            name="myImage"
                            accept='image/*,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            multiple
                            // Event handler to capture file selection and update the state
                            onChange={(event) => {
                                // console.log([...event.target.files]); // Log the selected file
                                setSelectedDocs([...event.target.files]); // Update the state with the selected file
                            }}
                        />
                    </div>

                    {selectedDocs && selectedDocs.length > 0 &&
                        <div className='flex flex-wrap mt-3'>
                            {
                                selectedDocs.map((doc, index) => (
                                    <div key={index} className='rounded-full shadow-sm border flex pt-2 pb-2 pl-4 pr-4 mr-3 mb-3'>
                                        <button onClick={() => handleRemoveDocs(index)} className="mr-3">
                                            <IconContext.Provider value={{ color: "red", className: "global-class-name" }}>
                                                <div>
                                                    <AiOutlineMinusCircle />
                                                </div>
                                            </IconContext.Provider>
                                        </button>
                                        {doc.name}
                                    </div>
                                ))}
                        </div>
                    }

                    <button type='submit' className='inline-block px-6 py-2.5
                bg-green-600 text-white font-medium text-md leading-tight
                rounded-full shadow-md 
                hover:bg-green-700 mt-5'
                    >
                        Submit
                    </button>
                </form>
            </div >
        </div >
    )
}

export default CreateProgressCell