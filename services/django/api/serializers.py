from rest_framework import serializers
from user_management.models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserProfile
		fields = ('user', 'nickname', 'score', 'games_played', 'games_won', 'created_at', 'updated_at')
		# fields = '__all__'
