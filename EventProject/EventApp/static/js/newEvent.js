
let publisher = "0x73123d0287e5c02966341C9B1C15256C4Cca4834"
var addr = ""
let acceptedTokensDict = {
    //"GoerliUSDC": "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C"
    USDCL: "0x70BbEce1761006f474a073B2772771B55De393e6"
}
async function _load() {
    await Moralis.enableWeb3();
    let user = Moralis.User.current();
    if (user) {
        console.log("logged in user:", user);
        console.log(user.get("ethAddress"));
        addr = user.get("ethAddress")
    } else {
        console.log("User not logged!")
    }
    let address = Moralis.User.current().get("ethAddress");
    var formInfo = document.forms['newForm'];
    formInfo.user_address.value = address;
    document.getElementById("user_address").value = address;
}


async function publish() {
    console.log("publishing");
    // reading from form
    var formInfo = document.forms['newForm'];
    var eventName = formInfo["event_name"].value
    var rawEventDate = formInfo["event_date"].value
    var unixEventDate = Math.floor(new Date(rawEventDate).getTime() / 1000)
    var presaleDuration = formInfo["presale_duration"].value
    var eventDuration = formInfo["event_duration"].value
    var cashback = formInfo["cashback"].value
    var tokenName = formInfo["token_name"].value
    var tokenSymbol = formInfo["token_symbol"].value
    var tokenSupply = formInfo["token_supply"].value
    var acceptedTokenFlag = formInfo["accepted_token"].value
    var acceptedToken = acceptedTokensDict[acceptedTokenFlag]



    let publishOptions = {
        contractAddress: publisher,
        functionName: "publishEvent",
        abi: publishABI,
        params: {
            "_eventDate": unixEventDate,
            "_presaleDurationInDays": presaleDuration,
            "_eventDuration": eventDuration,
            "_cashback": cashback,
            "_eventName": eventName,
            "_tokenName": tokenName,
            "_tokenSymbol": tokenSymbol,
            "_tokenTotalSupply": tokenSupply,
            "_firstAcceptedToken": acceptedToken,
        }
    }
    const transaction = await Moralis.executeFunction(publishOptions);
    console.log(transaction)
    const receipt = await transaction.wait(1)
    console.log(receipt)
    eventTokenAddress = receipt.logs[2].topics[1];
    eventVendorAddress = receipt.logs[2].topics[2];
    eventManagerAddress = receipt.logs[4].topics[1]
    formInfo["event_manager_address"].value = eventManagerAddress
    formInfo["vendor_address"].value = eventVendorAddress
    formInfo["token_address"].value = eventTokenAddress
    console.log("Event Manager Address:" + eventManagerAddress)
    console.log("Event Token Address:" + eventTokenAddress)
    console.log("Event vendor Address:" + eventVendorAddress)
    document.getElementById("newForm").submit();
}





// async function getOwner() {
//     console.log("getting owner");
//     let options = {
//         contractAddress: managerAddress,
//         functionName: "owner",
//         abi: getOwnerABI
//     }
//     const message = await Moralis.executeFunction(options);
//     console.log(message)
// }

//////// ABIS 

const getOwnerABI = [{
    "inputs": [],
    "name": "owner",
    "outputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}]


const getHoursToEventABI = [{
    "inputs": [],
    "name": "getHoursToEvent",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}]


const publishABI = [{ "inputs": [{ "internalType": "uint256", "name": "_eventDate", "type": "uint256" }, { "internalType": "uint256", "name": "_presaleDurationInDays", "type": "uint256" }, { "internalType": "uint256", "name": "_eventDuration", "type": "uint256" }, { "internalType": "uint256", "name": "_cashback", "type": "uint256" }, { "internalType": "string", "name": "_eventName", "type": "string" }, { "internalType": "string", "name": "_tokenName", "type": "string" }, { "internalType": "string", "name": "_tokenSymbol", "type": "string" }, { "internalType": "uint256", "name": "_tokenTotalSupply", "type": "uint256" }, { "internalType": "address", "name": "_firstAcceptedToken", "type": "address" }], "name": "publishEvent", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]