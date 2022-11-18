"""EventProject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from EventApp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path("newEvent/",views.newEvent, name="newEvent"),
    path("",views.home),
    path('events/<int:_eventID>',views.eventView, name = "eventView"),
    path('events/',views.allEvents, name = "events"),
    path('vendors/<str:_vendorAddress>',views.vendorPage, name = "vendor"),
    path('tokens/<str:_tokenAddress>',views.tokenPage, name = "token"),
    path('vendors/<str:_vendorAddress>/purchase',views.purchasePage, name = "Purchase"),
    path('vendors/<str:_vendorAddress>/scan',views.scanCode, name = "scan"),
    path('events/<int:_eventID>/<str:_userAddress>/my-orders',views.myOrdersPage, name = "my orders")

]
