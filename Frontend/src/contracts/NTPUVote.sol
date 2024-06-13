//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface NTPUFundInterface {
    function isProjectCreator(uint id, address addr) external view returns (bool);
    function payOutProjectOneUnit(uint id, uint installment) external returns (bool);
    function performRefund(uint id) external;
    function getBackersLength(uint id) external view returns (uint);
}

contract NTPUVote {

    address public fundAddress;
    NTPUFundInterface public fundContract;

    uint totalFundReviews;

    constructor(address _fundAddress) {
        fundAddress = _fundAddress;
        fundContract = NTPUFundInterface(fundAddress);
        totalFundReviews = 0;
    }

    // 投票
    struct Vote {
        address voter;
        uint projectId;
        uint option; // 0: fail, 1: pass
    }

    struct FundReview {
        uint fundReviewId;
        uint projectId;
        uint startDate;
        uint endDate;
        uint passCount;
        uint totalVoteCount;
    }

    mapping(uint => FundReview[]) public fundReviews;
    mapping(uint => bool) public projectReviewing;
    // 投票紀錄
    mapping(address => Vote[]) public votes;
    // 某個使用者有沒有投過某個 FundReview 的投票
    mapping(address => mapping(uint => bool)) public hasVoted;


    // 建立投票選項
    function createFundReview(uint projectId) public {
        require(fundContract.isProjectCreator(projectId, msg.sender), "Only project creator can create fund review");
        require(!projectReviewing[projectId], "Project is reviewing");

        fundReviews[projectId].push(
            FundReview(totalFundReviews++, projectId, block.timestamp, block.timestamp + 2 minutes, 0, 0) // TODO : 先用 1 分鐘
            );

        projectReviewing[projectId] = true;
    }

    // 投票
    function vote(uint projectId, uint _option) public {
        require(_option == 1 || _option == 0, "Invalid option");
        require(projectReviewing[projectId], "Project is not reviewing");
        uint curFundReviewId = fundReviews[projectId][fundReviews[projectId].length - 1].fundReviewId;
        require(!hasVoted[msg.sender][curFundReviewId], "Already voted");

        if(block.timestamp > fundReviews[projectId][fundReviews[projectId].length - 1].endDate){
            projectReviewing[projectId] = false;
            _performFunding(projectId);
            return;
        }

        hasVoted[msg.sender][curFundReviewId] = true;
        fundReviews[projectId][fundReviews[projectId].length - 1].passCount += _option;
        fundReviews[projectId][fundReviews[projectId].length - 1].totalVoteCount++;

        votes[msg.sender].push(Vote(msg.sender, projectId, _option));

        if(fundReviews[projectId][fundReviews[projectId].length - 1].totalVoteCount == fundContract.getBackersLength(projectId)){
            projectReviewing[projectId] = false;
            _performFunding(projectId);
            return;
        }
    }

    function _performFunding(uint projectId) private {
        if(fundReviews[projectId][fundReviews[projectId].length - 1].passCount > fundReviews[projectId][fundReviews[projectId].length - 1].totalVoteCount / 2) {
            fundContract.payOutProjectOneUnit(projectId, fundReviews[projectId].length);
            return;
        } 

        fundContract.performRefund(projectId);

        return;
    }

    function getFundReviews(uint projectId) public view returns(FundReview[] memory) {
        return fundReviews[projectId];
    }

    function isFundReviewing(uint projectId) public view returns(bool) {
        return projectReviewing[projectId];
    }

    // 取得投票結果
    // function getResults() public view returns (Option[] memory) {
    //     return options;
    // }
}