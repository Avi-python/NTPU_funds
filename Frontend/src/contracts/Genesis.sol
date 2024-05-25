//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Genesis {
    address public owner;
    uint public projectTax; // 稅，owner 要吃的稅 per project
    uint public projectCount;
    uint public balance; // 合約內的餘額
    statsStruct public stats;
    projectStruct[] projects;

    mapping(address => projectStruct[]) projectsOf; // 
    mapping(uint => backerStruct[]) backersOf; // input project id and return all backers of that project
    mapping(uint => bool) public projectExist;

    enum statusEnum {
        OPEN,
        APPROVED, // 代表達標
        REVERTED,
        DELETED,
        PAIDOUT
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

    constructor(uint _projectTax) {
        owner = msg.sender;
        projectTax = _projectTax;
    }

    function createProject(
        string memory title,
        string memory description,
        string memory imageURL,
        uint cost,
        uint expiresAt
    ) public returns (bool) {
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
    ) public returns (bool) {
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

    function deleteProject(uint id) public returns (bool) {
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
            balance += projects[id].raised;
            performPayout(id);
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
        require(projects[id].status == statusEnum.APPROVED, "Project is not approved yet");
        require(
            msg.sender == projects[id].owner || 
            msg.sender == owner, 
            "Unauthorized Entity"
        );

        performPayout(id);
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
}
