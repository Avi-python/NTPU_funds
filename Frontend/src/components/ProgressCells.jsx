import { setGlobalState } from "../store";

function ProgressingProjectDetails({ progress }) {

  return (
    <div className="py-24 px-6 flex flex-col justify-center">

      <div className="flex justify-center item-center space-x-2 mb-5">
        <button type='button' className='inline-block px-6 py-2.5
                    bg-blue-500 text-white font-medium text-xs leading-tight
                    uppercase rounded-full shadow-md 
                    hover:bg-blue-900' 
                    onClick={() => setGlobalState("createProgressCellModal", "scale-100")}
        >
          New Process Cell
        </button>
      </div>

      <div className="flex flex-col justify-center items-start w-full md:w-2/3 px-6 mx-auto">
        <div className="max-h-[calc(100vh_-_25rem)] overflow-y-auto shadow-md rounded-md w-full mb-10">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th scope="col"
                  className="text-sm font-medium px-6 py-4 text-left"
                >
                </th>
                <th scope="col"
                  className="text-sm font-medium px-6 py-4 text-left"
                >
                  Time
                </th>
                <th scope="col"
                  className="text-sm font-medium px-6 py-4 text-left hidden md:table-cell"
                >
                  Title
                </th>
              </tr>
            </thead>
            <tbody>
              {progress != null && progress.length > 0 ? progress.map((progressCell, i) => {
                console.log("progressCell:", progressCell);
                return <ProgressCell key={i} progressCell={progressCell} />
              }) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

}

const ProgressCell = ({ progressCell }) => {

  return <tr className="border-b border-gray-200">

    <td className="px-6 py-4">
      <button
        type='button'
        className='inline-block px-6 py-2.5
              bg-gray-400 text-white font-medium text-xs leading-tight
              uppercase rounded-full shadow-md 
              hover:bg-gray-700'
      onClick={() => { 
          setGlobalState("closeProgressCell", false); 
          setGlobalState("progressCellDetails", progressCell);
      }}
      >
        View
      </button>
    </td>

    <td className="text-sm font-light
                          px-6 py-4 whitespace-nowrap"
    >
      {/* <div className="flex justify-start items-center space-x-2">
              <Identicon
                  className="h-10 w-10 object-contain rounded-full shadow-md"
                  string={applicant?.address}
                  size={25} />
              <span>{truncate(applicant?.address, 4, 4, 11)}</span>
          </div> */}
      <p>
        {/* {progressCell?.time} */}
        {progressCell?.upload_date}
      </p>
    </td>

    <td className="text-lg font-normal
                          px-6 py-4 whitespace-nowrap hidden md:table-cell"
    >
      <small className="flex justify-start items-center">
        {progressCell?.title}
      </small>
    </td>
  </tr>
};

export default ProgressingProjectDetails