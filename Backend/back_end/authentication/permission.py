from rest_framework import permissions
from utils.blockchain import isAppOwner

class IsProjectCreator(permissions.BasePermission):

    def has_object_permission(self, request, view, obj): # 確認是否是project的creator，才可以修改資料

        

        return 
    

class IsProjectFollower(permissions.BasePermission):

    def has_object_permission(self, request, view, obj): # 確認是否是project的follower，才可以獲取資料

        
        return

class IsAppOwner(permissions.BasePermission):

    def has_permission(self, request, view): # 確認是否是app的owner，才可以修改資料
        
        result = isAppOwner(request.user.address)
        print("is app owner:", result)
        return result