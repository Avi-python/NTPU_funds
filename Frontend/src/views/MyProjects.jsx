import { useEffect, useState } from 'react'
import ProgressingProjects from '../components/ProgressingProjects'
import { loadProjects, isProjectFundReviewing } from '../services/blockchain'
import { getGlobalState } from '../store'

function ProgressingProject() {

    const projects = getGlobalState('projects');
    const [isFundReviewings, setIsFundReviewings] = useState([]); 

    useEffect(() => {
        async function load() {
            if(projects.length === 0){
                console.log('Loading projects...');
                await loadProjects();
            }
            let tmp = [];
            for(let i = 0; i < projects.length; i++) {
                const result = await isProjectFundReviewing(projects[i].id);
                tmp.push(result);
            }
            setIsFundReviewings(tmp);
        };

        load();
    }, [projects])

  return (
    <>
      <ProgressingProjects isFundReviewings={isFundReviewings} />
    </>
  )
}

export default ProgressingProject