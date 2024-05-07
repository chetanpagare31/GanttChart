

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import *
from .serializers import TaskSerializer
from rest_framework import status
from django.shortcuts import render

def home(request):
    return render(request, 'index.html')

@api_view(['GET','POST'])
def task_list_view(request):

    try:
        tasks = Tasks.objects.all()
    except Tasks.DoesNotExist:
        return Response(status= status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors,status=400)


@api_view(['GET', 'PUT', 'DELETE'])

def task_change_view(request, pk):
    try:
        task = Tasks.objects.get(pk=pk)
    except Tasks.DoesNotExist:
        return Response(status= status.HTTP_404_NOT_FOUND)
  

    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    if request.method == 'PUT':
        serializer = TaskSerializer(task, data= request.data, partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors)

    if request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        