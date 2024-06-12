//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract NTPUVote {
    // 投票選項
    struct Option {
        string name;
        uint256 voteCount;
    }

    // 投票
    struct Vote {
        address voter;
        uint256 option;
    }

    // 投票選項
    Option[] public options; 

    // 投票紀錄
    mapping(address => Vote) public votes;

    // 建立投票選項
    function createOption(uint projectId, string memory _name) public {
        options.push(Option(_name, 0));
    }

    // 投票
    function vote(uint256 _option) public {
        require(_option < options.length, "Invalid option");
        require(votes[msg.sender].voter == address(0), "Already voted");

        options[_option].voteCount++;
        votes[msg.sender] = Vote(msg.sender, _option);
    }

    // 取得投票結果
    function getResults() public view returns (Option[] memory) {
        return options;
    }
}