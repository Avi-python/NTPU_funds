import NTPUFundabi from '../abis/src/contracts/NTPUFund.sol/NTPUFund.json';
import NTPUVoteabi from '../abis/src/contracts/NTPUVote.sol/NTPUVote.json';
import ntpuFund_address from '../abis/NTPUFundContractAddress.json';
import ntpuVote_address from '../abis/NTPUVoteContractAddress.json';
import { getGlobalState, setGlobalState } from '../store';
import { ethers } from 'ethers';


const { ethereum } = window;
const NTPUFundContractAddress = ntpuFund_address.address;
const NTPUFundContractAbi = NTPUFundabi.abi;
const NTPUVoteContractAddress = ntpuVote_address.address;
const NTPUVoteContractAbi = NTPUVoteabi.abi;

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
      localStorage.removeItem('authTokenAccess');
      localStorage.removeItem('authTokenRefresh');
      // 要將存這著的 token 刪掉
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

const getNTPUFundContract = async () => {
  const contract = getGlobalState('contract');

  if (contract === null) {
    console.log('Creating contract...');
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(NTPUFundContractAddress, NTPUFundContractAbi, signer);
    setGlobalState('contract', contract);

    return contract;
  } else {
    return contract;
  }
};

const getNTPUVoteContract = async () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(NTPUVoteContractAddress, NTPUVoteContractAbi, signer);
  return contract;
}

const createProject = async ({
  title,
  description,
  imageURL,
  cost,
  duration,
  expiresAt,
}) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    // console.log('Creating project...');
    const contract = await getNTPUFundContract();
    cost = ethers.utils.parseEther(cost); // 從 integer 轉成 wei ( 而我們 integer 使用的單位是 Ether )
    await contract.createProject(title, description, imageURL, cost, duration, expiresAt);
  } catch (error) {
    reportError(error);
  }
};

const deleteProject = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const contract = await getNTPUFundContract()
    await contract.deleteProject(id)
  } catch (error) {
    reportError(error)
  }
}

const payoutProject = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const connectedAccount = getGlobalState('connectedAccount');
    const contract = await getNTPUFundContract();

    await contract.payOutProject(id, {
      from: connectedAccount, // msg.sender
    });

    // await tx.wait()
    // await getBackers(id)
  } catch (error) {
    reportError(error)
  }
};

const startProject = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const connectedAccount = getGlobalState('connectedAccount');
    const contract = await getNTPUFundContract();

    await contract.startProject(id, {
      from: connectedAccount, // msg.sender
    });

    // await tx.wait()
    // await getBackers(id)
  } catch (error) {
    reportError(error)
  }
}

const createFundReview = async (projectId) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const contract = await getNTPUVoteContract();
    await contract.createFundReview(projectId);
  } catch (error) {
    reportError(error);
  }
}

const loadProjects = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask');

    // console.log('Loading projects...');
    const contract = await getNTPUFundContract();
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
    const contract = await getNTPUFundContract();
    const project = await contract.getProject(id);

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
    const contract = await getNTPUFundContract();
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

const voteReview = async (projectId, option) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const connectedAccount = getGlobalState('connectedAccount');
    const contract = await getNTPUVoteContract();

    await contract.vote(projectId, option, {
      from: connectedAccount,
    });
 } catch (error) {
  reportError(error);
 }
}

const requestRefund = async (project) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const connectedAccount = getGlobalState('connectedAccount');
    const contract = await getNTPUFundContract();

    await contract.requestRefund(project.id, Math.floor(new Date().getTime() / 1000), {
      from: connectedAccount,
    });

  } catch (error) {
    reportError(error)
  }
  
}

const getBackers = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const contract = await getNTPUFundContract();
    let backers = await contract.getBackers(id);

    setGlobalState('backers', structuredBackers(backers))
  } catch (error) {
    reportError(error)
  }
};

const getNFTs = async (address) => {

  try {
    if (!ethereum) return alert('Please install Metamask');

    const contract = await getNTPUFundContract();
    let result = await contract.getNfts(address);
    let nfts = [];

    for(let i = 0; i < result.length; i++){
      nfts.push(JSON.parse(result[i]));
    }

    return nfts;
  } catch (error) {
    reportError(error);
  }
}

const getFundingInstallment = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask');

    const contract = await getNTPUFundContract();
    let result = await contract.getFundingInstallment(); // 這個回傳是一個 bignumber


    return result.toNumber();
  } catch (error) {
    reportError(error);
  }
}

const getFundReviews = async (projectId) => {
  try {
    if (!ethereum) return alert('Please install Metamask');

    const contract = await getNTPUVoteContract();
    let fundReviews = await contract.getFundReviews(projectId);

    return structureFundReviews(fundReviews);
  } catch (error) {
    reportError(error);
  }

}

const isAppOwner = async (account) => {
  try {
    if(!ethereum) return alert('Please install Metamask');
    const contract = await getNTPUFundContract();

    if(account === ""){
      return false;
    }

    let result = await contract['isAppOwner(address)'](account);
  
    return result;

  } catch (error) {
    reportError(error);
  }
}

const isCreator = async (account) => {
  try {
    if(!ethereum) return alert('Please install Metamask');
    const contract = await getNTPUFundContract();

    if(account === ""){
      return false;
    }

    console.log('account', account); 

    let result = await contract.isCreator(account);


    return result;
  } catch (error) {
    reportError(error);
  }
}

const isProjectCreator = async (projectId, account) => {
  try {
    if(!ethereum) return alert('Please install Metamask');
    const contract = await getNTPUFundContract();

    if(account === ""){
      return false;
    }

    let result = await contract.isProjectCreator(projectId, account);

    return result;
  } catch (error) {
    reportError(error);
  }
}

const isProjectFundReviewing = async (projectId) => {
  try {
    
    if(!ethereum) return alert('Please install Metamask');
    const contract = await getNTPUVoteContract();

    let result = await contract.isFundReviewing(projectId);

    return result;
 } catch (error) {
  reportError(error);
 }
}


const structuredBackers = (backers) =>
  backers.map((backer) => ({
    owner: backer.owner, // backer.owner 是指 backer 的 address
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
      fundReviewAt: new Date(project.fundReviewAt.toNumber()).getTime(),
      duration: project.duration.toNumber(),
      date: formatTimestamp(project.expiresAt.toNumber() * 1000),
      reviewDate: formatTimestamp(project.fundReviewAt.toNumber() * 1000),
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

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are 0-based in JavaScript
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Pad single digit numbers with a leading zero
    const paddedMonth = month < 10 ? `0${month}` : month;
    const paddedDay = day < 10 ? `0${day}` : day;
    const paddedHours = hours < 10 ? `0${hours}` : hours;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${year}-${paddedMonth}-${paddedDay} ${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

const structureStats = (stats) => ({
  totalProject: stats.totalProject.toNumber(),
  totalBacking: stats.totalBacking.toNumber(),
  totalDonations: parseInt(stats.totalDonations) / 10 ** 18,
});

const structureFundReviews = (fundReviews) => 
  fundReviews
  .map((fundReview) => ({
      fundReviewId: fundReview.fundReviewId.toNumber(),
      projectId: fundReview.projectId.toNumber(),
      startDate: new Date(fundReview.startDate.toNumber()).getDate(),
      endDate: new Date(fundReview.endDate.toNumber()).getDate(),
      passCount: fundReview.passCount.toNumber(),
      totalVoteCount: fundReview.totalVoteCount.toNumber(),
    }))
    .reverse()

const reportError = (error) => {
  console.error(error.message);
  throw new Error("No ethereum object.");
};

export {
  connectWallet,
  isWallectConnected,
  getSignature,
  createProject,
  createFundReview,
  deleteProject,
  backProject,
  voteReview,
  requestRefund,
  payoutProject,
  startProject,
  getBackers,
  getNFTs,
  getFundingInstallment,
  getFundReviews,
  isAppOwner,
  isCreator,
  isProjectCreator,
  isProjectFundReviewing,
  loadProjects,
  loadProject
};