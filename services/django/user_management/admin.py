from django.contrib import admin
from .models import UserProfile

class UserProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'nickname', 'score', 'games_played', 'games_won', 'created_at', 'updated_at')

# Register your models here.
admin.site.register(UserProfile, UserProfileAdmin)
