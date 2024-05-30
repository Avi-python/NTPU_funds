from django.shortcuts import render
from django.http import JsonResponse, response, FileResponse, HttpResponse
from django.conf import settings

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, parser_classes, permission_classes
from .permission import IsAppOwner
from rest_framework.parsers import FormParser, MultiPartParser
from .models import Applicant, ApplicantCertifiedDocs
from utils.blockchain import getAddress, addCreator
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializer import MyTokenObtainPairSerializer

import os
import base64
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['POST'])
@parser_classes([FormParser, MultiPartParser])
def register(request):
    # do something
    data = request.data

    try:

        address = getAddress(data['message_hash'], data['signature'])

        applicant = Applicant.objects.create(
            name=data['name'],
            email=data['email'],
            address=address,
        )
        

        for key, value in data.items():
            if key.startswith('image'):
                ApplicantCertifiedDocs.objects.create(
                    applicant=applicant,
                    image=value
                )
    except Exception as e:
        print("Register Error: ", e)
        return JsonResponse({'error': "Register failed."}, status=400)

    return JsonResponse({'message': "Apply success. Wait for approval."}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAppOwner])
def applicants(request):
    # do something

    applicants = Applicant.objects.all()
    data = []
    for applicant in applicants:
        data.append({
            'name': applicant.name,
            'email': applicant.email,
            'address': applicant.address,
            'certified_docs': [doc.image.url for doc in applicant.applicantcertifieddocs_set.all()]
        })

    return JsonResponse({'applicants': data}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAppOwner])
def certified_doc(request):

    image_path = request.data["doc_name"]
    image_path = os.getcwd() + image_path 

    # print("image_path: ", image_path);
    # print("os.getcwd(): ", os.getcwd());

    if not os.path.exists(image_path):
        return JsonResponse({'error': 'Image not found'}, status=404)

    with open(image_path, 'rb') as f:
        base64image = base64.b64encode(f.read())

    return HttpResponse(base64image, content_type='image/jpes');

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAppOwner])
def reject_applicant(request):

    data = request.data
    address = data['address']

    try:
        applicant = Applicant.objects.get(address=address)
        applicant.delete()
    except Exception as e:
        print("Reject Error: ", e)
        return JsonResponse({'error': "Reject failed."}, status=400)
    
    return JsonResponse({'message': "Reject success."}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAppOwner])
def approve_applicant(request):

    data = request.data
    address = data['address']

    try:
        addCreator(address)
        applicant = Applicant.objects.get(address=address)
        applicant.delete()
    except Exception as e:
        print("Approve Error: ", e)
        return JsonResponse({'error': "Approve failed."}, status=400)
    
    return JsonResponse({'message': "Approve success."}, status=200)

    