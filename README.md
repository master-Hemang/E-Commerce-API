# E-Commerce-API

Make sure you have the required libraries installed (express, body-parser, jsonwebtoken, bcrypt, sequelize, pg).

Project Setup:
Initialize Node.js Project:

npm init -y

Install Dependencies:

npm install express body-parser jsonwebtoken bcrypt sequelize pg

Database Setup:

Install PostgreSQL and create a database.
Update the database connection details in the code.

Folder Structure:

Create folders for models, routes, middleware, and utils.


Create Models:

Define Sequelize models for Category, Product, User, Cart, and Order.
Create API Routes:

Define Express routes for each API endpoint (category listing, product listing, etc.).
User Authentication:

Implement JWT-based user authentication with registration and login routes.
Create middleware for authenticating protected routes.

Error Handling:

Implement error handling middleware to return meaningful error responses.
Testing:

Write unit tests for critical functions using a testing framework like Jest.
Start Server:

Run the server with node app.js or use a tool like nodemon for automatic restarts during development.
API Documentation:
Swagger/OpenAPI:

Generate API documentation using tools like Swagger/OpenAPI.
Document each endpoint, request parameters, response structures, and authentication requirements.
Postman Collection:

Create a Postman collection with sample requests for each API endpoint.
Include details on authentication, expected responses, and error scenarios.
Design Decisions:
JWT for Authentication:

Chose JSON Web Tokens (JWT) for user authentication due to its simplicity and statelessness.
Implemented a middleware to verify tokens for protected routes.
Sequelize ORM:

Used Sequelize as the ORM for PostgreSQL for database interactions.
Defined relationships between models for better data organization.
Error Handling:

Implemented a centralized error-handling middleware to handle errors consistently.
Provided meaningful error messages and status codes in responses.
Middleware for Authentication:

Implemented a middleware function (authenticateUser) to ensure that only authenticated users can access certain endpoints.
Applied this middleware to routes that require authentication, such as cart management and order placement.

Code Organization:

Organized code into separate files for better maintainability.
Kept models, routes, middleware, and utils in separate folders.

Database Migration:

Considered implementing database migration scripts for versioning and easy deployment of database schema changes.

RESTful Principles:

Followed RESTful principles for API design, including meaningful endpoint names and proper HTTP methods.

Scalability:

Designed the API to handle scalability by using asynchronous patterns and a scalable database system.
