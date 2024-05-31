import requests
import json
import urllib3

urllib3.disable_warnings()
class ApplyFabricTokenService:
    BASE_URL = None;
    fabricAppId = None
    appSecret = None
    merchantAppId = None
    def __init__(self,BASE_URL,fabricAppId,appSecret,merchantAppId) :
        self.BASE_URL = BASE_URL
        self.fabricAppId = fabricAppId
        self.appSecret = appSecret
        self.merchantAppId = merchantAppId
    
    def applyFabricToken(self):
        headers = {
        "Content-Type":"application/json",
        "X-APP-Key": self.fabricAppId
        }
        payload = {
              "appSecret": self.appSecret
        }
        data=json.dumps(payload)
        authToken = requests.post(url=self.BASE_URL,headers=headers,params=data,verify=True)
        return authToken
