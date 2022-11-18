// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./EventToken.sol";
import "./Vendor.sol";
import "./Owned.sol";


contract EventManager is Owned {
    //event Info
    uint256 public eventDate; //date in unix time - seconds from 1970
    uint256 public presaleDurationHours; // duration of presale in hours 
    uint256 public eventDurationHours; // duration of the event in hours
    uint256 public cashback; //uint representing the % of cashback
    EVENT_STATUS public e_status;
    //tokenInfo
    string public eventName;
    string public tokenName;
    string public tokenSymbol;
    uint256 public tokenTotalSupply;
    uint256 public appFee = 1; //percentage of the total reward that is sent to the platform, hardcoded atm
    uint256 public managerPool ;
    uint256 public rewardPool ;
    //items
    Vendor public vendor;
    EventToken public token;

    //economics
    address[] public acceptedTokensForSwap;
    mapping(address => uint256) public addressToAmount; //amount of token bougth for usdt
    mapping(address => uint256) addressToRewardShare; // share of the reward pool for each account (it's from vendor) 


    enum EVENT_STATUS {
        WAITING,
        PRESALE,
        IN_PROGRESS,
        ENDED
    }
    //events
    event CreationSuccessful(
        address indexed TokenAddress,
        address indexed VendorAddress
    );

    event StatusChanged(uint8 _from, uint8 _to);

    event RewardingStarted(
        uint256 amountToEvent,
        uint256 amountToUsers,
        uint256 numberOfUsers
    );

    event Rewardwithdrawn(address user, uint256 amount);



    //1643535576,"kappa","etKappa","etKPA",1000000,10,10,1
    
    constructor(
        uint256 _eventDate,
        uint256 _presaleDurationInDays,
        uint256 _eventDurationHours,
        uint256 _cashback,        
        string memory _eventName,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _tokenTotalSupply,
        address _firstAcceptedToken,
        address _newOwner
    ) { 
       // event info
        eventDate = _eventDate;
        presaleDurationHours = _presaleDurationInDays *24;
        eventDurationHours = _eventDurationHours;
        cashback = _cashback;        
        //token info _eventDuration
        eventName = _eventName;
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;
        tokenTotalSupply = _tokenTotalSupply;
        acceptedTokensForSwap.push(_firstAcceptedToken);
        //
        owner= _newOwner;
        generate();
        updateEventStatus();
    }

    //functions
    //status
    function updateEventStatus() public {
        EVENT_STATUS newStatus;
        require(e_status != EVENT_STATUS.ENDED , "Event has ended already");

        //block.timestamp is in seconds. all the other time values must match
        uint256 presaleStartDate = eventDate-(presaleDurationHours*60*60);
        uint256 eventEndDate = eventDate+(eventDurationHours*60*60);
        
        if (block.timestamp < presaleStartDate) {
            newStatus = EVENT_STATUS.WAITING;
        } else if (block.timestamp >= presaleStartDate && block.timestamp < eventDate ) {
            newStatus = EVENT_STATUS.PRESALE;
            token.setTokenStatus(true);
        } else if (block.timestamp >= eventDate && block.timestamp < eventEndDate ) {
            newStatus = EVENT_STATUS.IN_PROGRESS;
            vendor.setVendorStatus(true);
        } else if (block.timestamp >= eventEndDate){
           endEvent(); 
        }
        if (e_status != newStatus) {
            EVENT_STATUS oldStatus = e_status;
            e_status = newStatus;
            emit StatusChanged(uint8(oldStatus), uint8(e_status));
        }

    }

    function getHoursToEvent() public view returns (uint256) {
        if (block.timestamp < eventDate) {
            return (eventDate - block.timestamp) / 60 / 60;
        } else {
            return 0;
        }
    }        
    
    //generate
    function generate() private  {
        require(address(token) == address(0), "Token not null!");
        require(address(vendor) == address(0), "Vendor not null!");
        //create Token
        createToken();
        createVendor();
        token.setMatchingVendor(address(vendor));
        emit CreationSuccessful(address(token), address(vendor));
    }

    //---vendors
    function createToken() private  {
        //a new token is issued, its default state is disabled
        token = new EventToken(tokenName, tokenSymbol, tokenTotalSupply);
    }

    function createVendor() private  {
        //a new vendor is created, its default state is disabled
        vendor = new Vendor(token);
    }


    // ----misc

 
    function getPrice() public view returns (uint256) {
        //get the price of 1 token in usdt units (10**6)
        if ((e_status == EVENT_STATUS.PRESALE))
        {
            // returns the price of 1 token at current time, 10tokens = 1$ (10**6 usdc)
            return 10**5- (( getHoursToEvent() * cashback * 10**3 ) / presaleDurationHours);
        }
        else{
            return 10**5; //1$ = 10^6 usdc , 1 token = 0.10$ , so 1token at full price is 0.10 usdc or 1usdc/10 = 10**5 
        }  
    }

    function splitToPools(uint256 amountSpent) private {
        //total speso = tokenBought * pricePayed
        uint256 toManager = (amountSpent / 100 )*(100-cashback); //to manager goes the full amount -the cashback%
        managerPool += toManager; 
        rewardPool  += amountSpent - toManager; // the remainder goes to the pool
    }


    function swapTokens(address tokenToUse, uint256 amountOfTokenToUse) external {
        uint256 fixedPrice = getPrice();
        require(
            amountOfTokenToUse >= fixedPrice,
            "Minimum amount must buy at least 1 token"
        );
        require(
            amountOfTokenToUse % fixedPrice == 0,
            "amount of usdt must be multiple of the price of 1 token"
        );
        // WIP - multiple tokens accepted
        require( isTokenAccepted(tokenToUse), "token is not accepted");

        require(
            e_status == EVENT_STATUS.PRESALE ||
                e_status == EVENT_STATUS.IN_PROGRESS,"Event  not started yet"
        );

        uint256 tokenToSend = amountOfTokenToUse / fixedPrice; //since the requirement above, this is always an integer
        addressToAmount[msg.sender] += tokenToSend;
        // Before this you should have approved the amount
        // This will transfer the amount of  _token from caller to contract
        IERC20(tokenToUse).transferFrom(msg.sender, address(this), amountOfTokenToUse);
        token.transfer(msg.sender, tokenToSend);
        splitToPools(amountOfTokenToUse);
    }



    function endEvent() public OnlyOwner {
        require(block.timestamp > eventDate+(eventDurationHours*60*60) );//require the time to be over the event end date
        vendor.setVendorStatus(false) ;//disable vendor
        token.setTokenStatus(false) ;//disable token 
        startRewarding();
    }

    function startRewarding() private  {
        address _usdc = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
        // sends app rewards to the app wallet
        address appWalletAddress = 0x507bcF9b82513038516F94e15ceEfc6850eA3f77 ; 
        uint256 appFeeAmount = rewardPool /100 * appFee;
        rewardPool -= appFeeAmount;
        IERC20(_usdc).transferFrom(address(this),owner, managerPool);
        IERC20(_usdc).transferFrom(address(this),appWalletAddress, appFeeAmount);
        vendor.calculateReward(rewardPool);
        e_status = EVENT_STATUS.ENDED;
    }

    function withdrawReward() public {
       uint256 amountDue = vendor.withdrawReward(msg.sender);
       emit Rewardwithdrawn(msg.sender,amountDue);
    }
    
    function isTokenAccepted(address askingToken) private view returns(bool){
        for (uint i; i < acceptedTokensForSwap.length; i++) {
            if (askingToken == acceptedTokensForSwap[i]) {return true;}
        }
        return false;
    }
    ///////// WIP
    //multiple token accepted to buy event tokens

    // function addAcceptedToken(address acceptedToken) external OnlyOwner{
    //     // allows the manger to expand the list of  accepted tokens in exchange for tokens
    //     // swap function checks for length 
    //     acceptedTokensForSwap.push(acceptedToken);     
    //     }
    




}