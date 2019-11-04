# Ars-Technica-Scraper

## Description

This application is a web scraper that grabs articles from Ars Technica and allows users to comment on and save articles for future reference. It uses Node.js, express, Mongoose, Cheerio, Axios, Morgan, and Moment.

## How To Use
1. Download the github repository to your computer. 
2. Navigate to the project directory in the command line and run npm install to install the necessary node modules.
3. Ensure that MongoDB is installed for saving information to database.
4. Initialize the server by calling 'node server.js' in the terminal while in the root directory.
6. Finally navigate to http://localhost:3000/ to see the working application.

## Technologies Used
* Node.js - Used for core application
* MongoDB/Mongoose - Used to store database information
* Express - Used to create server and handle get/post request from the client
* Heroku - Used to deploy application to web
* Morgan - Http request middleware logger
* Axios - Used for grabbing HTML body when scraping Ars Technica
* Cheerio - Used for scraping HTML data returned from Axios
* Bootstrap - Used for front end styling

## Deployed Heroku App
* [Ars Technica Scraper](https://grim-demon-32275.herokuapp.com/)

## Creator
Jeff Swanner