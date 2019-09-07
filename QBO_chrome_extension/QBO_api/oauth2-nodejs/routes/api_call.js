var tools = require('../tools/tools.js')
var config = require('../config.json')
var request = require('request')
var express = require('express')
var router = express.Router()
var qs = require('querystring');

/** /api_call **/
router.post('/PO', function (req, res) {
  // console.log(req.body);
  var token = tools.getToken(req.session)
  if(!token) return res.json({error: 'Not authorized'})
  if(!req.session.realmId) return res.json({
    error: 'No realm ID.  QBO calls only work if the accounting scope was passed!'
  })
    var itemData = [];
// console.log('ocean1243')
  // if (req.method === 'POST' && req.url === '/PO') {
    // console.log('ocean')
      var entityId = req.body.entity_id
      var entityType = req.body.entity_type
      var lineItem = req.body.line_item
      // console.log(lineItem)
      var jsonP = JSON.parse(lineItem);
      // console.log(jsonP)
      jsonP.forEach(function(obj,index) {
        console.log(obj);
        var itemName        = obj.itemName
        var itemVendorId    = obj.itemVendorId
        var itemVendorName  = obj.itemVendorName
        var itemCustName    = obj.itemCustName
        var itemCustId      = obj.itemCustId
        var itemQty         = obj.qty
        var itemRate        = parseInt(obj.rate)
        var itemAmount      = parseInt(obj.amount)

        var Id = '';
        //    var arrayData = body;
        // res.end(arrayData);
        // var itemName = 'Pest Control';
        var url = config.api_uri + req.session.realmId + '/query?query=select%20%2a%20from%20item%20where%20Name%20like%20%27'+itemName+'%27&minorversion=4'
        // var url = config.api_uri + req.session.realmId + '/salesreceipt/8'
        console.log('Making API call to: ' + url)
        var requestObj = {
          url: url,
          headers: {
            'Authorization': 'Bearer ' + token.accessToken,
            'Accept': 'application/json'
          }
        }

        // Make API call to get item ID
        request(requestObj, function (err, response) {
          // Check if 401 response was returned - refresh tokens if so!
          tools.checkForUnauthorized(req, requestObj, err, response).then(function ({err, response}) {
            if(err || response.statusCode != 200) {
              return res.json({error: err, statusCode: response.statusCode})
            }

            // API Call was a success!
            var itemResp = JSON.parse(response.body);
            var ItemArray = itemResp.QueryResponse.Item;
            ItemArray.forEach(function(obj,index) {
                  Id = obj.Id;
                  console.log('inner',Id)
              });
            console.log({ Amount: itemAmount,
                              DetailType: 'ItemBasedExpenseLineDetail',
                              ItemBasedExpenseLineDetail: 
                               { CustomerRef: { value: itemCustId, name: itemCustName },
                                 BillableStatus: 'NotBillable',
                                 ItemRef: { value: Id, name: itemName },
                                 UnitPrice: itemRate,
                                 Qty: itemQty,
                                 TaxCodeRef: { value: 'NON' } } })
          //======================== Set up API call (with OAuth2 accessToken)=========================================
                      var url = config.api_uri + req.session.realmId + '/purchaseorder'
                     
                      console.log('Making API call to: ' + url)

                      var requestObj = { method: 'POST',
                      url: url,
                      qs: { minorversion: '4' },
                      headers: {
                          'Authorization': 'Bearer ' + token.accessToken,
                          'Accept': 'application/json'
                        },
                      body: 
                       { Line: 
                          [ { Amount: itemAmount,
                              DetailType: 'ItemBasedExpenseLineDetail',
                              ItemBasedExpenseLineDetail: 
                               { CustomerRef: { value: itemCustId, name: itemCustName },
                                 BillableStatus: 'NotBillable',
                                 ItemRef: { value: Id, name: itemName },
                                 UnitPrice: itemRate,
                                 Qty: itemQty,
                                 TaxCodeRef: { value: 'NON' } } }
                             ],
                         VendorRef: { value: itemVendorId, name: itemVendorName },
                         APAccountRef: { value: '39', name: 'Accounts Payable (A/P)' },
                         TotalAmt: itemAmount },
                      json: true };
                      // console.log(requestObj);
                      // Make API call to create purchase order
                      request(requestObj, function (err, response, body) {
                        // Check if 401 response was returned - refresh tokens if so!
                        tools.checkForUnauthorized(req, requestObj, err, response).then(function ({err, response}) {
                          if(err || response.statusCode != 200) {
                            console.log(err,response.statusCode)
                            // return res.json({error: err, statusCode: response.statusCode})
                          }

                          // API Call was a success!
                          // res.json(response.body)
                          console.log(response.body)
                        }, function (err) {
                          console.log(err)
                          // return res.json(err)
                        })
                      })
  //================================================================================

          })//tools end
        })//request end 
      // });//forEach end
      
  // console.log(itemData);

})//end foreach
return res.json({msg: 'success'})
})

router.get('/vendor', function (req, res) {
  console.log(req.session);
  var token = tools.getToken(req.session)
  if(!token) return res.json({error: 'Not authorized'})
  if(!req.session.realmId) return res.json({
    error: 'No realm ID.  QBO calls only work if the accounting scope was passed!'
  })

  // Set up API call (with OAuth2 accessToken)
  var url = config.api_uri + req.session.realmId + '/query?query=select%20%2a%20from%20vendor&minorversion=4'
  // var url = config.api_uri + req.session.realmId + '/salesreceipt/8'
  console.log('Making API call to: ' + url)
  var requestObj = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + token.accessToken,
      'Accept': 'application/json'
    }
  }

  // Make API call
  request(requestObj, function (err, response) {
    // Check if 401 response was returned - refresh tokens if so!
    tools.checkForUnauthorized(req, requestObj, err, response).then(function ({err, response}) {
      if(err || response.statusCode != 200) {
        return res.json({error: err, statusCode: response.statusCode})
      }

      // API Call was a success!
      res.json(JSON.parse(response.body))
    }, function (err) {
      console.log(err)
      return res.json(err)
    })
  })
})

/** /api_call/revoke **/
router.get('/revoke', function (req, res) {
  var token = tools.getToken(req.session)
  if(!token) return res.json({error: 'Not authorized'})

  var url = tools.revoke_uri
  request({
    url: url,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + tools.basicAuth,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'token': token.accessToken
    })
  }, function (err, response, body) {
    if(err || response.statusCode != 200) {
      return res.json({error: err, statusCode: response.statusCode})
    }
    tools.clearToken(req.session)
    res.json({response: "Revoke successful"})
  })
})

/** /api_call/refresh **/
// Note: typical use case would be to refresh the tokens internally (not an API call)
// We recommend refreshing upon receiving a 401 Unauthorized response from Intuit.
// A working example of this can be seen above: `/api_call`
router.get('/refresh', function (req, res) {
  var token = tools.getToken(req.session)
  if(!token) return res.json({error: 'Not authorized'})

  tools.refreshTokens(req.session).then(function(newToken) {
    // We have new tokens!
    res.json({
      accessToken: newToken.accessToken,
      refreshToken: newToken.refreshToken
    })
  }, function(err) {
    // Did we try to call refresh on an old token?
    console.log(err)
    res.json(err)
  })
})

module.exports = router
