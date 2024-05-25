import { useEffect, useState } from "react"
import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Home from "./views/Home"
import Project from "./views/Project"
import Register from "./views/Register"
import Application from "./views/Application"
import { isWallectConnected } from "./services/blockchain"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const App = () => {

  const [loaded, setLoaded] = useState(false);

  // useEffect(async () => {
  //   await new Promise((resolve) => setTimeout(resolve, 3000));
  //   await isWallectConnected();
  //   console.log("Blockchain loaded");
  // }, []) 

  // 不管是上面還是下面的 useEffect，都不會等待 isWallectConnected() 執行完畢才 render 頁面。

  useEffect(() => {
    async function checkWallet() {
      // await new Promise((resolve) => setTimeout(resolve, 3000));
      await isWallectConnected();
      console.log("Blockchain loaded");
      setLoaded(true);
    };
    checkWallet();
  }, []) // 我們後面傳了一個空陣列，這樣 useEffect 就只會在元件第一次 render 時執行一次

  return (
    <div className="min-h-screen relative">
      <Header loaded={loaded} />

      {loaded ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:id" element={<Project />} />
          <Route path="/register" element={<Register />} />
          <Route path="/application" element={<Application />} />
        </Routes>
      ) : null}

      <ToastContainer // 這是一個 toast 的元件，用來顯示提示訊息
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default App
