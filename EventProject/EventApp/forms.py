from django import forms
from django.contrib.admin.widgets import AdminDateWidget
from .widgets import DatePickerInput, TimePickerInput
from datetime import date
class NewEventForm(forms.Form):
    event_name = forms.CharField(label='Event Name', max_length=100)
    event_date = forms.DateField(label='Event Date', initial=date.today,widget=DatePickerInput)
    event_time = forms.TimeField(label ="time",widget=TimePickerInput)
    event_duration = forms.IntegerField(label='Event Duration')
    presale_duration = forms.IntegerField(label='Presale Duration',min_value=1)
    cashback = forms.IntegerField(label='Cashback %',max_value=100,min_value=0)
    
class NewItemForm(forms.Form):
    item_name = forms.CharField(label="Item name",max_length=20)
    item_price = forms.IntegerField(min_value=1,initial=1)
    item_description = forms.CharField(max_length=255)

class ScannedOrderForm(forms.Form):
    order_ID = forms.IntegerField(label='Order ID', min_value=0)
    order_ID.widget.attrs['readonly'] = True
    order_code = forms.CharField(label='Order Code', max_length=64)
    order_code.widget.attrs['readonly'] = True
    user_address = forms.CharField(label='User Address', max_length=64)
    user_address.widget.attrs['readonly'] = True





