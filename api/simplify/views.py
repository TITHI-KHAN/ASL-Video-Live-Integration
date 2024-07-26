from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Replacer

# This class creates the post function that receives content from background.js
# on the extension and routes the request to the Replacer (from models.py)
# Then, it returns the response containing the simplified text
class SupplySimplifications(APIView):
    replaceTool = Replacer()
    """Returns the simplified text for given complex text. needs error handling

    Keyword arguments:
    request -- Request object
    amount -- Specifies the number of simpliefied paragraphs to be replaced
            Applicable only to documents.
    """ 

    def post(self, request, amount = None):
        data = self.request.data
        print("Request = ", request)
        if "type" not in data:
            # no type category
            return Response("No type provided", status=status.HTTP_404_NOT_FOUND)
        try:
            if data["type"] == "sentence":
                sentence = self.replaceTool.replaceSentence(data["text"])
                return Response(sentence)
        except KeyError as e:
            return Response("Invalid type provided", status=status.HTTP_404_NOT_FOUND)