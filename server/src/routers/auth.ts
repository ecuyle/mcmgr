import express = require('express');
import passport = require('passport');

const { Router } = express;
const authRouter: express.Router = Router();

authRouter.post('/login', passport.authenticate('local'), function(req, res) {
  console.log('success');
  res.send(req.user);
});

authRouter.get('/logout', function(req, res) {
  req.logout();
  res.send();
});

export default authRouter;
