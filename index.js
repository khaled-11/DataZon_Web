const aws = require("aws-sdk"),
express = require('express'),
md5 = require("md5"),
session = require('express-session'),
bodyParser = require('body-parser'),
path = require("path"),
https = require('https');

app = express();
app.use(bodyParser.json());

// Creating the App object in express.
app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// Extent URL encoding function to read queries.
app.use(bodyParser.urlencoded({extended : true}));
// Using body parser to read the Requst Body from the webhook.
app.use(bodyParser.json());
//Setting Views & Public folders and using EJS engine for rendering
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get(`/`, async function(request, response) {
    // Send Website Welcome Page.
    response.render("index");
});
app.get(`/logged`, async function(request, response) {
    // Send Website Welcome Page.
    response.render("logged");
});

// Post request for web login. If the user name and password found in the database, the session will established with the user name //
app.post('/auth', function(request, response) {
	var username = request.body.username;
    var password = request.body.password;  	
	if (username ==="test" && password ==="123456") {
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/logged');
	} else {
        response.render("incorrect");
	}			
			response.end();
    });

var quicksight = new aws.Service({
    apiConfig: require("aws-sdk/apis/quicksight-2018-04-01.min.json"),
    region: 'us-east-1',
});

app.get(`/covid`, async function(request, response) {
    //COVID Dashboard
    console.log(request.session)
    if (request.session.loggedin) {
    quicksight.getDashboardEmbedUrl({
        'AwsAccountId': '055146946590', 
        'DashboardId': '54b5722c-bb68-49a9-8998-b411c5135eed',
        'IdentityType': 'QUICKSIGHT',
        'UserArn': 'arn:aws:quicksight:us-east-1:055146946590:user/default/055146946590'
    }, function(err, data) {
        if (err){
            throw err;
        } else { 
            console.log('Response: ');
            console.log(data);
            response.render("covid", {url:data.EmbedUrl});
        }
    })}
    else {
        response.render("login");
    }
});

app.get(`/irs`, async function(request, response) {
    //IRS Dashboard
    quicksight.getDashboardEmbedUrl({
        'AwsAccountId': '055146946590', 
        'DashboardId': '803121bd-2bb2-4d2c-9c70-57b5aeb8e2d7',
        'IdentityType': 'QUICKSIGHT',
        'UserArn': 'arn:aws:quicksight:us-east-1:055146946590:user/default/Kha'
    }, function(err, data) {
        if (err){
            throw err;
        } else { 
            console.log('Response: ');
            console.log(data);
            response.render("IRS", {ur:data.EmbedUrl});
        }
    })
});

// aws quicksight register-user --aws-account-id 055146946590 --identity-type QUICKSIGHT --email khaleabousseada@iclfdoud.com --namespace default --user-role READER --user-name Kha
// aws quicksight get-dashboard-embed-url  --aws-account-id 055146946590 --dashboard-id 54b5722c-bb68-49a9-8998-b411c5135eed --identity-type QUICKSIGHT --user-arn arn:aws:quicksight:us-east-1:055146946590:user/default/055146946590

//COVID
// arn:aws:quicksight:us-east-1:055146946590:dashboard/54b5722c-bb68-49a9-8998-b411c5135eed 
//IRS
// arn:aws:quicksight:us-east-1:055146946590:dashboard/803121bd-2bb2-4d2c-9c70-57b5aeb8e2d7
// listen for webhook events //
app.listen(process.env.PORT || 3370, () => console.log('webhook is listening'));
