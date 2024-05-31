import { useEffect, useState } from 'react'
import { useGlobalState } from '../store'
import { getNFTs } from '../services/blockchain'

function FollowNFT() {

    const [connectedAccount] = useGlobalState('connectedAccount');
    const [nfts, setNFTs] = useState(null);

    useEffect(() => {
        async function loadNFTs() {
            const result = await getNFTs(connectedAccount);
            setNFTs(result);
        }
        loadNFTs();
    }, [connectedAccount])
  
  if(nfts === null  ) {
    return (
      <div className="py-24 px-6 flex justify-center">
        loading NFTs... 
      </div>
    )
  }

  return (
    <div className="flex flex-col px-6 py-24 mb-7">
      <div className="flex justify-center items-center flex-wrap">
        {nfts
          .map((nft, i) => (
            <NFTCard key={i} nft={nft} />
          ))}
      </div>

      {/* {.length > 0 && (projects.length > collection.length)
        ? (<div className="flex justify-center items-center my-5">
          <button type='button' className='inline-block px-6 py-2.5
        bg-green-600 text-white font-medium text-xs leading-tight
        uppercase rounded-full shadow-md hover:bg-green-700'
            onClick={() => setEnd(end + count)}
          >
            Load more
          </button>
        </div>)
        : (null)} */}

    </div>
  )
}

const NFTCard = ({ nft }) => {

  // const isExpired = new Date().getTime() > Number(project?.expiresAt + '000');

  return <div id="nft" className="shadow-lg bg-yellow-200 w-64 sm:w-80 m-4" style={{borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px'}}>
      <img
        src={nft.imageURL}
        alt={nft.title}
        className="rounded-full shadow-md h-64 sm:h-80 w-full object-cover"
      />

      <div className="p-4">
        <h5>{nft.title}</h5>
      </div>
  </div>
}

export default FollowNFT