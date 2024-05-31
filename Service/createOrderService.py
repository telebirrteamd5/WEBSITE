import requests
import applyFabricTokenService
import json
from utils import tools 
from config import env
class CreateOrderService:
    req = None;
    BASE_URL = None
    fabricAppId = None
    appSecret = None
    merchantAppId = None
    merchantCode = None
    notify_path = None
    
    def __init__(self,req,BASE_URL,fabricAppId,appSecret,merchantAppId,merchantCode):
        self.req=req
        self.BASE_URL=BASE_URL
        self.fabricAppId=fabricAppId
        self.appSecret=appSecret
        self.merchantAppId=merchantAppId
        self.merchantCode=merchantCode
        self.notify_path = "https://"
    # @Purpose: Creating Order
    #  *
    #  * @Param: no parameters it takes from the constructor
    #  * @Return: rawRequest|String
    def createOrder(self):
        title = self.req.title;
        amount = self.req.amount;
        applyFabricTokenResult = applyFabricTokenService.ApplyFabricTokenService(self.BASE_URL,self.fabricAppId,self.appSecret,self.merchantAppId)
        result=json.dumps(applyFabricTokenResult.applyFabricToken())
        fabricToken = result.token
        createOrderResult = self.requestCreateOrder(fabricToken,title,amount)
        prepayId = json.dump(createOrderResult).biz_content.prepay_id
        rawRequest = self.createRawRequest(prepayId)
        return rawRequest
    #  * @Purpose: Requests CreateOrder
    #  *
    #  * @Param: fabricToken|String title|string amount|string
    #  * @Return: String | Boolean
    def requestCreateOrder(self,fabricToken,title,amount):
        headers = {
            "Content-Type":"application/json",
            "X-APP-Key":self.fabricAppId,
            "Authorization":fabricToken
        }
        # Body parameters
        payload = self.createRequestObject(title,amount)
        servert_output = requests.post(url=self.BASE_URL,headers=headers,params=payload,verify=True)
        return servert_output
    #  * @Purpose: Creating Request Object
    #  *
    #  * @Param: title|String and amount|String
    #  * @Return: Json encoded string
    def createRequestObject(self,title,amount):
        req = {
            "nonce_str":tools.createNonceStr(),
            "method":"payment.preorder",
            "timestamp":tools.createTimeStamp(),
            "version":"1.0",
            "biz_content":{},   
        }
        biz={
            "notify_url":self.notify_path,
            "business_type":"BuyGoods",
            "trade_type":"InApp",
            "appid":self.merchantAppId,
            "merch_code":self.merchantCode,
            "merch_order_id":tools.createMerchantOrderId(),
            "title":title,
            "total_amount":amount,
            "trans_currency":"ETB",
            "timeout_express":"120m",
            "payee_identifier":"220311",
            "payee_identifier_type":"04",
            "payee_type":"5000"
        }
        req["biz_content"] = biz
        req["sign_type"] = "SHA256withRSA"
        req["sign"] = "Lets say that we got the sign in this field"
        return json.dump(req)
    #  * @Purpose: Create a rawRequest string for H5 page to start pay
    #  *
    #  * @Param: prepayId returned from the createRequestObject
    #  * @Return: rawRequest|string
    def createRawRequest(self,prepayId):
        maps={
            "appid":self.merchantAppId,
            "merch_code":self.merchantCode,
            "nonce_str":tools.createNonceStr(),
            "prepay_id":prepayId,
            "timestamp":tools.createTimeStamp(),
            "sign_type":"SHA256WithRSA" 
        }
        rawRequest=""
        for (key,value) in map:
            rawRequest = rawRequest + key + "=" + value + "&"
        sign = tools.sign(maps)
        rawRequest = rawRequest+"sign="+sign
        return rawRequest

# req = {
#     "title":"demo 10",
#     "amount":"10"
# }
# createOrderService = CreateOrderService(req,env.ENV_VARIABLES["BASE_URL"],env.ENV_VARIABLES["fabricAppId"],env.ENV_VARIABLES["appSecret"],env.ENV_VARIABLES["merchantAppId"],env.ENV_VARIABLES["merchantCode"])    
# c = createOrderService.createRequestObject("Demo 10","10")
# print(c)
