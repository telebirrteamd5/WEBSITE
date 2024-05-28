import uuid
import time
from Crypto.PublicKey import RSA
from Crypto.Hash import SHA256
from Crypto.Signature import PKCS1_v1_5
from base64 import b64decode, b64encode
from config import env

def sign(request):
    key = env.ENV_VARIABLES["private_key"]
    exclude_fields = ["sign", "sign_type", "header", "refund_info", "openType", "raw_request"]
    data = request
    request.sort()
    stringApplet = ""
    for (key,values) in data:
        if key in exclude_fields:
            continue
        if key == "biz_content":
            for (k,v) in values:
                if stringApplet == "":
                    stringApplet = k + "=" + v
                else:
                    stringApplet = stringApplet + "&" + k + "=" + v
        else:
            if stringApplet == "":
                stringApplet = key + "=" + values
            else:
                stringApplet = stringApplet + "&" + key + "=" + values
    sortedString = sortedString(stringApplet)
    
    return SignWithRSA(sortedString,key)
# def getParaMapToSign(dict_req):
#       """ Extract the request attributes to be signed into a dict
#       :param dict_req: the request as dict format
#       :return: the sign dict
#       """
#       # the field which do not participate in signing
#       exclude_fields = ['sign', 'sign_type', 'header', 'refund_info', 'openType', 'raw_request']
#       result = {}
#       for (key, value) in dict_req.items():
#           if key in exclude_fields:
#               continue
#           if isinstance(value, dict):
#               result.update(getParaMapToSign(value))
#           else:
#               result[key] = value
#       return result
  
# def getSignSourceString(dict_req):
#   """ Generate signature original string
#   :param dict_req: the sign source as dict format
#   :return: the sign string as URL parameter format
#   """
#   result = ''
#   result += '&'.join([str(key) + '=' + str(value) for key, value in dict(sorted(dict_req.items())).items()])
#   return result

def sortedString(stringApplet):
    stringExplode=""
    sortedArray = str(stringApplet).split("&")
    sortedArray.sort()
    for (key,value) in sortedArray:
        if stringExplode == "":
            stringExplode = value
        else:
            stringExplode = stringExplode + "&" + value
    return stringExplode
    
# print("sortedString")
# """ Generate signature
#       :param data: the key=value&key2=value2 format signature source string
#       :param key: Sign key
#       :param sign_type: sign type SHA256withRSA or HmacSHA256
#       :return: sign string
# """
def SignWithRSA(data,key, sign_type="SHA256withRSA"):
    if sign_type == "SHA256withRSA":
        key_bytes = b64decode(key.encode("utf-8"))
        key = RSA.importKey(key_bytes)
        digest = SHA256.new()
        digest.update(data.encode("utf-8"))
        signer = PKCS1_v1_5.new(key)
        signature = signer.sign(digest)
        return b64encode(signature).decode("utf-8")
    else:
        return "Only allowed to the type SHA256withRSA hash"

#  * @Purpose: Creating a new merchantOrderId
#  *
#  * @Param: no parameters
#  * @Return: returns a string format of time (UTC)
def createMerchantOrderId():
    return str(time.time())

def createTimeStamp():
    return str(time.time())

def createNonceStr():
    return uuid.uuid1()
