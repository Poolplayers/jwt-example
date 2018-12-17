var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
const port = 3005;
const map = `<style>body {margin: 0; padding:0; align-items: center;justify-content: center;display: flex; font-size: 20px;font-weight: 700;font-family: sans-serif;} iframe {position:fixed; top: 0; left: 0; z-index: -1}</style><iframe width="100%" height="100%" id="gmap_canvas" src="https://maps.google.com/maps?q=university%20of%20san%20francisco&t=&z=13&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>`;

// Environment Variables
const { JWTSECRET, APIKEY } = process.env;

// To serve static files such as images, CSS files

app.use(express.static('public'));

// Middleware used on each request where we will validate the JWT Token

app.use(function(req, res, next) {
  // JWT Token will be sent via HTTP Headers.
  const token = req.headers.authorization;
  try {
    // verify the validity of the token.
    const decoded = jwt.verify(token, JWTSECRET);
  } catch (err) {
    // If token is invalid... deny access
    res.send(
      '403 - Token is invalid.' +
        '<code style="display:block; margin: 30px 0;">err' +
        err +
        '<code>'
    );
  }

  next();
});

// Example of league map request

app.get('/league/:leagueid', (req, res) => {
  const token = req.headers.authorization;

  // decode data from token already verified by our middleware.
  const { LeagueId, IsLeagueOperator, IsNationalStaff } = jwt.decode(token);

  // get the requested LeagueID
  const requestedLeagueId = req.params.leagueid;

  // If League Operator check League ID

  if (IsLeagueOperator && LeagueId == requestedLeagueId) {
    res.send('LO Request! ... serving map for league: ' + req.params.leagueid + map);
  }

  // If national staff allow every league id
  if (IsNationalStaff) {
    res.send('National staff! ... serving map for league: ' + req.params.leagueid + map);
  }

  // everyone else not allowed
  res.send('403 - User not allowed');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
