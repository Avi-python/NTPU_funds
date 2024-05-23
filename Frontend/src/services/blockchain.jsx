import abi from '../abis/src/contracts/Genesis.sol/Genesis.json';
import address from '../abis/contractAddress.json';
import { getGlobalState, setGlobalState } from '../store';
import { ethers } from 'ethers';


const { ethereum } = window;
const contractAddress = address.address;
const contractAbi = abi.abi;

const connectWallet = async () => {
  try {
    if (!ethereum) return alert('Please install MetaMask!');
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    setGlobalState('connectedAccount', accounts[0]?.toLowerCase());
  } catch (error) {
    reportError(error);
  }
};

const isWallectConnected = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    setGlobalState('connectedAccount', accounts[0]?.toLowerCase());

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', async () => {
      setGlobalState('connectedAccount', accounts[0]?.toLowerCase());
      await isWallectConnected();
    });

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0]?.toLowerCase());
    } else {
      alert('Please connect wallet.');
      console.log('No accounts found.');
    }
  } catch (error) {
    reportError(error);
  };
};

const getSignature = async (message) => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const messageHash = ethers.utils.id(message);
  const messageBytes = ethers.utils.toUtf8Bytes(messageHash);
  
  try {
    const signature = await signer.signMessage(messageBytes);
    return { signature: signature, msg_hash: messageHash };
  } catch (error) {
    reportError(error);
  }

}

const getEtheriumContract = async () => {
  const contract = getGlobalState('contract');

  if (contract === null) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    setGlobalState('contract', contract);

    return contract;
  } else {
    return getGlobalState('contract');
  }
};

const createProject = async ({
  title,
  description,
  imageURL,
  cost,
  expiresAt,
}) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    // console.log('Creating project...');
    const contract = await getEtheriumContract();
    cost = ethers.utils.parseEther(cost); // 從 integer 轉成 wei ( 而我們 integer 使用的單位是 Ether )
    await contract.createProject(title, description, imageURL, cost, expiresAt);
    // console.log('Creat over.');
    // await tx.wait();
    // await loadProjects();
  } catch (error) {
    reportError(error);
  }
};

const updateProject = async ({
  id,
  title,
  description, // cost 沒有辦法更新喔喔
  imageURL,
  expiresAt,
}) => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    const contract = await getEtheriumContract()
    await contract.updateProject(id, title, description, imageURL, expiresAt)
    // await tx.wait()
    // await loadProject(id)
  } catch (error) {
    reportError(error)
  }
}

const deleteProject = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()
    await contract.deleteProject(id)
  } catch (error) {
    reportError(error)
  }
}

const loadProjects = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask');

    // console.log('Loading projects...');
    const contract = await getEtheriumContract();
    const projects = await contract.getProjects();
    console.log('projects', projects);
    const stats = await contract.stats();
    // console.log('Projects loaded.');

    setGlobalState('stats', structureStats(stats));
    setGlobalState('projects', structuredProjects(projects));

  } catch (error) {
    reportError(error)
  }
};

// 抓單一個 project 的資料
const loadProject = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const contract = await getEtheriumContract();
    const project = await contract.getProject(id);

    // console.log('project', project);

    setGlobalState('project', structuredProjects([project])[0]);
  } catch (error) {
    alert(JSON.stringify(error.message));
    reportError(error);
  }
};

const backProject = async (id, amount) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const connectedAccount = getGlobalState('connectedAccount');
    const contract = await getEtheriumContract();
    amount = ethers.utils.parseEther(amount);

    await contract.backProject(id, {
      from: connectedAccount,
      value: amount._hex,
    })

    // await tx.wait()
    // await getBackers(id)
  } catch (error) {
    reportError(error)
  }
};

const getBackers = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const contract = await getEtheriumContract();
    let backers = await contract.getBackers(id);

    setGlobalState('backers', structuredBackers(backers))
  } catch (error) {
    reportError(error)
  }
};

const payoutProject = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const connectedAccount = getGlobalState('connectedAccount');
    const contract = await getEtheriumContract();

    await contract.payOutProject(id, {
      from: connectedAccount, // msg.sender
    });

    // await tx.wait()
    // await getBackers(id)
  } catch (error) {
    reportError(error)
  }
};

const structuredBackers = (backers) =>
  backers.map((backer) => ({
    owner: backer.owner.toLowerCase(), // backer.owner 是指 backer 的 address
    refunded: backer.refunded,
    timestamp: new Date(backer.timestamp.toNumber() * 1000).toJSON(),
    contribution: parseInt(backer.contributions._hex) / 10 ** 18, // Ether
  }))
    .reverse();

const structuredProjects = (projects) =>
  projects
    .map((project) => ({
      id: project.id.toNumber(),
      owner: project.owner.toLowerCase(),
      title: project.title,
      description: project.description,
      timestamp: new Date(project.timestamp.toNumber()).getTime(),
      expiresAt: new Date(project.expiresAt.toNumber()).getTime(),
      date: toDate(project.expiresAt.toNumber() * 1000),
      imageURL: project.imageURL,
      raised: parseInt(project.raised._hex) / 10 ** 18, // Ether
      cost: parseInt(project.cost._hex) / 10 ** 18, // Ether
      backers: project.backers.toNumber(),
      status: project.status,
    }))
    .reverse();

const toDate = (timestamp) => {
  const date = new Date(timestamp);
  const dd = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}` // 日期 >= 10 補 0
  const mm =
    date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}` // 月份 >= 10 補 0
  const yyyy = date.getFullYear()
  return `${yyyy}-${mm}-${dd}`
};

const structureStats = (stats) => ({
  totalProject: stats.totalProject.toNumber(),
  totalBacking: stats.totalBacking.toNumber(),
  totalDonations: parseInt(stats.totalDonations) / 10 ** 18,
});

const reportError = (error) => {
  console.error(error.message);
  throw new Error("No ethereum object.");
};

export {
  connectWallet,
  isWallectConnected,
  getSignature,
  createProject,
  updateProject,
  deleteProject,
  backProject,
  getBackers,
  payoutProject,
  loadProjects,
  loadProject
};