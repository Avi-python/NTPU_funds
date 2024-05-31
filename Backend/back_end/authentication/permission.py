from rest_framework import permissions
from utils.blockchain import isAppOwner


class IsAppOwner(permissions.BasePermission):

    def has_permission(self, request, view): # 確認是否是app的owner，才可以修改資料
        
        result = isAppOwner(request.user.address)
        print("is app owner:", result)
        return result