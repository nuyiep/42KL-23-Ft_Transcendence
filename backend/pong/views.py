import jwt
import json
from threading import Thread
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from .models import PongMatch
from .game.main import main_loop
from main.settings import JWT_SECRET_KEY

# NOTE: This should be used in a "try except" block
# Returns CustomUser model if the request has a valid token
# Otherwise, raise an Exception
def get_user_from_token(cookies):
    if 'ID_Token' not in cookies:
        raise Exception('ID_Token not found')

    token = cookies['ID_Token']
    if token == '':
        raise Exception('Invalid token value')

    decoded_jwt = jwt.decode(token, JWT_SECRET_KEY, algorithms='HS256')
    user_model = get_user_model()
    user = user_model.objects.filter(username=decoded_jwt['username'])
    if not user.exists():
        raise Exception('Token bearer not found')

    return user

@csrf_exempt
def create_match(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            user1 = data['player1_uuid']
            user2 = data['player2_uuid']
            match = PongMatch.objects.create(player1_uuid=user1, player2_uuid=user2)
            return JsonResponse({
                'success': True,
                'match_id': match.id
            })

        except Exception as error:
            return JsonResponse({'success': False, 'Error': str(error)}, status=401)

    return JsonResponse({
        'error': 'Invalid request method',
    })