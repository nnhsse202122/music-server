# Classroom-Music Overview
The Classroom Music web server allows a teacher to play a playlist of songs as chosen by their students. It has four different views: the sign-in, classroom selection, teacher, and student views. Each one serves a different function in playing music in the classroom. There are also other features that allow for more song interactions. Tokens can be used to reward students by allowing them to submit songs or let their song play next. Thumbs-ups will move a song up one position. 

## How it works:
The Music Server is built with TypeScript, EJS, MongoDB, and Express to provide both teachers and students with a seamless music-sharing experience.
The API powers a majority of the experience, built with the framework of REST, which calls for endpoints that represent entities. These entities request methods for modifying those entities. 

## Usage:
If you're simply interested in using or visiting the website, then you can visit https://musicserver.nnhsse.org/ The website will work on any modern web browser (Chrome/Firefox/Microsoft Edge) and should work on all major operating systems (Windows/MacOS/Linux). 

## Development
If you want to run the server on your computer locally, here are the steps. Note: this has been tested on Mac OS X+ and Windows 10, but it should work on most operating systems.
### Installation:
1. Pull the code from Github.
2. Install node.js and npm. You can download it here: https://www.npmjs.com/get-npm.
3. In the VScode terminal, enter the command `npm install`. This will install all the packages you need.
4. Create a .env file in the root directory with the following key/value pairs:
```
API_KEY = # YOUTUBE API KEY
PRODUCTION = false # whether or not to use production or dev settings
#PRODUCTION
PRODUCTION_CLIENT_ID = # PRODUCTION GOOGLE OAUTH CLIENT ID
PRODUCTION_OAUTH_CLIENT_SECRET = # PRODUCTION GOOGLE OAUTH CLIENT SECRET
PRODUCTION_API_DOMAIN = # PRODUCTION API DOMAIN NAME
PRODUCTION_MONGO_URI = # PRODUCTION MONGO DATABASE URI
PRODUCTION_REDIRECT_URI = # PRODUCTION OAUTH REDIRECT URI. SHOULD BE IN FORMAT protocol://domain/account/auth. For example: http://127.0.0.1:3030/account/auth
#DEV
DEV_CLIENT_ID = # DEV GOOGLE OAUTH CLIENT ID
DEV_OAUTH_CLIENT_SECRET = # DEV GOOGLE OAUTH CLIENT SECRET
DEV_API_DOMAIN = # DEV API DOMAIN NAME
DEV_MONGO_URI = # DEV MONGO DATABASE URI
DEV_REDIRECT_URI = # DEV OAUTH REDIRECT URI. SHOULD BE IN FORMAT protocol://domain/account/auth. For example: http://127.0.0.1:3030/account/auth
```

#### Initial Setup
The Music Server relies on 3 different APIs: Google Auth, MongoDB, and Youtube.

Furthermore, development is split into `Development` and `Production`
- Development is where you live develop code.
- Production is where final builds are run.

The purpose of this split is to allow for local development that won't affect the main app.

First, there's the Youtube API key to be filled in `API_KEY`. First, go to the [google console dashboard](https://console.cloud.google.com/home/dashboard) and create a new project.

Next, go to the APIs overview, and select the project in the dropdown menu at the top left if needed.

Then, go to the library tab, and search for the Youtube data api v3, and enable it, then click create credentials when the screen shows up.

You will now be at a google form-like page. Select `Public Data` and click next. You will be given an API key that you should copy and paste into the env file's `API_KEY` property.

Next, you will need to create google auth credentials. Go to `OAuth Consent Screen`, then then fill out the user form. Click `External`, then click `Create`

Then fill out the form to create an oauth consent screen.

Go back to the crentials tab, and create a crential of oauth client id. Fill out information, and copy the resulting clientID and clientSecret fields.
These should be filled out in your `DEV_CLIENT_ID` and `DEV_OAUTH_CLIENT_SECRET` fields.

Then ask Mr. Scmitt to setup mongo db, and then your env file will almost be ready

Make sure you share this env file in a secure way and not on this github repo!

### Production Server Deployment
1. Create a new EC2 instance used on Ubuntu.
2. Open ports for HTTP and HTTPS when walking through the EC2 wizard.
3. Generate a key pair for this EC2 instance. Download and save the private key, which is needed to connect to the instance in the future.
4. After the EC2 instance is running, click on the Connect button the EC2 Management Console for instructions on how to ssh into the instance.
5. On the EC2 instance, [install](https://github.com/nodesource/distributions/blob/master/README.md) Node.js v17

```
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

6. On the EC2 instance, install nginx: `sudo apt-get -y install nginx`
7. Create a reverse proxy for the Intelligent Grouping App node server. In the file /etc/nginx/sites-enabled/musicServer:

```
server {
	# listen on port 80 (http)
	listen 80;
	server_name musicserver.nnhsse.org;

	# write access and error logs to /var/log
	access_log /var/log/musicserver_access.log;
	error_log /var/log/musicserver_error.log;

	location / {
		# forward application requests to the node server
		proxy_pass http://localhost:3030;
		proxy_redirect off;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	}
}
```

8. Restart the nginx server: `sudo service nginx reload`
9. Install and configure [certbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx)
10. Clone this repository from GitHub.
11. Inside of the directory for this repository install the node dependencies: `npm install`
12. Update Google Cloud Platform is allow connections from new domain (busapp.nnhsse.org)
13. Install Production Manager 2, which is used to keep the node server running:

```
sudo npm install pm2 -g
sudo pm2 --name musicserver start "npm run build"
sudo pm2 restart musicserver --watch
```

14. Verify that the node server is running: `sudo pm2 list`
15. Configure pm2 to automatically run when the EC2 instance restarts: `sudo pm2 startup`
16. Add a crontab entry to pull from GitHub every 15 minutes: `crontab -e`

```
*/15 * * * * cd /home/ubuntu/music-server && git pull
```

17. Restart the node server: `sudo pm2 restart index`

### Running the Program:
1. First, you will need to build the program. To do this, you will need to run the command `npm run build`, which will compile the typescript files into javascript files.
2. In the VScode terminal, run the `index.js` file (by using the command `node index.js`).
3. Open your favorite browser and go to the url `localhost:3030`. This will pull up a local version of the website.
4. To stop running the server, press ctrl+C (not command+C if you’re on mac!).

## Sign-In
The sign-in is simple -- its singular purpose is to guide students and teachers to their respective views. The signout button will be in the top right after you sign-in.

## Teacher Classes selection 
In class slection, Teachers can create as many classrooms as they'd like with their desired functionality with the plus sign button. Those including: Class Name, Ability to submit songs, Ability for students to join, Ability for Student to see playlists, and Lock Submissions to Tokens.  

## Student Classes selection 
Student's can join multiple classes and add songs. Class name, code, submissions ability and tokens will be displayed. Clicking on Songs will take them to Student View 

## Student View
The student view is just a simple search bar, where students can enter their favorite song in and the website will return the top 3 results found on YouTube. After searching for a song and locating it, the student is told to verify that the song is clean.

## Teacher View
The teacher view has the most detail. Teachers have full control over their playlist, students and classroom controls. 

### Playlist Controls
The teacher can play the songs in the playlist in their given order, skip them if they find them to be inappropriate or too long, change the volume, and remove a currently playing song. Clicking on the details button will reveal which student submitted it.

In the situation that the teacher needs to erase the playlist,they can click the clear playlist button, which will reset the playlist entirely. And in case the teacher wants to mix it up, they have a shuffle feature, which plays the songs in the playlist in a random order, but keeps them in the order they're in right now. Finally, a teacher can enable or disable the submission of songs to their playlist.

### Classroom Controls
Teachers can have as many playlists/classlists as they'd like, each classroom having its own code. Classrooms can be renamed, the ability for songs to be submitted to the playlist, and the ability for students to join a class can be toggled. The student tab provides the student name, the ability to add tokens (in development), remove a specific student, and remove all students. The whole classroom can also be deleted in the delete tab. 

# Future Updates 
For future teams working on this project, there is a list of features and enhancements to add to the webapp on our github issues page: https://github.com/nnhsse202021/Classroom-Music/issues
