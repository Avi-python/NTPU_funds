from django.contrib import admin
from .models import Applicant, ApplicantCertifiedDocs

# Register your models here.


admin.site.register(Applicant)
admin.site.register(ApplicantCertifiedDocs)