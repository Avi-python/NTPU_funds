import { TbBusinessplan } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { connectWallet } from '../services/blockchain.jsx'
import { useGlobalState, truncate } from '../store/index.jsx'
import { isAppOwner } from '../services/blockchain.jsx'
import { useEffect, useState, useRef } from 'react'
import { setGlobalState } from '../store/index.jsx'

const Header = ({ loaded }) => {
  const [connectedAccount] = useGlobalState('connectedAccount');
  const [is_app_owner, setIsAppOwner] = useState(false);
  const headerRef = useRef(null);
  
  useEffect(() => {
    async function checkAppOwner() {
      const result = await isAppOwner(connectedAccount);
      setIsAppOwner(result);
    } 
    function storeHeader(height) {
        setGlobalState("headerHeight", height);
    }
    checkAppOwner();
    storeHeader(headerRef.current.offsetHeight);

  }, [loaded, connectedAccount])
 
  return (
    <header ref={headerRef} className="flex justify-between items-center  bg-white text-gray-50
    shadow-lg fixed top-0 left-0 right-0">
      <div className="flex justify-start items-center">
        <Link
          to="/"
          className="flex justify-start items-center p-5">
          <div className='font-extrabold space-x-1 text-3xl'>
            <span className='text-blue-700'>N</span> 
            <span className='text-emerald-700'>T</span>
            <span className='text-yellow-400'>P</span>
            <span className='text-red-700'>U</span>
          </div>
          <p className='text-black ml-5 text-xl'>Funds</p>
          <TbBusinessplan />
        </Link>


        <div className='space-x-3'>
          <Link to="/register" className="text-black">Register</Link>

          {is_app_owner ? (
            <Link to="/application" className="text-black">Application</Link>
          ) : null
          }
        </div>

      </div>

      {/* <div className='flex justify-center items-stretch text-black'>
        <div className='bg-blue-700 w-20 h-20 m-0'></div>
        <div className='bg-emerald-700 w-20 h-20 m-0'></div>
        <div className='bg-yellow-400 w-20 h-20 m-0'></div>
        <div className='bg-red-700 w-20 h-20 m-0'></div>
      </div> */}

      <div className="flex space-x-2 justify-center p-5">
        {connectedAccount ? (
          <button type='button' className='inline-block px-6 py-2.5
          bg-blue-500 text-white font-medium text-xs leading-tight
          uppercase rounded-full shadow-md hover:bg-blue-900'
          >{truncate(connectedAccount, 4, 4, 11)}</button>
        ) : (
          <button type='button' className='inline-block px-6 py-2.5
        bg-blue-500 text-white font-medium text-xs leading-tight
        uppercase rounded-full shadow-md hover:bg-blue-900'
            onClick={connectWallet}
          >Connect Wallet</button>
        )
        }
      </div>
    </header>
  )
}

export default Header