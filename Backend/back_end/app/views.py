from django.shortcuts import render
from django.http import JsonResponse, response
from django.conf import settings

def function1(request):
    # do something
    return JsonResponse({"data":"hello world"})