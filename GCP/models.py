from django.db import models
from datetime import date
# Create your models here.


class Tasks(models.Model):
    item = models.CharField(max_length=200)
    person = models.CharField(max_length=100,choices=[
                                    ('Chetan Pagare', 'Chetan Pagare'),
                                    ('Hari', 'Hari'),
                                    ('Saranya', 'Saranya'),])
    status = models.CharField(max_length=20,choices=[
        ('In Progress', 'In Progress'),
        ('Done', 'Done'),
        ('On Hold', 'On Hold'),])
    start_date = models.DateField()
    end_date = models.DateField(default=date.today) 
    tags = models.CharField(max_length=255,choices=[
                                    ('backend task', 'backend task'),
                                    ('frontend task', 'frontend task'),
                                    ('Testing', 'Testing'),])

    def __str__(self):
        return self.item