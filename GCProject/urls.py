from django.contrib import admin
from django.urls import path
from GCP.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/task', task_list_view),
    path('api/task/<int:pk>', task_change_view),
    path('', home),
]
