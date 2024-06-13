import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Identicons from 'react-identicons'
import { truncate, daysRemaining } from '../store'
import { FaEthereum } from 'react-icons/fa'

const Project = ({ projects }) => {
  const [end, setEnd] = useState(4);
  const [count] = useState(4);
  const [collection, setCollection] = useState([]);

  useEffect(() => {
    setCollection(projects.slice(0, end));
  }, [projects, end]);

  return (
    <div className="flex flex-col px-6 mb-7">
      <div className="flex justify-center items-center flex-wrap">
        {collection
          .map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
      </div>

      {projects.length > 0 && (projects.length > collection.length)
        ? (<div className="flex justify-center items-center my-5">
          <button type='button' className='inline-block px-6 py-2.5
        bg-green-600 text-white font-medium text-xs leading-tight
        uppercase rounded-full shadow-md hover:bg-green-700'
            onClick={() => setEnd(end + count)}
          >
            Load more
          </button>
        </div>)
        : (null)}

    </div>
  )
}

const ProjectCard = ({ project }) => {

  const isExpired = new Date().getTime() > Number(project?.expiresAt + '000');

  return <div id="projects" className="rounded-lg shadow-lg bg-white w-64 sm:w-80 m-4">
    <Link to={"/projects/" + project.id}> {/* project 本身有 id */}
      <img
        src={project.imageURL}
        alt={project.title}
        className="rounded-xl h-64 sm:h-80 w-full object-cover"
      />

      <div className="p-4">
        <h5>{project.title}</h5>

        <div className="flex flex-col">
          <div className="flex justify-start space-x-2 items-center mt-1 mb-3">
            <Identicons
              className="rounded-full shadow-md"
              string={project.owner}
              size={15}
            />
            <small className="text-gray-700">{truncate(project.owner, 4, 4, 11)}</small>
          </div>

          <small className='text-gray-500'>
            {/* project.expiresAt 是 number 但是和 string 相加會自動轉成 str，而補三個零是想要將單位從秒變成毫秒，因為 Date().getTime() 是回傳當下的毫秒數 */}
            {new Date().getTime() > Number(project.expiresAt + '000')
              ? ('Expired')
              : (daysRemaining(project.expiresAt) + ' left')}
          </small>
        </div>

        <div className="w-full bg-gray-300">
          <div className="bg-green-600 text-xs font-medium text-green-100
          text-center p-0.5 leading-none rounded-l-full" style={{ width: (`${(project.raised / project.cost) * 100 > 100 ? 100 : (project.raised / project.cost) * 100}%`) }}></div>
        </div>

        <div className='flex justify-between items-center font-bold mt-1 mb-2 text-gray-500'>
          <small>{project.raised} ETH Raised</small>
          <small className='flex justify-start items-center'>
            <FaEthereum />
            <span>{project.cost} ETH</span>
          </small>
        </div>

        <div
          className="flex justify-between items-center flex-wrap 
          mt-4 mb-2 text-gray-500 font-bold"
        >
          <small>{project.backers} Backer{project.backers === 1 ? '' : 's'}</small>
          <div>
            {
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
        </div>
      </div>
    </Link>
  </div>
}

export default Project