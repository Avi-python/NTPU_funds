import { useState } from 'react'
import { register } from '../services/user'

const Register = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedImages, setSelectedImages] = useState(false);

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((image, i) => i !== index));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form_data = new FormData();
    form_data.append('name', name);
    form_data.append('email', email);
    for (let i = 0; i < selectedImages.length; i++) {
      form_data.append(`image${i}`, selectedImages[i]);
    }

    try{
      await register(form_data);
    } catch (error) {
      console.log(error);
    } finally {
      setName('');
      setEmail('');
      setSelectedImages(false);
    }
  }

  return (
    <>
      <div className="py-24 px-6 flex-col justify-center">
        <div className="flex justify-center mt-8 mb-8">
          <p className="font-extrabold space-x-1 text-5xl md:text-6xl 
        xl:text-7xl">
            成為
            <span className='text-blue-700'>項目</span>
            <span className='text-emerald-700'>創建者</span>
          </p>
        </div>
        <div className='flex justify-center'>
          <div className="bg-yellow-100 shadow-lg  
        rounded-xl w-11/12 lg:w-2/5 h-7/12 p-6">
            <form className="flex flex-col">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Information</p>
                <button
                  type="button"
                  className="border-0 bg-transparent focus:outline-none"
                >
                </button>
              </div>

              <div className='flex flex-col mt-5'>
                <div className='ml-2 mb-0.5'>Name</div>
                <div className="flex justify-between items-center bg-gray-300 rounded-xl">

                  <input className="block w-full bg-transparent
                          border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                    type="text"
                    name="name"
                    placeholder="Jason..."
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='flex flex-col mt-5'>
                <div className='ml-2 mb-0.5'>Email</div>
                <div className="flex justify-between items-center bg-gray-300 rounded-xl">
                  <input className="block w-full bg-transparent
                        border-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
                    type="text"
                    name="email"
                    placeholder="haha@gmail.com..."
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='flex flex-col mt-5'>
                <div className='ml-2 mb-0.5'>Upload Certified documents</div>
                <input
                  className='border-0'
                  type="file"
                  name="myImage"
                  accept='image/*'
                  multiple
                  // Event handler to capture file selection and update the state
                  onChange={(event) => {
                    // console.log([...event.target.files]); // Log the selected file
                    setSelectedImages([...event.target.files]); // Update the state with the selected file
                  }}
                />
              </div>

              {/* <div className="flex justify-between items-center bg-gray-300 rounded-xl mt-5">
                <img
                  src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbDCthbE7NQmM9X_A6oXZyUBbVgXeRV1b_2AN8zEmuZg&s"}
                  alt={"Project Title"}
                  className="rounded-xl h-64 w-full sm:w-1/3 object-cover shadow-lg"
                />
              </div> */}

              {selectedImages && selectedImages.length > 0 &&
                <div className='flex flex-wrap'>
                  {
                    selectedImages.map((image, index) => (
                      <div key={index} className='flex p-3'>
                        {/* Display the selected image */}
                        <img
                          alt="not found"
                          width={"250px"}
                          src={URL.createObjectURL(image)}
                        />
                        <br />
                        <button onClick={() => handleRemoveImage(index)}>Remove</button>
                      </div>
                    ))}
                </div>
              }


              <button type='submit' className='inline-block px-6 py-2.5
                bg-green-600 text-white font-medium text-md leading-tight
                rounded-full shadow-md 
                hover:bg-green-700 mt-5'
                onClick={handleSubmit}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register