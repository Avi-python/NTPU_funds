import { useEffect, useState } from 'react'
import { requestCertifiedDoc } from '../services/user'

function CertifiedDoc({ doc }) {

    const [image, setImage] = useState(null);
    
    useEffect(() => {
        async function load(){
            const result = await requestCertifiedDoc(doc);
            // console.log("result:", result.data);
            setImage(result.data);
        }
        load();
    }, []);

    if(image === null){
        return <div>wait for loading doc..</div>
    }

  return (
    <div className='m-3'>
      <img
          alt="not found"
          width={"250px"}
          src={`data:image/jpeg;base64,${image}`}
      />
    </div>
  )

}

export default CertifiedDoc