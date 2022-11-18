
async function interactionInit(_managerAddress, _vendorAddress, _tokenAddress) {
    console.log("initalizing interaction...")
    userAddress = Moralis.User.current().get("ethAddress");
    vendorAddress = _vendorAddress;
    managerAddress = _managerAddress;
    tokenAddress = _tokenAddress;
    if (document.title == "Event dashboard") {
        populate();
    }

    /// MISC 

}
async function populate() {
    console.log("Populating event dashboard")
    let price = await m_getPrice();
    let countdown = await m_getDays();
    let vendorEnabled = await v_isEnabled();
    let tokenEnabled = await t_isEnabled();
    let eventStatus = await m_getStatus();
    let rewardPool = await m_getRewardPool();
    let totalTokenSpent = await v_getTotalTokenSpent(userAddress);
    document.getElementById("vendor_enabled").innerHTML = vendorEnabled;
    document.getElementById("token_enabled").innerHTML = tokenEnabled;
    document.getElementById("price_each").innerHTML = toUsd(price);
    document.getElementById("countdown").innerHTML = formatDate(countdown)
    document.getElementById("event_status").innerHTML = eventStatus[0];
    document.getElementById("reward_pool").innerHTML = toUsd(rewardPool);
    document.getElementById("total_token_spent").innerHTML = totalTokenSpent;
    if (eventStatus[0] == "REWARDING") {
        document.getElementById("btn_withdraw_reward").removeAttribute("hidden")
    }
}

function toInt(msg) {
    return parseInt(msg._hex, 16)
}
function SplitTime(numberOfHours) {
    var days = Math.floor(numberOfHours / 24);
    var remainder = numberOfHours % 24;
    var hours = Math.floor(remainder);
    var minutes = Math.floor(60 * (remainder - hours));
    return ({ "Days": days, "Hours": hours, "Minutes": minutes })
}

function formatDate(dateObj) {
    let string = dateObj.Days + " days and " + dateObj.Hours + " Hours"
    return string
}

function toUsd(usdt) {
    return (usdt / 10 ** 6);
}
function toUsdt(usd) {
    usdFloat = parseFloat(usd)
    usdFloat = usdFloat * 10 ** 6
    usdt = parseInt(usdFloat)
    return usdt
}

// VENDOR INTERACTION

async function v_getTotalTokenSpent() {
    console.debug("getting total token spent...")
    let options = {
        contractAddress: vendorAddress,
        functionName: "totalTokenSpent",
        abi: [{ "inputs": [], "name": "totalTokenSpent", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]
    }
    let totalTokenSpent = await Moralis.executeFunction(options);
    totalTokenSpent = toInt(totalTokenSpent);
    console.log("Total Token Spent: ", totalTokenSpent)
    return totalTokenSpent
}

async function v_isEnabled() {
    console.debug("getting vendor status...")
    let options = {
        contractAddress: vendorAddress,
        functionName: "isEnabled",
        abi: [{ "inputs": [], "name": "isEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }]
    }
    let isEnabled = await Moralis.executeFunction(options);
    console.log("Vendor enabled:", isEnabled)
    return isEnabled
}

async function v_getBuyers() {
    console.debug("getting buyers...")
    let options = {
        contractAddress: vendorAddress,
        functionName: "buyers",
        abi: [{ "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "buyers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }],
        params: { "id": 0 }
    }
    let buyers = await Moralis.executeFunction(options);
    console.log(buyers)
}

async function v_getAddressToTokenSpent(_address) {
    console.debug("getting token spent for user...")
    let options = {
        contractAddress: vendorAddress,
        functionName: "addressToTokenSpent",
        abi: [{ "inputs": [{ "internalType": "address", "name": "userAddress", "type": "address" }], "name": "addressToTokenSpent", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }],
        params: { "userAddress": _address }
    }
    let tokenSpent = await Moralis.executeFunction(options);
    tokenSpent = toInt(tokenSpent);
    console.log("user spent: ", tokenSpent, "Tokens")
    return tokenSpent;
}

async function v_pay(amount) {
    console.debug("paying token : ", amount)
    let options = {
        contractAddress: vendorAddress,
        functionName: "pay",
        abi: [{ "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "pay", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
        params: { "amount": amount }
    }
    let tx = await Moralis.executeFunction(options);
    console.debug(tx)
    let receipt = await tx.wait(1)
    console.debug(receipt)
    return receipt

}

////TOKEN INTERACTION
async function t_isEnabled() {
    console.debug("getting token status...")
    let options = {
        contractAddress: tokenAddress,
        functionName: "isEnabled",
        abi: [{ "inputs": [], "name": "isEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }]
    }
    let isEnabled = await Moralis.executeFunction(options);
    console.log("token enabled: ", isEnabled)
    return isEnabled
}

async function t_approve(amount, tokenToApprove, spender) {
    console.debug("approving token - amount: " + amount)
    let options = {
        contractAddress: tokenToApprove,
        functionName: "approve",
        abi: [{ "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }],
        params: {
            "spender": spender,//was managerAddress,
            "amount": amount
        }
    }
    let tx = await Moralis.executeFunction(options);
    const receipt = await tx.wait(1)
    console.log("amount approved!")
    return receipt
}

async function t_approve_max(tokenToApprove, spender) {
    await t_approve(BigInt(2 ** 250), tokenToApprove, spender);
    console.log("max amount approved!");
}

async function t_hasApproved(tokenToApprove, spender) { //<-- if user has no coins this reverts!
    console.debug("checking if approved ");
    console.debug("token", tokenToApprove);
    console.debug("user", userAddress);
    console.debug("manager", managerAddress);
    let options = {
        contractAddress: tokenToApprove,
        functionName: "allowance",
        //usdc goerli //abi: [{ "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }],
        abi: [{ "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }],
        params: {
            "owner": userAddress,
            "spender": spender //was managerAddress 
        }
    }
    let allowance = await Moralis.executeFunction(options);
    console.log("allowance:", toInt(allowance));
    return toInt(allowance)

}

/// MANAGER INTERACTION

async function m_getStatus() {
    console.debug("getting event status");
    let options = {
        contractAddress: managerAddress,
        functionName: "e_status",
        abi: [{ "inputs": [], "name": "e_status", "outputs": [{ "internalType": "enum EventManager.EVENT_STATUS", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }]
    }
    const statusID = await Moralis.executeFunction(options);
    let statusList = {
        0: "WAITING",
        1: "PRESALE",
        2: "IN_PROGRESS",
        3: "REWARDING",
        4: "ENDED"
    }
    console.log("Event status: ", statusID, " -> ", statusList[statusID]);
    return [statusList[statusID], statusID]
}

async function m_updateStatus() {
    console.debug("updating event status");
    let options = {
        contractAddress: managerAddress,
        functionName: "updateEventStatus",
        abi: [{ "inputs": [], "name": "updateEventStatus", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
    }
    await Moralis.executeFunction(options);
    console.log("Status Updated!")
}


async function m_getPrice() {
    console.debug("getting token price...")
    let options = {
        contractAddress: managerAddress,
        functionName: "getPrice",
        abi: [{ "inputs": [], "name": "getPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
        ],
    }
    let price = await Moralis.executeFunction(options);
    price = toInt(price)
    console.log("Token Price : ", price);
    return price
}



async function m_getDays() {
    console.debug("getting days");
    let options = {
        contractAddress: managerAddress,
        functionName: "getHoursToEvent",
        abi: [{ "inputs": [], "name": "getHoursToEvent", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }],
    }
    const message = await Moralis.executeFunction(options);
    let rawHours = toInt(message);
    time = SplitTime(rawHours)
    console.log("Time to the event:", time)
    console.log("Unix:", rawHours)
    return time
}

async function m_getRewardPool() {
    console.debug("getting reward Pool");
    let options = {
        contractAddress: managerAddress,
        functionName: "rewardPool",
        abi: [{ "inputs": [], "name": "rewardPool", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
        ]
    }
    const message = await Moralis.executeFunction(options);
    console.debug("rewardPool message: ", message);
    let rewardPool = toInt(message)
    console.log("Reward Pool: ", rewardPool)
    return rewardPool
}

async function m_withdrawReward() {
    console.debug("Withdrawing reward");
    let options = {
        contractAddress: managerAddress,
        functionName: "withdrawReward",
        abi: [{ "inputs": [], "name": "withdrawReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
    }
    const transaction = await Moralis.executeFunction(options);
    console.log(transaction)
    const receipt = await transaction.wait(1)
    console.log(receipt)
    return
}


async function m_swapFromToken(_acceptedToken, _amountOfEventToken) {
    const usdcAddress = "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C"  //usdc addres from uniswap -goerli testenet
    //https://app.uniswap.org/#/swap?chain=goerli

    console.debug("buying tokens...")
    console.log("buing tokens for " + "WIP" + " usd")
    let options = {
        contractAddress: managerAddress,
        functionName: "swapTokens",
        abi: [{ "inputs": [{ "internalType": "address", "name": "tokenUsedToBuy", "type": "address" }, { "internalType": "uint256", "name": "amountOfEventToken", "type": "uint256" }], "name": "swapTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
        params: {
            "tokenUsedToBuy": _acceptedToken,
            "amountOfEventToken": _amountOfEventToken
        }
    }
    let transaction = await Moralis.executeFunction(options);
    const receipt = await transaction.wait(1)
    console.debug(receipt)
    console.log("Purchase completed!")
    return
}



