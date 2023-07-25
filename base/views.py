from django.shortcuts import render
from django.http import JsonResponse
import random
import time
import json

from .models import RoomMember

from agora_token_builder import RtcTokenBuilder

from django.views.decorators.csrf import csrf_exempt

# Create your views here.

def getToken(request):
    appId = '93c44df7969141908e2870680fdd7dea'
    appCertificate = 'b3eac0b56ae8416f99c4a50ef0176e54'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTime = 3600 * 5
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTime
    role = 1

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)

    return JsonResponse({'token': token, 'uid': uid}, safe=False)

def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')

@csrf_exempt
def createUser(request):
    data = json.loads(request.body)

    member, created = RoomMember.objects.get_or_create(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name']
    )
    return JsonResponse({'name': data['name']}, safe=False)

@csrf_exempt
def getUser(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    user = RoomMember.objects.get(
        uid = uid,
        room_name = room_name,
    )

    name = user.name
    return JsonResponse({'name': user.name}, safe=False)

@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)

    try:
        user = RoomMember.objects.get(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name'],
        )
        user.delete()
    except RoomMember.DoesNotExist:
        user = None

    return JsonResponse('Member Deleted', safe=False)