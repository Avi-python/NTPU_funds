from rest_framework import serializers
from .models import  Applicant
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenObtainSerializer
from typing import Any, Dict, Optional, Type, TypeVar
from rest_framework_simplejwt.tokens import RefreshToken, Token
from utils.blockchain import getAddress
from django.conf import settings

# dev
import jwt
from datetime import datetime

class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = '__all__'
    
    def create(self, validated_data):
        return Applicant.objects.create(**validated_data)
    

class MyTokenObtainSerializer(serializers.Serializer):

    # username_field = get_user_model().USERNAME_FIELD
    token_class: Optional[Type[Token]] = None

    # default_error_messages = {
    #     "no_active_account": _("No active account found with the given credentials")
    # }

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        # self.fields["name"] = serializers.CharField(write_only=True)
        self.fields["message_hash"] = serializers.CharField(write_only=True)
        self.fields["signature"] = serializers.CharField(write_only=True)

    @classmethod
    def validate(self, attrs: Dict[str, Any]) -> Dict[Any, Any]:
        # authenticate_kwargs = {
        #     "name": attrs["name"],
        #     "message_hash": attrs["password"],
        #     "signature": attrs["signature"],
        # }

        try:
            # authenticate_kwargs["request"] = self.context["request"]
            self.user = getAddress(attrs["message_hash"], attrs["signature"])
        except KeyError:
            pass

        # 我們其實沒有真正意義上的 validate，只是為了要取得 address

        return {}

    @classmethod
    def get_token(cls, user) -> Token:
        # return cls.token_class.for_user(user)  # type: ignore
        return cls.for_user(user)

    def for_user(user) -> Token: # 我從 Token 那邊搬過來的
        """
        Returns an authorization token for the given user that will be provided
        after authenticating the user's credentials.
        """
        # user_id = getattr(user, api_settings.USER_ID_FIELD)
        # if not isinstance(user_id, int):
        #     user_id = str(user_id)
        

        token = RefreshToken()
        token["address"] = user

        # if api_settings.CHECK_REVOKE_TOKEN:
        #     token[api_settings.REVOKE_TOKEN_CLAIM] = get_md5_hash_password(
        #         user.password
        #     )

        return token



class MyTokenObtainPairSerializer(MyTokenObtainSerializer):

    @classmethod
    def get_token(self, user):
        print("get_token")
        token = super().get_token(user=user)
        return token

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        decoded_payload = jwt.decode(str(refresh), settings.SECRET_KEY, algorithms=["HS256"])

        print(decoded_payload)
        print("datetime: ", datetime.fromtimestamp(decoded_payload["exp"]))

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        # if api_settings.UPDATE_LAST_LOGIN:
        #     update_last_login(None, self.user)

        return data;
