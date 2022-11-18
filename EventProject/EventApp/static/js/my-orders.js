
function getOrders(orders_json) {
    orders_obj = JSON.parse(orders_json)
    console.debug(orders_obj)
    for (var order in orders_obj) {
        console.debug(orders_obj[order])
        var obj = orders_obj[order]
        for (var field in obj) {
            if (obj.hasOwnProperty(field)) {
                console.debug(field, obj[field])
                if (field == "itemsPayed") {
                    let i = 1
                    for (var item in obj["itemsPayed"]) {
                        console.debug(obj["itemsPayed"][item])
                        var table = document.getElementById(obj["ID"] + "_itemsPayed");
                        var row = table.insertRow(i);
                        var cellName = row.insertCell(0);
                        var cellQty = row.insertCell(1);
                        cellName.innerHTML = obj["itemsPayed"][item]["name"];
                        cellQty.innerHTML = obj["itemsPayed"][item]["quantity"];
                        i++;
                    }
                }
                else if (field == "itemsRedeemed") {
                    let i = 1
                    for (var item in obj["itemsRedeemed"]) {
                        console.debug(obj["itemsRedeemed"][item])
                        var table = document.getElementById(obj["ID"] + "_itemsRedeemed");
                        var row = table.insertRow(i);
                        var cellName = row.insertCell(0);
                        var cellQty = row.insertCell(1);
                        cellName.innerHTML = obj["itemsRedeemed"][item]["name"];
                        cellQty.innerHTML = obj["itemsRedeemed"][item]["quantity"];
                        i++;
                    }
                }

                else {
                    var htmlID = obj["ID"] + "_" + field
                    document.getElementById(htmlID).innerHTML = obj[field];
                }

            }
        }
    }
}

function toggleOrderDetails(order_id) {
    orderDiv = document.getElementById("order_extra_details_" + order_id)
    btn = document.getElementById("display_extra_details_" + order_id)
    if (orderDiv.style.display === "none") {
        orderDiv.style.display = "block"
        btn.textContent = "details <"
    } else {
        orderDiv.style.display = "none"
        btn.textContent = "details >"
    }
}