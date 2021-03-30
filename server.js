const express = require("express");
const app = express();
const passport = require("passport");
const FacebookStrategy = require("passport-facebook");
const GoogleStrategy = require("passport-google-oauth20");

const PORT = 5050;
const URL = "https://f16a28ccb138.ngrok.io";

const transformFacebookProfile = (profile, accessToken, refreshToken) => {
	return {
		id: profile._json.id,
		name: profile._json.name,
		accessToken: accessToken,
		refreshToken: refreshToken,
		// avatar: profile.picture.data.url,
	};
};

// Transform Google profile into user object
const transformGoogleProfile = (profile, accessToken, refreshToken) => ({
	id: profile.id,
	name: profile.displayName,
	accessToken: accessToken,
	refreshToken: refreshToken,
	// avatar: profile.image.url,
});

//FacebookStrategy
passport.use(
	new FacebookStrategy(
		{
			clientID: "301312761338026",
			clientSecret: "e133731c6f8a2eafcd510a2b6aec41c1",
			callbackURL: `${URL}/auth/facebook`,
			profileFields: ["id", "name", "displayName", "picture", "email"],
		},
		(accessToken, refreshToken, profile, done) => {
			done(null, transformFacebookProfile(profile, accessToken, refreshToken));
		},
	),
);

//Google Strategy
passport.use(
	new GoogleStrategy(
		{
			clientID:
				"161189127482-nqugr46ii3f25cshmrcpdv95pfa7okjv.apps.googleusercontent.com",
			clientSecret: "vmTiP9LGv355jZ9xYKEf9aR3",
			callbackURL: `${URL}/auth/google`,
		},
		async (accessToken, refreshToken, profile, done) => {
			done(null, transformGoogleProfile(profile, accessToken, refreshToken));
		},
	),
);

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Check route
app.get("/", (req, res) => {
	res.send("App is - working .. ");
});

//Get Route for Facebook Login
app.get("/login/facebook", passport.authenticate("facebook"));

//Call back url
app.get(
	"/auth/facebook",
	passport.authenticate("facebook", {failureRedirect: "/login/facebook"}),
	// Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
	(req, res) => {
		console.log("This is from FB " + req.user);
		return res.redirect(
			"msrm42app://msrm42app.io?id=" +
				req.user.id +
				"/name=" +
				req.user.name +
				"/accessToken=" +
				req.user.accessToken,
		);
	},
);
app.get("/login/google", passport.authenticate("google", {scope: ["profile"]}));

app.get(
	"/auth/goo gle",
	passport.authenticate("google", {failureRedirect: "/login/google"}),
	(req, res) => {
		console.log(req.user);
		// return res.redirect(
		// 	"/login?id=" +
		// 		req.user.id +
		// 		"/name=" +
		// 		req.user.name +
		// 		"/accessToken=" +
		// 		req.user.accessToken,
		// );
		res.redirect(
			"msrm42app://msrm42app.io?id=" +
				req.user.id +
				"/name=" +
				req.user.name +
				"/accessToken=" +
				req.user.accessToken,
		);
	},
);

app.listen(PORT, () => console.log(`Server is listening at  PORT ${PORT}`));
