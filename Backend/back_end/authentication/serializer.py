from rest_framework import serializers
from .models import  Applicant

class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = '__all__'
    
    def create(self, validated_data):
        return Applicant.objects.create(**validated_data)