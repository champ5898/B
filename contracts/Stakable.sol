// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

 contract Stakable{
     
      address payable Burn = payable(0x000000000000000000000000000000000000dEaD);
      
      address payable public Admin;
      uint256 userIndex;
      uint256 yes;
      
   
    constructor() {
        stakeHolders.push(stake(Burn, 0, block.timestamp ));
        Admin= payable(msg.sender);
    }
    /**
     * @notice
     * A stake struct is used to represent the way we store stakes, 
     * A Stake will contain the users address, the amount staked and a timestamp, 
     * Since which is when the stake was made
     */
    struct stake{
        address user;
        uint256 amount;
        uint256 since;
    }
    
    stake[] private stakeHolders;
   
    mapping(address => uint256) internal stakes;
    modifier minAmount(){
        require(msg.value>=0.05 ether, "Please stake more than or equal to 0.05 ether");
        _;
    }
     
    modifier onlyStakers(){
        for (uint256 i=1; i<stakeHolders.length; i++){
            if(stakeHolders[i].user==msg.sender){
                yes=i;
            }
            else
            yes=0;
        }
        require(yes!=0, "You have to stake minimum 0.05 ether");
        _;
    }
    
    

    /**
    * @notice Staked event is triggered whenever a user stakes tokens, address is indexed to make it filterable
     */
    event Staked(address indexed user, uint256 amount, uint256 index, uint256 timestamp);
   
    function Stake() public payable minAmount {
        userIndex++;
        stakeHolders.push(stake(msg.sender, msg.value, block.timestamp));
        
        emit Staked(msg.sender, msg.value, userIndex, block.timestamp); 
        Admin.transfer(msg.value);
    }
    
 }