var path = require('path')
var config = require('./config.json')
var express = require('express')
var session = require('express-session')
var app = express()
// var tools = require('./tools/tools.js')
qs = require('querystring');

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({secret: 'secret', resave: 'false', saveUninitialized: 'false'}))

// Initial view - loads Connect To QuickBooks Button
app.get('/', function (req, res) {
	console.log(req)
  res.render('home', config)
})
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var api_calls = require('./routes/api_call');

// Sign In With Intuit, Connect To QuickBooks, or Get App Now
// These calls will redirect to Intuit's authorization flow
app.use('/sign_in_with_intuit', require('./routes/sign_in_with_intuit.js'))
app.use('/connect_to_quickbooks', require('./routes/connect_to_quickbooks.js'))
app.use('/connect_handler', require('./routes/connect_handler.js'))
app.use('/api_call', api_calls);
// Callback - called via redirect_uri after authorization
app.use('/callback', require('./routes/callback.js'))

// Connected - call OpenID and render connected view
app.use('/connected', require('./routes/connected.js'))

// Call an example API over OAuth2

// app.use('/api_call', require('./routes/api_call.js'))

app.post('/api_hgfvcall', function (req, res) {
	console.log(req.method)
	console.log(req.url )
	if (req.method === 'POST' && req.url === '/qbo') {
	    var body = '';
	    req.on('data', function(chunk) {
	      body += chunk;
	    });
	    req.on('end', function() {
	      var data1 = qs.parse(body);
	      res.writeHead(200);
	      res.end(JSON.stringify(data));
	      // app.get("/api_call", function(data) {
	      //   // $("#result").html(JSON.stringify(data, null, 2))
	      
	      // })
	      // now you can access `data.email` and `data.password`
	      
	      
		})
  	} else {
	    res.writeHead(404);
	    res.end();
  	}
	console.log(req.data)
  res.render('home', config)
});
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, err => {
    if(err) throw err;
    console.log("%c Server running", "color: green");
});
// Start server on HTTP (will use ngrok for HTTPS forwarding)
// app.listen(80, function () {
//   console.log('Example app listening on port 80!')
// })
