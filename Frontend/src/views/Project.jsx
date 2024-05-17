import { useEffect, useState } from "react"
import BackProject from "../components/BackProject"
import DeleteProject from "../components/DeleteProject"
import ProjectBackers from "../components/ProjectBackers"
import ProjectDetails from "../components/ProjectDetails"
import UpdateProject from '../components/UpdateProject'
import { loadProject, getBackers } from "../services/blockchain"
import { useParams } from "react-router-dom"
import { useGlobalState } from "../store"

const Project = () => {
  const { id } = useParams();
  const [project] = useGlobalState('project');
  const [backers] = useGlobalState('backers');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      await loadProject(id);
      await getBackers(id);
      setLoaded(true);
    }
    load();
  }, []);

  return (
    <>
      {loaded ? (
        <>
          <ProjectDetails project={project} />
          <UpdateProject project={project} />
          <DeleteProject project={project} />
          <BackProject project={project} />
          <ProjectBackers backers={backers} />
        </>
      ) : null}
    </>
  )
}

export default Project