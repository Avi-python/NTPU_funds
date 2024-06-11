import { useEffect } from 'react'
import ProgressingProjects from '../components/ProgressingProjects'
import { loadProjects } from '../services/blockchain'
import { getGlobalState } from '../store'

function ProgressingProject() {

    const projects = getGlobalState('projects');

    useEffect(() => {
        async function load() {
            if(projects.length === 0){
                console.log('Loading projects...');
                await loadProjects();
            }
        };

        load();
    }, [projects])

  return (
    <>
      <ProgressingProjects />
    </>
  )
}

export default ProgressingProject