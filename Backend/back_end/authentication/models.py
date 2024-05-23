from django.db import models

# Create your models here.

class Applicant(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    address = models.CharField(max_length=100, primary_key=True)

    REQUIRED_FIELDS = ['name', 'email', 'address']

    def __str__(self):
        return self.name
    
class ApplicantCertifiedDocs(models.Model):
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='images/')

    class Meta:
        unique_together = ['applicant', 'image']

    REQUIERD_FIELDS = ['applicant', 'image']
    
    def __str__(self):
        return self.applicant.name