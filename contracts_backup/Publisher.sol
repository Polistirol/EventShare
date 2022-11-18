// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./EventManager.sol";

contract EventPublisher{

    EventManager private newEvent;

    event PublishingSuccessful(
        address indexed ManagerAddress,
        address indexed ownerAddress
    );


    function publishEvent(uint256 _eventDate,
        uint256 _presaleDurationInDays,
        uint256 _eventDuration,
        uint256 _cashback,        
        string memory _eventName,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _tokenTotalSupply,
        address _firstAcceptedToken ) 
        public {
            require(_eventDate > block.timestamp, "Event date is not in the future");
            require(_presaleDurationInDays > 0 , "Presale duration must be greater than 0");
            require(_cashback > 0 , "Cashback must be greater than 0");
            require(_eventDuration > 0 , "Event duration must be greater than 0");
            require(_firstAcceptedToken != address(0), "acceptet token can not be Zero address");

    newEvent = new EventManager( _eventDate,
        _presaleDurationInDays,
        _eventDuration,
        _cashback,        
        _eventName,
        _tokenName,
        _tokenSymbol,
        _tokenTotalSupply,
        _firstAcceptedToken,
        address(msg.sender)
        );
    emit PublishingSuccessful(address(newEvent), address(newEvent.owner()));
    }

}