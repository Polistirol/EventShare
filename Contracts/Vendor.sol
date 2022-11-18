// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./Owned.sol";
import "./EventToken.sol";

//import "./EventManager.sol";

contract Vendor is Owned {
    address[] public buyers;
    mapping(address => uint256) public addressToTokenSpent;
    mapping (address =>  uint256) private addressToReward;
    uint256 public totalTokenSpent;
    address public managerAddress; //from owned
    EventToken public tokenAllowed;
    bool public isEnabled ;

    event VendorCreation(address _vendorAddress);
    event VendorPayed(address _buyer, uint256 amount);


    modifier OnlyManager() {
        require(msg.sender == managerAddress, "Only the manager can do this !");
        _;
    }

    modifier IsEnabled() {
        require(isEnabled == true, "Vendor is disabled, Event ended or not started");
        _;
    }

    constructor(EventToken _tokenAllowed) {
        managerAddress = msg.sender;
        tokenAllowed = _tokenAllowed;
        isEnabled = false;
        emit VendorCreation(address(this));
    }


    function pay(uint256 amount) external IsEnabled  {
        require(amount > 0, "Minimum amount is 1 token");
        // Before this you should have approved the amount
        // This will transfer the amount of  _token from caller to contract
        addressToTokenSpent[msg.sender] += amount;
        buyers.push(msg.sender);
        totalTokenSpent += amount;
        tokenAllowed.transferFrom(msg.sender, address(this), amount);
        emit VendorPayed(msg.sender, amount);
    }

    function setVendorStatus(bool newStatus) external OnlyManager {
        // true to enable , false to disable
        require (isEnabled != newStatus,"Vendor is already with this status");
        isEnabled = newStatus;
    }


    function calculateReward(uint256 rewardPool) external OnlyManager {
        require(totalTokenSpent >0, "No token were spent, rewarding is aborted");
        //builds the mapping with account => reward
        for (uint i =0; i<= buyers.length; i++){
            address user = buyers[i];
            uint256 userSpent = addressToTokenSpent[user];
            addressToReward[user] += (rewardPool* userSpent ) / totalTokenSpent;
        }
    }

    function withdrawReward(address user) external OnlyManager returns (uint256 rewardDue){
        require(addressToReward[user] > 0 , "User reward left is 0");
        rewardDue = addressToReward[user];
        addressToReward[user] = 0;
        return rewardDue;
    }
    
    





}
