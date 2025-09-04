# LUSS - Long URL Short in Second

LUSS is a full-stack URL shortener application built with the MERN stack (MongoDB, Express, React, Node.js). It allows users to sign up, log in, and create shortened URLs, which are then saved to their account. The application features a clean, modern interface with both light and dark modes.

## Features

- **User Authentication:** Secure user registration and login system using JWT (JSON Web Tokens) and password hashing (bcrypt).
- **URL Shortening:** Authenticated users can submit a long URL to generate a unique, short link.
- **URL Redirection:** The generated short links will redirect users to the original long URL.
- **User Dashboard:** A "My URLs" page where logged-in users can view a list of all the URLs they have shortened, along with the creation date.
- **Dark/Light Mode:** A theme toggle button to switch between a light and dark interface for better user experience.
- **Responsive Design:** The user interface is designed to be responsive and work on various screen sizes.

## Tech Stack

- **Frontend:**
  - **React:** A JavaScript library for building user interfaces.
  - **Vite:** A fast build tool and development server for modern web projects.
  - **React Router:** For handling client-side routing and navigation.
  - **CSS:** Custom CSS for styling, with no external UI libraries.

- **Backend:**
  - **Node.js:** A JavaScript runtime for the server.
  - **Express.js:** A minimal and flexible Node.js web application framework.
  - **MongoDB:** A NoSQL database for storing user and URL data.
  - **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.

- **Authentication:**
  - **bcryptjs:** For hashing user passwords before storing them in the database.
  - **jsonwebtoken:** For creating and verifying secure JSON Web Tokens for user sessions.
  - **dotenv:** For managing environment variables.

## Project Structure

The project is organized into two main directories:

```
/
├── client/         # Contains the React frontend application
└── server/         # Contains the Node.js/Express backend API
```

## Setup and Installation

To run this project locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance).

### 1. Backend Setup

First, navigate to the `server` directory and set up the backend.

```sh
cd server
```

**Install dependencies:**

```sh
npm install
```

**Create an environment file:**

Create a `.env` file in the `server` directory and add the following variables.

```
MONGODB_URI='your_mongodb_atlas_connection_string'
JWT_SECRET='your_super_secret_jwt_key'
```

- `MONGODB_URI`: Your connection string from MongoDB Atlas.
- `JWT_SECRET`: A long, random string used to secure tokens. You can generate one using the command:
  `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**Run the server:**

```sh
npm start
```

The backend server will start on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal, navigate to the `client` directory, and set up the frontend.

```sh
cd client
```

**Install dependencies:**

```sh
npm install
```

**Run the development server:**

```sh
npm run dev
```

The frontend development server will start on `http://localhost:5173` (or another port if 5173 is busy). You can now open this URL in your browser to use the application.
