# Project name

perform-robot 

# Description

Perform-robot is a REST API which was designed with node js to be part of a set of separate bricks and micro services which communicate with each other as needed. This set of bricks and micro services constitute the architecture of an application named perform MMA. Perform-robot is use to update the mongodb database of the web application. This database contains a whole set of data used in the construction of the different pages of the web application.

Click on the following link for more details on Perform MMA web application =>
<a href="https://docs.google.com/presentation/d/e/2PACX-1vSzRUSTdUaM2xpnRheKOzhWK3UeApCFwF-Qn_Nl0KEetrUcBNHhpZ1nt6GdtnWPDutZzQquVGiIEMkr/pub?start=false&loop=false&delayms=3000">Perform MMA presentation</a> <br>

To test the perform MMA application click on the following link =>
<a href="https://perfmma.surge.sh/#/ngr-home">Perform MMA</a> <br>

The other bricks and micro services constituting the Perform MMA application:

* <a href="https://gitlab.com/perform_project/perform-front">perform-front</a>
* <a href="https://gitlab.com/perform_project/perform-back-nodejs">perform-back-nodejs</a>
* <a href="https://gitlab.com/perform_project/perform-back-spring">perform-back-spring</a>

# Installation

You need to install :
 
* <a href="https://www.oracle.com/fr/java/technologies/javase/jdk11-archive-downloads.html">Java 11</a>
* <a href="https://www.mongodb.com/try/download/community">Mongodb</a>
	
I haven't tested with other versions but the ones above worked for me

Clone the project and open it with your favorite text editor, I used eclipse.

# Local utilisation

Set the following environment variables to allow connection to the database and grant CORS permissions to your front interface : 

* LOCAL_BACK_NODE_ACCESS_URI => your node backend URI 
* LOCAL_BACK_NODE_ACCESS_PORT => your node backend port
* LOCAL_MONGODB_URI => your database URI
* LOCAL_MONGODB_USER => your database username
* LOCAL_MONGODB_PASSWORD => your database password
* LOCAL_MONGODB_DBNAME => database name

* MONGODB_AUTH_SOURCE => admin
* FRONT_URI => your frontend URI

Run the following commands : 

* node server.js

# Contact

Email : yannickkamdemkouam@yahoo.fr

# Project status

Developpement in progress
