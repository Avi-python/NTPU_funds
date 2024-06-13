import { useEffect, useState } from 'react'
import { useGlobalState } from '../store'
import { Link } from 'react-router-dom'
import { daysRemaining } from '../store'
import { FaEthereum } from 'react-icons/fa'


function ProgressingProjects({ isFundReviewings }) {

    const [end, setEnd] = useState(4);
    const [count] = useState(4);
    const [projects] = useGlobalState('projects');
    const [collection, setCollection] = useState([]);

    useEffect(() => {
        setCollection(projects.slice(0, end));
    }, [projects, end]);

  return (
    <div className="flex flex-col px-6 py-24 mb-7">
        <div className="flex justify-center items-center flex-wrap">
        {collection
          .map((project, i) => {
            if(project.status === 4 && project.owner === window.ethereum.selectedAddress.toLowerCase()){
              return <ProjectCard key={i} project={project} isFundReviewing={isFundReviewings[i]}/>
            }
          })}
      </div>
    </div>
  )
}

const ProjectCard = ({ project, isFundReviewing }) => {

    const isExpired = new Date().getTime() > Number(project?.expiresAt + '000');
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const needReview = currentTimestamp >= project?.fundReviewAt && currentTimestamp < project?.expiresAt;
  
  return <div id="projects" className={`rounded-lg shadow-lg ${isFundReviewing ? 'bg-emerald-200' : isExpired ? 'bg-red-400' : 'bg-white'} w-64 sm:w-80 m-4`}>
      <Link to={"/progressing_project/" + project.id}> {/* project 本身有 id */}

        <img
          src={project.imageURL}
          alt={project.title}
          className="rounded-xl h-64 sm:h-80 w-full object-cover"
        />
  
        { needReview ?
        <div className="mt-1 p-4 bg-blue-400 rounded-xl">
          <p className="text-black font-bold text-center">Needs FundReview</p>
        </div>
        : null} 

        <div className="p-4">
          <h5>{project.title}</h5>
  
          <div className="flex flex-col">
  
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
                isExpired ? // TODO : 要調整一下，過期是否要將錢退給 backers，從而變成 Reverted。
                  (<small className='text-red-500'>Expired</small>)
                  : project?.status === 0
                    ? (<small className='text-gray-500'>Open</small>)
                    : project?.status === 1
                      ? (<small className='text-green-500'>Approved</small>)
                      : project?.status === 2
                        ? (<small className='text-gray-500'>Reverted</small>)
                        : project?.status === 3
                          ? (<small className='text-red-500'>Deleted</small>)
                          : project?.status === 4
                            ? (<small className='text-blue-500'>Progressing</small>)
                            :
                            (
                              <small className='text-orange-500'>Paid Out</small>
                            )
              }
            </div>
          </div>
        </div>
      </Link>
    </div>
  }

export default ProgressingProjects