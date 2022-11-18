from textwrap import indent
from django.http import JsonResponse
from django.shortcuts import render,HttpResponseRedirect,redirect
from django.forms.models import model_to_dict
from .models import Event, ShoppingList,Token,Vendor,Item
from .forms import NewItemForm,ScannedOrderForm
import json
from .web3.ADDRESSES import acceptedTokens
from .utilities import *

# Create your views here.
def home(request):
    return render(request, 'index.html')

def newEvent(request):
    
    if request.method == 'POST':
        managerContract = request.POST.get('event_manager_address')
        managerContract = "0x" + managerContract[-40:]
        newTokenAddress = "0x" + request.POST.get('token_address')[-40:]
        newVendorAddress = "0x" + request.POST.get('vendor_address')[-40:]
        newToken = Token.objects.create(
            address = newTokenAddress,
            name = request.POST.get('token_name'),
            symbol = request.POST.get('token_symbol'),
            supply = request.POST.get('token_supply'),            
        )
        newVendor = Vendor.objects.create(
            address = newVendorAddress,
        )

        newEvent = Event.objects.create(
            name = request.POST.get('event_name'),
            date = request.POST.get('event_date'),
            presale = request.POST.get('presale_duration'),
            duration = request.POST.get('event_duration'),
            cashback = request.POST.get('cashback'),
            acceptedToken = acceptedTokens[request.POST.get('accepted_token')] ,
            ownerAddress = request.POST.get('user_address'),
            managerContract = managerContract,
            token = newToken,
            vendor = newVendor
        )

        newShoppingList = ShoppingList.objects.create(
            event = newEvent
        )
        defaultItem = Item.objects.create(
            name="water",
            price=2,
            description="Water Bottle",
            shoppingList= newShoppingList
        )
        
        #return render(request, "newEvent.html")
        return redirect(f"/events/{newEvent.ID}")
        #return HttpResponseRedirect(reverse('newEvent'))
    #return HttpResponseRedirect("newEvent.html")
    return render(request, "newEvent.html",)

def eventView(response,_eventID):
    event = Event.objects.all().filter(ID = _eventID ).first()
    ##Parse arguments
    context = {
        "event_ID" : event.ID,
        "name" : event.name,
        "date" : event.date,
        "presale" : event.presale,
        "duration" : event.duration,
        "cashback" : event.cashback,
        "accepted_token" : event.acceptedToken,
        "owner_address": event.ownerAddress,
        "manager_contract" : event.managerContract ,       
        "token_address" : event.token.address,
        "token_enabled" : event.token.enabled,
        "vendor_address" : event.vendor.address,
        "vendor_enabled" : event.vendor.enabled
    }
    return render(response,"eventView.html",context)

def allEvents(response):
    events = Event.objects.all().order_by("-date")
    return render(response,"events.html",{"events":events})

def vendorPage(request,_vendorAddress):
    context,event = getContext(vendorAddress=_vendorAddress)
    context["owner_address"]= event.ownerAddress
    shoppingList = ShoppingList.objects.get(event = event)

    if request.method == 'POST':
        formName = request.POST.get('form_name')

        if formName == "new_item_form":
            newItemForm= NewItemForm(request.POST)
            if newItemForm.is_valid():
                Item.objects.create(name= newItemForm.cleaned_data['item_name'],
                                    price= newItemForm.cleaned_data['item_price'],
                                    description = newItemForm.cleaned_data['item_description'],
                                    shoppingList=shoppingList
                )

        elif formName == "delete_item":
            IDtoDelete = request.POST.get('item_id')  
            Item.objects.get(id=IDtoDelete).delete()
    else:
        pass
    itemsList={}
    for item in Item.objects.filter(shoppingList=shoppingList):
        itemsList[item.id]={"name":item.name,
                                 "price":item.price,
                                 "desctipion":item.description}
    newItemForm= NewItemForm()
    context["item_list"] = itemsList
    context["new_item_form"] = newItemForm
    return render(request,"vendor.html",context)

def tokenPage(response,_tokenAddress):
    context, event = getContext(tokenAddress=_tokenAddress)

    return render(response,"token.html",context)

def purchasePage(request,_vendorAddress):
    context,event = getContext(vendorAddress=_vendorAddress)
    shoppingList = ShoppingList.objects.get(event = event)
    itemsList={}
    if request.method == "POST":
        amount = request.POST.get("total_price")
        itemsPayed = request.POST.get("items_chart")
        userAddres = request.POST.get("user_address")
        txHash =     request.POST.get("tx_hash")
        packNewOrder(event,userAddres,txHash,amount,itemsPayed)
    

    for item in Item.objects.filter(shoppingList=shoppingList):
        itemsList[item.id]={"name":item.name,
                                 "price":item.price,
                                 "desctipion":item.description}
    itemsList_json=json.dumps(itemsList)
    context["item_list"]=itemsList
    context["item_list_json"]=itemsList_json
    return render(request,"purchase.html",context)

def scanCode(request,_vendorAddress):
    context,event = getContext(vendorAddress=_vendorAddress)
    scannedForm =ScannedOrderForm()
    #vendor auth
    context["scanned_form"]= scannedForm
    return render(request,"scan-code.html",context)

def myOrdersPage(request,_eventID,_userAddress):
    context, event = getContext(eventID=_eventID)
    orders = Order.objects.filter(event=event,userAddress=_userAddress)
    orders_dict={}
    for order in orders:
        orders_dict[order.ID] = model_to_dict(order)
        orders_dict[order.ID]["itemsPayed"] = buildItemsDict(orders_dict[order.ID])
    context["orders_dict"]=orders_dict
    context["orders_dict_json"]=json.dumps(orders_dict)
    return render(request,"my-orders.html",context)

