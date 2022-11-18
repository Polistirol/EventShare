var item_list_obj;
var item_chart = [];

async function _load(_managerAddress, _vendorAddress, _tokenAddress) {
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
    interactionInit(_managerAddress, _vendorAddress, _tokenAddress)
    checkIfApproved(_tokenAddress, _vendorAddress)
}

function addToChart(itemID) {
    let qtyBox = document.getElementById(itemID);
    let itemPrice = parseFloat(item_list_obj[itemID].price)
    qtyBox.value++;
    updateTotal(itemPrice);
    updateItemsChart(itemID, "add");
}

function removeFromChart(itemID) {
    let qtyBox = document.getElementById(itemID);
    let itemPrice = parseFloat(item_list_obj[itemID].price)
    if (qtyBox.value > 0) {
        qtyBox.value--;
        updateTotal(itemPrice * -1)
        updateItemsChart(itemID, "remove")

    }
}

function updateTotal(amount) {
    let totalBox = document.getElementById("total_price");
    let currentTotal = parseFloat(totalBox.value);
    totalBox.value = currentTotal + amount;
}

function updateItemsChart(itemID, operation) {
    let chartBox = document.getElementById("items_chart");
    if (operation == "add") {
        item_chart.push(itemID)
    }
    else {
        for (var i = 0; i < item_chart.length; i++) {
            if (item_chart[i] == itemID) {
                item_chart.splice(i, 1);
                break
            }
        }
    }
    chartBox.value = item_chart;
}



function getItems(items_list) {
    item_list_obj = JSON.parse(items_list)
}

async function checkIfApproved(tokenAddress, spender) {

    let amountApproved = await t_hasApproved(tokenAddress, vendorAddress)

    if (amountApproved > 10 ** 9) {
        console.log("vendor  approved")
        document.getElementById("approve_btn").hidden;
        document.getElementById("pay").removeAttribute("hidden")

        return true
    }
    else {
        console.log("vendor not  approved")
        document.getElementById("approve_btn").removeAttribute("hidden")
        document.getElementById("pay").hidden;
        //await t_approve_max(tokenAddress, vendorAddress)
    }
}

async function approve(tokenToAprrove, spender) {
    await t_approve_max(tokenToAprrove, spender);
    location.reload()
}

async function payVendor() {
    let tokenAmount = document.getElementById("total_price").value;
    console.log("Spending " + tokenAmount + "token")
    let receipt = await v_pay(tokenAmount);
    console.log(receipt)
    let txHash = receipt.transactionHash
    let userAddress = Moralis.User.current().get("ethAddress");
    //if transaction is ok..
    if (txHash != 0) {
        document.getElementById("user_address").value = userAddress;
        document.getElementById("tx_hash").value = txHash;
        document.getElementById("post_to").click()
    }
    else {
        console.log("transaction failed !")
    }

}

async function payVendor__fake() {
    let tokenAmount = document.getElementById("total_price").value;
    console.log("Spending " + tokenAmount + "token")
    let receipt = await v_pay(tokenAmount);
    console.log(receipt)
    console.log(receipt.transactionHash)
    let txHash = "0tx0088"
    //if transaction is ok..
    let userAddress = window.ethereum.selectedAddress// Moralis.User.current().get("ethAddress");
    document.getElementById("user_address").value = userAddress;
    document.getElementById("tx_hash").value = txHash;
    //document.getElementById("post_to").click()
}

function goToOrders(eventID) {
    userAddress = window.ethereum.selectedAddress
    location.replace("/events/" + eventID + '/' + userAddress + "/my-orders")
}