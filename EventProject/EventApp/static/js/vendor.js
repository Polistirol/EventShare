

async function onLoad(ownerAddress) {
    await Moralis.enableWeb3();
    let user = Moralis.User.current();
    if (user) {
        userAddress = user.get("ethAddress")
        console.log("logged in user:", userAddress);
        if (isManager(userAddress)) {
            console.log("User is the manager ");
        }
        else {
            console.log("User is NOT the manager ");
            // TEMPORARY GATE TO SHOP


        }
    } else {
        console.log("User not logged!")
        return
    }
}

function isManager(ownerAddress) {
    userAddress = Moralis.User.current().get("ethAddress")
    if (userAddress == ownerAddress) {
        return true;
    }
    return false;
}