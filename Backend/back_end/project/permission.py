from rest_framework import permissions

class IsProjectCreator(permissions.BasePermission):

    def has_object_permission(self, request, view, obj): # 確認是否是project的creator，才可以修改資料

        return 
    

class IsProjectFollower(permissions.BasePermission):

    def has_object_permission(self, request, view, obj): # 確認是否是project的follower，才可以獲取資料
        
        return