from rest_framework import permissions

class IsWalletOwner(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):



        return obj.owner == request.user