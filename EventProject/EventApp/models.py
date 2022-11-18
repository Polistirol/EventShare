from django.db import models
from django.contrib.postgres.fields import ArrayField

ADDRESS_LENGHT = 42    #valid for etherem
TX_LENGHT = 66         #valid for etherem, 64+0x

# Create your models here.
class Token(models.Model):
    address = models.CharField(max_length=ADDRESS_LENGHT)
    name = models.CharField(max_length=10)
    symbol = models.CharField(max_length=5)
    supply = models.IntegerField()
    enabled = models.BooleanField(default=False)

class Vendor(models.Model):
    address= models.CharField(max_length=ADDRESS_LENGHT)
    enabled = models.BooleanField(default=False)


class Event(models.Model):
    ID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=30)
    date = models.DateTimeField()
    presale = models.IntegerField()
    duration = models.IntegerField()
    cashback = models.IntegerField()
    acceptedToken = models.CharField(max_length=ADDRESS_LENGHT,default="0x0")
    ownerAddress = models.CharField(max_length=ADDRESS_LENGHT)
    managerContract = models.CharField(max_length=ADDRESS_LENGHT)
    token = models.OneToOneField(Token,on_delete=models.CASCADE,null=True)    
    vendor = models.OneToOneField(Vendor,on_delete=models.CASCADE,null = True)  

class ShoppingList(models.Model):
    event = models.OneToOneField(Event,on_delete=models.CASCADE)

class Order(models.Model):
    ID = models.AutoField(primary_key=True)
    code = models.CharField(max_length=64)
    userAddress = models.CharField(max_length=ADDRESS_LENGHT)
    txHash = models.CharField(max_length=TX_LENGHT)
    event = models.ForeignKey(Event,on_delete=models.CASCADE,null=True)
    itemsPayed = ArrayField(models.IntegerField(),default=list)
    itemsRedeemed = ArrayField(models.IntegerField(),default=list)
    fulfilled = models.BooleanField(default= False)
    dateTime = models.DateTimeField(auto_now_add=True)
    amount = models.FloatField(default=0.0)

    #qrCode 

class Item(models.Model):
    #ID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=30)
    price = models.FloatField(default=0.0)
    description = models.TextField(default="")
    shoppingList = models.ForeignKey(ShoppingList,on_delete=models.CASCADE)
