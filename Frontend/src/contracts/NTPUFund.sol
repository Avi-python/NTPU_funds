//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NTPUFund is ERC721, ERC721URIStorage {
    address public owner;
    uint public projectTax; // 稅，owner 要吃的稅 per project
    uint public fundingInstallment; // 募資期數
    uint public projectCount;
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
        uint duration;
        uint fundReviewAt;
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

    constructor(uint _projectTax, uint _fundingInstallment) ERC721("NtpuFund", "NTPU") {
        tokenCounter = 0;
        owner = msg.sender;
        projectTax = _projectTax;
        fundingInstallment = _fundingInstallment;
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
            string memory _uri = string(abi.encodePacked('{"id": "', Strings.toString(id),'", "title": "', projects[id].title, '", "imageURL": "', projects[id].imageURL, '"}')); // TODO : 不知道這行是不是對的
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
        uint duration,
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
        project.duration = duration;
        project.fundReviewAt = 0;
        project.expiresAt = expiresAt;

        projects.push(project);
        projectExist[projectCount] = true;
        projectsOf[msg.sender].push(project);
        stats.totalProject += 1;

        emit Action(projectCount++, "PROJECT CREATE", msg.sender, block.timestamp);
        
        return true;
    }

    function deleteProject(uint id) public creatorOrOwnerOnly returns (bool) { // TODO : 如果 project approve 了，不能刪除
        require(projectExist[id], "Project not found"); // 主播說下面那一行其實已經有確認 exist 的邏輯了，因此不需要這行
        require(
            msg.sender == projects[id].owner, "Unauthorized Entity"
        );

        performRefund(id);
        projects[id].status = statusEnum.DELETED;

        emit Action(id, "PROJECT DELETED", msg.sender, block.timestamp);

        return true;
    }

    function performRefund(uint id) public { // 退錢 // TODO : 因為匯款是分期的，所以這邊要改

        require(projects[id].status != statusEnum.REVERTED 
        && projects[id].status != statusEnum.DELETED
        && projects[id].status != statusEnum.PAIDOUT, "Project cannot refund");

        projects[id].status = statusEnum.REVERTED;
        uint projectRaised = projects[id].raised;

        uint totalContributions = 0;

        for(uint i = 0; i < backersOf[id].length; i++){
            totalContributions += backersOf[id][i].contributions;
        }

        for(uint i = 0; i < backersOf[id].length; i++){
            address _owner = backersOf[id][i].owner;
            uint _contribution = backersOf[id][i].contributions;

            backersOf[id][i].refunded = true;
            backersOf[id][i].timestamp = block.timestamp;

            uint refund;

            if(i == backersOf[id].length - 1){
                refund = projects[id].raised;
            } else {
                refund = (projectRaised * _contribution) / totalContributions;
            }

            payTo(_owner, refund);

            projects[id].raised -= refund; // new
            stats.totalBacking -= 1;
            stats.totalDonations -= refund;
        }
    }

    function requestRefund(uint id, uint currentTime) public returns (bool) { // 有個沒辦法讓我只能傳送當前時間進來才可以做到
        require(projectExist[id], "Project not found");
        require(projects[id].expiresAt < currentTime, "Project is not expired yet"); // 限制只有過期的 project 追蹤者才能主動申請退款

        performRefund(id);

        emit Action(id, "PROJECT REFUNDED", msg.sender, block.timestamp);

        return true;
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
            performRefund(id);
            return true;
        }

        return true;
    }

    function performUnitPayout(uint id, uint installment) internal {

        uint _projectRaised = projects[id].raised;
        uint _projectCost = projects[id].cost;
        uint _tax = (_projectCost * projectTax) / (100 * fundingInstallment);

        if(installment == fundingInstallment - 1){

            projects[id].status = statusEnum.PAIDOUT;

            payTo(owner, _tax);
            payTo(projects[id].owner, _projectRaised - _tax); // 剩餘得錢都給 project owner

            projects[id].raised -= _projectRaised;

            emit Action(id, "PROJECT PAIDOUT", msg.sender, block.timestamp);

        } else {

            payTo(owner, _tax);
            payTo(projects[id].owner, (_projectCost / fundingInstallment) - _tax);

            projects[id].raised -= _projectCost / fundingInstallment;

            emit Action(id, "PROJECT PAID UNIT", msg.sender, block.timestamp);

        }
    }

    function payOutProjectOneUnit(uint id, uint installment) public returns (bool){ // owner 主動執行 payout
        require(projects[id].status == statusEnum.PROGRESSING, "Project is not progressing yet"); 
        require(installment <= fundingInstallment - 1, "Invalid installment"); // 因為在 start project 的時候，已經有付款過一次了，所以這邊要減一

        performUnitPayout(id, installment);
        projects[id].timestamp = block.timestamp;
        projects[id].fundReviewAt = projects[id].timestamp + projects[id].duration / (fundingInstallment - 1); // 更新下一次付款時間
        projects[id].expiresAt = projects[id].fundReviewAt + 5 minutes; // TODO : 這個是給予的緩衝時間

        return true;
    }

    function startProject(uint id) public creatorOrOwnerOnly returns (bool) {
        require(projectExist[id], "Project not found");
        require(projects[id].status == statusEnum.APPROVED, "Project is not approved yet"); //TODO : 如果 expire 了不應該啟動
        require(
            msg.sender == projects[id].owner || 
            msg.sender == owner,  // TODO : 暫時先讓 app owner 也可以 start project
            "Unauthorized Entity"
        );
        
        projectMint(id);
        projects[id].status = statusEnum.PROGRESSING;
        payOutProjectOneUnit(id, 0); // 第一次付款，周轉金

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

    function getBackersLength(uint id) external view returns (uint) {
        require(projectExist[id], "Project not found");
        return backersOf[id].length;
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

    function getFundingInstallment() public view returns (uint) {
        return fundingInstallment;
    }

    function getBlockTime() public view returns (uint) { // TODO : For debug
        return block.timestamp;
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

    function isExpired(uint id) public view returns (bool) {
        require(projectExist[id], "Project not found");
        return block.timestamp >= projects[id].expiresAt;
    }
}
