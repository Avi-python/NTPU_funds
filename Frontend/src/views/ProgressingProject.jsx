import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProgressCells from '../components/ProgressCells'
import CreateProgressCell from '../components/CreateProgressCell'
import ProgressCellDetails from '../components/ProgressCellDetails'
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
    }, []);

    if (progress === null) {
        return (
            <div className="py-24 px-6 flex justify-center">
                wait for request...
            </div>
        )
    }

    return (
        <>
            <ProgressCells progress={progress} />
            <CreateProgressCell projectId={id} />
            <ProgressCellDetails projectId={id} />
        </>
    )
}

export default ProgressingProject