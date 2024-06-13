import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProgressCells from '../components/ProgressCells'
import CreateProgressCell from '../components/CreateProgressCell'
import ProgressCellDetails from '../components/ProgressCellDetails'
import ProgressMeta from '../components/ProgressMeta'
import Vote from '../components/Vote'
import { requestProgress, requestLogin } from '../services/user'

function ProgressingProject() {

    const { id } = useParams();
    const [progress, setProgress] = useState(null);

    console.log("id", id);

    useEffect(() => {
        async function getProgress() {
            try {
                const res = await requestProgress(id);
                setProgress(res);
            } catch (error) {
                console.log("error:", error);
                if(error.response.status === 401) {
                    try {
                        console.log("requestLogin");
                        await requestLogin();
                        const res = await requestProgress(id);
                        setProgress(res);
                        console.log("progress:", progress);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
        getProgress();
    }, [id]);

    if (progress === null) {
        return (
            <div className="py-24 px-6 flex justify-center">
                wait for request...
            </div>
        )
    }

    return (
        <>
            <ProgressMeta projectId={id} />
            <ProgressCells projectId={id} progress={progress} />
            <CreateProgressCell projectId={id} />
            <ProgressCellDetails projectId={id} />
            <Vote projectId={id} />
        </>
    )
}

export default ProgressingProject