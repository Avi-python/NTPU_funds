from django.shortcuts import render
from django.http import JsonResponse, response, FileResponse
from django.conf import settings
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from .models import Applicant, ApplicantCertifiedDocs
from utils.blockchain import get_address

@api_view(['POST'])
@parser_classes([FormParser, MultiPartParser])
def register(request):
    # do something
    data = request.data

    try:

        address = get_address(data['message_hash'], data['signature'])

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