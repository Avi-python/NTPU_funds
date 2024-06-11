from django.contrib import admin
from .models import Project, ProgressCell, ProgressCellDoc

# Register your models here.
admin.site.register(Project)
admin.site.register(ProgressCell)
admin.site.register(ProgressCellDoc)
