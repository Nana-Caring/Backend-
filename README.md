# NANA Project Backend

This is the backend for the NANA Project, providing APIs and CMS functionality for the platform.

## Features

- User authentication (Admin, Funder, Caregiver, Dependent)
- Role-based access control
- CMS for managing platform content
- Secure login for different user roles
- Responsive admin dashboard

## Technologies

- ASP.NET Core (CMS)
- Node.js (API)
- SQL Server / PostgreSQL (Database)
- Entity Framework / Sequelize (ORM)
- JWT Authentication

## Getting Started

### Prerequisites

- .NET 6 SDK
- Node.js
- SQL Server or PostgreSQL

### Setup

1. **Clone the repository**  
   Download or clone this repository to your local machine.

2. **Configure environment variables**  
   - For Node.js API: create a `.env` file in the root directory and set your database and JWT secrets.
   - For ASP.NET Core: update `appsettings.json` or use environment variables for connection strings and secrets.

3. **Install dependencies**  
   - For Node.js API: install npm packages in the API directory.
   - For ASP.NET Core CMS: restore NuGet packages in the CMS directory.

4. **Run database migrations**  
   - For Node.js API: run Sequelize migrations for your environment.
   - For ASP.NET Core: update the database using EF Core.

5. **Start the servers**  
   - Start the Node.js API server.
   - Start the ASP.NET Core CMS server.

## Usage

- Access the CMS at `http://localhost:5000` (or your configured port).
- Use the API at `http://localhost:3000/api` (or your configured port).
- Login as Admin, Funder, Caregiver, or Dependent using the appropriate credentials.

## Folder Structure

```
Backend-/
│
├── API/                # Node.js API source code
├── CMS/                # ASP.NET Core CMS source code
├── database/           # Database scripts and migrations
├── README.md
└── ...
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

