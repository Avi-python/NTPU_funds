import Hero from '../components/Hero'
import Projects from '../components/Projects'
import AddButton from '../components/AddButton'
import CreateProject from '../components/CreateProject'
import { useEffect, useState } from 'react'
import { loadProjects } from '../services/blockchain'
import { useGlobalState } from '../store'

const Home = () => {

  // 載入 projects
  const [projects] = useGlobalState('projects');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {

    async function load() {
      console.log('Loading projects...');
      await loadProjects();
      console.log('Loading projects done.');
      setLoaded(true);
    };
    
    load();

  }, [])


  return (
    <>
      {loaded ? (
        <>
          <Hero />
          <Projects projects={projects} />
          <CreateProject />
          <AddButton />
        </>
      ) : null}
    </>
  )
}

export default Home
