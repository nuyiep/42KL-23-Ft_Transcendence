from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .serializers import UserProfileSerializer
from user_management.models import UserProfile

def defaultPage(request):
	return render(request, 'home.html')

def home(request):
	return render(request, 'home.html')

# Create your views here.
class RegistrationView(CreateView):
	form_class = UserCreationForm
	success_url = reverse_lazy('login')
	template_name = 'register.html'

	def form_valid(self, form):
		user = form.save()
		login(self.request, user)
		return super().form_valid(form)

class CustomLoginView(LoginView):
	template_name = 'login.html'

class CustomLogoutView(LogoutView):
	template_name = 'logged_out.html'

class UserProfileViewSet(viewsets.ModelViewSet):
	queryset = UserProfile.objects.all()
	serializer_class = UserProfileSerializer
