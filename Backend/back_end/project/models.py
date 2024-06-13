from django.db import models
from django.dispatch import receiver
from django.conf import settings
from django.db.models.signals import post_delete
from django.utils import timezone

# Create your models here.

class Project(models.Model):
    projectId = models.CharField(max_length=100, primary_key=True)

    REQUIRED_FIELDS = ['projectId']

    def __str__(self):
        return self.projectId
    
class ProgressCell(models.Model):
    def number():
        no = ProgressCell.objects.count()
        if no == None:
            return 1
        else:
            return no + 1

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    progress_cell_id = models.AutoField(primary_key=True, default=number, editable=False)
    progress_cell_title = models.CharField(max_length=100)
    progress_cell_description = models.TextField(default='no description')
    progress_cell_upload_date = models.DateTimeField(default=timezone.now())

    REQUIERD_FIELDS = ['project', 'progress_cell_id', 'progress_cell_title']
    
    def __str__(self):
        return str(self.progress_cell_id)
    
class ProgressCellDoc(models.Model):
    progress_cell = models.ForeignKey(ProgressCell, on_delete=models.CASCADE)
    file = models.FileField(upload_to='files/')

    class Meta:
        unique_together = ['progress_cell', 'file']

    REQUIERD_FIELDS = ['progress_cell', 'file']
    
    def __str__(self):
        return self.file.name
    
@receiver(post_delete, sender=ProgressCellDoc)
def submission_delete(sender, instance, **kwargs):
    instance.file.delete(False)

