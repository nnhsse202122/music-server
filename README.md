# Classroom-Music
The Classroom Music web server allows a teacher to play a playlist of songs as chosen by their students. It has four different views: the sign-in, classroom selection, teacher, and student views. Each one serves a different function in playing music in the classroom.  

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
