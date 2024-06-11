
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
      path('create-progress-cell/', views.createProgressCell, name='create-progress-cell'),
      path('get-progress/', views.getProgress, name='get-progress'),
      path('get-progress-cell-file/', views.getProgressCellFile, name='get-progress-cell-file'),
]