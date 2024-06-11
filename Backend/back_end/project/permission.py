from rest_framework import permissions
from utils.blockchain import isProjectCreator, isProjectFollower

class IsProjectCreator(permissions.BasePermission):

    def has_permission(self, request, view): # 確認是否是project的creator，才可以修改資料

        result = isProjectCreator(int(request.data['projectId']), request.user.address)
        print("is app creator:", result)
        return result
    

class IsProjectFollower(permissions.BasePermission):

    def has_permission(self, request, view): # 確認是否是project的follower，才可以獲取資料

        result = isProjectFollower(int(request.data['projectId']), request.user.address)
        print("is app follower:", result)
        return result
    
class IsProjectCreatorOrFollower(permissions.BasePermission):

    def has_permission(self, request, view): # 確認是否是project的creator或follower，才可以修改資料
        return IsProjectFollower.has_permission(self, request, view) or IsProjectCreator.has_permission(self, request, view)