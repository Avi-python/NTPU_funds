from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, parser_classes, permission_classes
from .permission import IsProjectCreator, IsProjectFollower, IsProjectCreatorOrFollower
from rest_framework.parsers import FormParser, MultiPartParser
from .models import Project, ProgressCell, ProgressCellDoc

import os

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsProjectCreator])
@parser_classes([FormParser, MultiPartParser])
def createProgressCell(request):

    try:
        
        if(not Project.objects.filter(projectId=request.data['projectId']).exists()):
            Project.objects.create(
                projectId=request.data['projectId'],
            )

        project = Project.objects.get(projectId=request.data['projectId'])

        progress_cell = ProgressCell.objects.create(
            project=project,
            progress_cell_title=request.data['title'],
            progress_cell_description=request.data['description']
        )

        for key, value in request.data.items():

            if key.startswith('file'):
                # original_name = value.name
                # value._set_name(f'/{progress_cell.progress_cell_id}/{original_name}');
                ProgressCellDoc.objects.create(
                    progress_cell=progress_cell,
                    file=value
                )
            
    except Exception as e:
        print("Create Progress Cell Error: ", e)
        return JsonResponse({'error': "Create Progress Cell failed."}, status=400)

    return JsonResponse({'message': "Create progress cell success."}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsProjectCreatorOrFollower])
def getProgress(request):

    print("getProgress request.data", request.data)

    if(not Project.objects.filter(projectId=request.data['projectId']).exists()):
        return JsonResponse({'progress': []}, status=200)

    try:
        project = Project.objects.get(projectId=request.data['projectId'])
        progress_cells = project.progresscell_set.all()
    except Exception as e:
        print("Get progress cell error: ", e)
        return JsonResponse({'error': "Get progress cell failed."}, status=400)

    result = []

    for cell in progress_cells:
        result.append({
            'id': str(cell.progress_cell_id),
            'title': cell.progress_cell_title,
            'description': cell.progress_cell_description,
            'files': [doc.file.name for doc in cell.progresscelldoc_set.all()],
            'upload_date': (cell.progress_cell_upload_date).astimezone(timezone.get_default_timezone()).strftime('%Y-%m-%d %H:%M:%S')
        })

    return JsonResponse({'progress': result}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsProjectCreatorOrFollower])
def getProgressCellFile(request):

    print("getProgressCellFile request.data[filename]", request.data['fileName'])

    file_path = os.getcwd() + "\\files\\" + request.data['fileName'][6:]

    if not os.path.exists(file_path):
        return JsonResponse({'error': 'Image not found'}, status=404)

    return FileResponse(open(file_path, 'rb'));
