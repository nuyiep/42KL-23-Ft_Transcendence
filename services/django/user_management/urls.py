from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path
from .views import RegistrationView, CustomLoginView, CustomLogoutView, home

urlpatterns = [
	path('', home, name='home'),
	path('home/', home, name='home_url'),
	path('register/', RegistrationView.as_view(), name='register'),
	path('login/', CustomLoginView.as_view(), name='login'),
	path('logout/', CustomLogoutView.as_view(), name='logout'),
]
