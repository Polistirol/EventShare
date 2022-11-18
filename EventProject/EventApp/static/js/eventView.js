async function _load(_eventManagerOwner, _managerAddress, _vendorAddress, _tokenAddress, _acceptedToken) {
    await Moralis.enableWeb3();
    let user = Moralis.User.current();
    if (user) {
        console.log("logged in user:", user);
        console.log(user.get("ethAddress"));
        addr = user.get("ethAddress")
    } else {
        console.log("User not logged!")
        return
    }
    let address = Moralis.User.current().get("ethAddress");
    let managerOwner = _eventManagerOwner;
    interactionInit(_managerAddress, _vendorAddress, _tokenAddress)
    checkIfApproved(_acceptedToken, _managerAddress)

    if (address == managerOwner) {
        console.log("User is the manager ", userAddress);
    } else { console.log("User not manager") }
}

async function checkReward() {
    let userAddress = Moralis.User.current().get("ethAddress");
    let rewardPool = await m_getRewardPool();
    let tokenSpent = await v_getAddressToTokenSpent(userAddress);
    let totalTokenSpent = await v_getTotalTokenSpent();
    let percentage = (tokenSpent / totalTokenSpent);
    let rewardAmount = percentage * rewardPool;
    console.log("User reward is ", rewardAmount, " : ", percentage, "% of ", totalTokenSpent, " total tokens spent")
    return (percentage, rewardAmount)
}

async function checkFinalPrice() {
    let amount = document.getElementById("token_amount").value;
    let priceEach = await m_getPrice();
    updatePriceEachDisplayed(priceEach)
    let finalPrice = await updateFinalPrice(amount)
    document.getElementById("final_price").innerHTML = toUsd(finalPrice)
    console.log("USD price for ", amount, " : ", finalPrice,);
}

async function updateFinalPrice(amount) {
    let priceEach = await m_getPrice();
    let finalPrice = amount * priceEach
    return finalPrice
}

function updatePriceEachDisplayed(priceEach) {
    document.getElementById("price_each".innerHTML = toUsd(priceEach))
}

async function buyToken(acceptedTokenAddress) {
    let amount = document.getElementById("token_amount").value;
    m_swapFromToken(acceptedTokenAddress, amount)
}


async function checkIfApproved(tokenAddress, spender) {
    console.log("checking approval..")
    let amountApproved = await t_hasApproved(tokenAddress, spender)  //<-- if user has no coins this reverts!
    if (amountApproved > 10 ** 9) {
        console.log("is approved")
        document.getElementById("approve_btn").hidden;
        document.getElementById("buy_btn").removeAttribute("hidden")
        return true
    }
    else {
        console.log("Not approved")
        document.getElementById("approve_btn").removeAttribute("hidden");
        document.getElementById("buy_btn").hidden
    }
}
async function approve(tokenAddress, spender) {
    await t_approve_max(tokenAddress, spender);
    location.reload()
}

function goToOrders(eventID) {
    userAddress = window.ethereum.selectedAddress
    window.location.href = eventID + '/' + userAddress + "/my-orders"
}