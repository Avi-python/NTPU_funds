//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Genesis is ERC721, ERC721URIStorage {
    address public owner;
    uint public projectTax; // 稅，owner 要吃的稅 per project
    uint public projectCount;
    uint public balance; // 合約內的餘額
    uint public tokenCounter;
    statsStruct public stats;
    projectStruct[] projects;

    mapping(address => projectStruct[]) projectsOf; // 
    mapping(uint => backerStruct[]) backersOf; // input project id and return all backers of that project
    mapping(uint => bool) public projectExist;
    mapping(address => bool) public CreatorExist;
    mapping(uint => uint[]) public projectOfNFTs;
    mapping(address => uint[]) public UserOfNFTs;

    enum statusEnum {
        OPEN,
        APPROVED, // 代表達標
        REVERTED,
        DELETED,
        PROGRESSING, // 正在進行這項計畫中
        PAIDOUT // 錢都繳出去了
    }

    struct statsStruct {
        uint totalProject;
        uint totalBacking;
        uint totalDonations;
    }

    struct backerStruct {
        address owner; // backer's address
        uint contributions; // back for specific project
        uint timestamp;
        bool refunded; // 是否以退款
    }

    struct projectStruct {
        uint id;
        address project;
        address owner;
        string title;
        string description;
        string imageURL;
        uint cost; // request money
        uint raised; // money already gained
        uint timestamp;
        uint expiresAt;
        uint backers;
        statusEnum status;
    }

    modifier creatorOrOwnerOnly() { // TODO : 這個權限可能有待調整
       require(CreatorExist[msg.sender] || msg.sender == owner, "Creator Or Owner reserved only");
        _; // modifier 要加這個酷東西
    }

    modifier ownerOnly() {
        require(msg.sender == owner, "Owner reserved only");
        _; // modifier 要加這個酷東西
    }

    event Action(
        uint256 id,
        string actionType,
        address indexed executor, // 編譯器會在事件日誌的索引中儲存此參數的值，方便之後查詢此索引相關的事件
        uint256 timestamp
    );

    constructor(uint _projectTax) ERC721("NtpuFund", "NTPU") {
        tokenCounter = 0;
        owner = msg.sender;
        projectTax = _projectTax;
    }

    function _createCollectible(address to, string memory uri) internal returns (uint) {
        uint _tokenId = tokenCounter;
        _safeMint(to, _tokenId);
        _setTokenURI(_tokenId, uri);
        tokenCounter += 1;
        return _tokenId;
    }

    function projectMint(uint id) internal {
        require(projectExist[id], "Project not found");
        require(projects[id].status == statusEnum.APPROVED, "Project is not approved yet");

        backerStruct[] memory backers = backersOf[id];

        for(uint i = 0; i < backers.length; i++){
            address _owner = backers[i].owner;
            string memory _uri = string(abi.encodePacked('{"title": "', projects[id].title, '", "imageURL": "', projects[id].imageURL, '"}')); // TODO : 不知道這行是不是對的
            uint tokenId = _createCollectible(_owner, _uri  );
            projectOfNFTs[id].push(tokenId);
            UserOfNFTs[_owner].push(tokenId);
        }
        
        emit Action(id, "NFTs MINTED", msg.sender, block.timestamp);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function addCreator(address _newCreator) public ownerOnly {
        CreatorExist[_newCreator] = true;

        emit Action(0, "CREATOR ADDED", msg.sender, block.timestamp);
    }

    function createProject(
        string memory title,
        string memory description,
        string memory imageURL,
        uint cost,
        uint expiresAt
    ) public creatorOrOwnerOnly returns (bool) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(imageURL).length > 0, "ImageURL cannot be empty");
        require(cost > 0 ether, "Cost cannot be zero"); 
        // TODO: 要限制失效時間點設在創建這個 project 以後
        // require(expiresAt > block.time, "Cost cannot be zero"); 

        projectStruct memory project;
        project.id = projectCount;
        project.owner = msg.sender;
        project.title = title;
        project.description = description;
        project.imageURL = imageURL;
        project.cost = cost;
        project.timestamp = block.timestamp;
        project.expiresAt = expiresAt;

        projects.push(project);
        projectExist[projectCount] = true;
        projectsOf[msg.sender].push(project);
        stats.totalProject += 1;

        emit Action(projectCount++, "PROJECT CREATE", msg.sender, block.timestamp);
        
        return true;
    }

    function updateProject(
        uint id,
        string memory title,
        string memory description,
        string memory imageURL,
        uint expiresAt
    ) public creatorOrOwnerOnly returns (bool) {
        require(projectExist[id], "Project not found"); // 主播說下面那一行其實已經有確認 exist 的邏輯了，因此不需要這行
        require(msg.sender == projects[id].owner, "Unauthorized Entity");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(imageURL).length > 0, "ImageURL cannot be empty");

        projects[id].title = title;
        projects[id].description = description;
        projects[id].imageURL = imageURL;
        projects[id].expiresAt = expiresAt;

        emit Action(id, "PROJECT UPDATED", msg.sender, block.timestamp);
        
        return true;
    }

    function deleteProject(uint id) public creatorOrOwnerOnly returns (bool) { // TODO : 如果 project approve 了，不能刪除
        require(projectExist[id], "Project not found"); // 主播說下面那一行其實已經有確認 exist 的邏輯了，因此不需要這行
        require(
            msg.sender == projects[id].owner, "Unauthorized Entity"
        );

        projects[id].status = statusEnum.DELETED;
        performRefund(id);

        emit Action(id, "PROJECT DELETED", msg.sender, block.timestamp);

        return true;
    }

    function performRefund(uint id) internal { // 退錢
        for(uint i = 0; i < backersOf[id].length; i++){
            address _owner = backersOf[id][i].owner;
            uint _contribution = backersOf[id][i].contributions;

            backersOf[id][i].refunded = true;
            backersOf[id][i].timestamp = block.timestamp;
            payTo(_owner, _contribution);

            projects[id].raised -= _contribution; // new
            stats.totalBacking -= 1;
            stats.totalDonations -= _contribution;
        }
    }

    function backProject(uint id) public payable returns (bool) {
        require(msg.value > 0 ether, "Ether must be greater than zero");
        require(projectExist[id], "Project not found");
        require(projects[id].status == statusEnum.OPEN, "Project is not open");

        stats.totalBacking += 1;
        stats.totalDonations += msg.value;
        projects[id].raised += msg.value;
        projects[id].backers += 1;

        backersOf[id].push(backerStruct({
            owner: msg.sender,
            contributions: msg.value,
            timestamp: block.timestamp,
            refunded: false
        }));

        emit Action(id, "PROJECT BACKED", msg.sender, block.timestamp);
    
        if(projects[id].raised >= projects[id].cost){
            projects[id].status = statusEnum.APPROVED;
            return true;
        }
            
        if(block.timestamp >= projects[id].expiresAt){
            projects[id].status = statusEnum.REVERTED;
            performRefund(id);
            return true;
        }

        return true;
    }

    function performPayout(uint id) internal {
        uint _projectRaised = projects[id].raised;
        uint _tax = (_projectRaised * projectTax) / 100;

        projects[id].status = statusEnum.PAIDOUT;

        payTo(owner, _tax);
        payTo(projects[id].owner, _projectRaised - _tax);

        balance -= projects[id].raised;

        emit Action(id, "PROJECT PAIDOUT", msg.sender, block.timestamp);
    }

    function requestRefund(uint id) public returns (bool){ // TODO : 沒有實做到
        require(
            projects[id].status != statusEnum.REVERTED || 
            projects[id].status != statusEnum.DELETED, 
            "Project has marked as revert or delete"
        );

        projects[id].status = statusEnum.REVERTED;
        performRefund(id);
        return true;
    }

    function payOutProject(uint id) public returns (bool){ // owner 主動執行 payout
        require(projects[id].status == statusEnum.APPROVED, "Project is not approved yet"); //TODO : 狀態要改，因為現在不是達標就直接匯錢
        require(
            msg.sender == projects[id].owner || 
            msg.sender == owner, 
            "Unauthorized Entity"
        );

        performPayout(id);
        return true;
    }

    function startProject(uint id) public creatorOrOwnerOnly returns (bool) {
        require(projectExist[id], "Project not found");
        require(projects[id].status == statusEnum.APPROVED, "Project is not approved yet");
        require(
            msg.sender == projects[id].owner || 
            msg.sender == owner,  // TODO : 暫時先讓 app owner 也可以 start project
            "Unauthorized Entity"
        );
        
        projectMint(id);
        projects[id].status = statusEnum.PROGRESSING;

        return true;
    }

    function changeTax(uint _taxPct) public ownerOnly { // 更改稅率 // TODO : 沒有實做到
        projectTax = _taxPct;
    }

    function getProject(uint id) public view returns (projectStruct memory) {
        require(projectExist[id], "Project not found");

        return projects[id];
    }

    function getProjects() public view returns (projectStruct[] memory) {
        return projects;
    }

    function getBackers(uint id) public view returns (backerStruct[] memory) {
        require(projectExist[id], "Project not found");

        return backersOf[id];
    }

    function getNfts(address _owner) public view returns (string[] memory) {
        require(UserOfNFTs[_owner].length >= 0, "No NFTs found");

        uint length = UserOfNFTs[_owner].length;
        string[] memory nfts = new string[](length);

        for(uint i = 0; i < UserOfNFTs[_owner].length; i++){
            nfts[i] = tokenURI(UserOfNFTs[_owner][i]);
        }

        return nfts;
    }
    

    function payTo(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
    }

    function isAppOwner(address addr) public view returns (bool) {
        return addr == owner;
    }
    
    function isAppOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    function isCreator(address addr) public view returns (bool) {
        return CreatorExist[addr];
    }

    function isProjectCreator(uint id, address addr) public view returns (bool) {
        require(projectExist[id], "Project not found");
        return projects[id].owner == addr; // 因為 id 剛好等於 project's index
    }
}
