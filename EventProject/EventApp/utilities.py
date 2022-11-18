
from .models import Event, Order, ShoppingList,Token,Vendor,Item
from hashlib import sha256
from secrets import token_hex

def getContext(eventID = None, vendorAddress = None, tokenAddress = None):
    if eventID :
        event = Event.objects.get(ID = eventID)
    elif vendorAddress :
        vendor = Vendor.objects.all().filter(address = vendorAddress ).first()
        event = Event.objects.all().filter(vendor = vendor).first()
    elif tokenAddress:
        token = Token.objects.all().filter(address = tokenAddress ).first()
        event = Event.objects.all().filter(token = token).first()
    context = {
        "event_ID" : event.ID,
        "vendor_address"  :event.vendor.address,
        "token_address" : event.token.address,
        "manager_contract" : event.managerContract
    }
    return context,event

def packNewOrder(event,userAddress,txHash,amount,items_payed):
    code = generateCode(txHash,items_payed)

    while True: #verifies that the code was never used before
        if Order.objects.filter(code=code).first():
            code = generateCode(txHash,userAddress)
            print("Existing code found, generating a new code.. ")
        else: break
    
    newOrder = Order.objects.create(
    code = code,
    event = event,
    userAddress = userAddress,
    txHash = txHash,
    itemsPayed = items_payed.split(","),
    amount = amount
    )
    print(f"New order inserted {newOrder.ID}")
    return newOrder

def generateCode(txHash,items):
    rnd = token_hex()
    idsString = "".join(items)
    stringToHash = rnd+txHash+idsString
    newCode= sha256(stringToHash.encode('utf-8')).hexdigest()
    return newCode

def buildItemsDict(order_dict):
    itemsDict={}
    for itemID in order_dict["itemsPayed"]:
        if not itemID in itemsDict:
            item = Item.objects.get(id= itemID)
            itemsDict[itemID] = {
                "name" : item.name,
                "price" : item.price,
                "quantity" : 1
            }
        else:
            itemsDict[itemID]["quantity"] += 1
    return itemsDict
