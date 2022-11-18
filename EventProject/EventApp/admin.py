
from django.contrib import admin

# Register your models here.
from .models import Event,Order,Item


class ItemInline(admin.StackedInline):
    model = Item
    extra=0

class OrderInline(admin.StackedInline):
    model = Order
    extra=0

class OrderAdmin(admin.ModelAdmin):
    model = Order


class EventAdmin(admin.ModelAdmin):
    #inlines = [OrderInline]
    #raw_id_fields=["name"]
    model = Event

admin.site.register(Event,EventAdmin)
admin.site.register(Order,OrderAdmin)

