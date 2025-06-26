# NANA Project Repository Structure

This repository contains the complete backend and CMS codebases for the NANA Project. The structure is designed to keep the Node.js backend and the C#/.NET CMS completely separate, while allowing for easy management and collaboration within a single repository.

---

## Folder Structure

```
/NANA-Project/
│
├── Backend-/
│   └── ... (Node.js backend code: API, models, controllers, migrations, etc.)
│
├── CMS/
│   ├── CMS.sln                # Visual Studio solution file for the CMS
│   ├── CMS.Web/               # (optional) ASP.NET MVC/Core project for web-based CMS
│   ├── CMS.Desktop/           # (optional) WinForms or WPF project for desktop CMS
│   ├── CMS.Core/              # (optional) Shared logic, models, or libraries
│   └── README.md              # (optional) CMS-specific documentation
│
├── README.md                  # Main project documentation (this file)
└── .gitignore                 # Ignore rules for both Node.js and .NET
```

---

## Description

- **Backend-/**  
  Contains all Node.js backend code, including API endpoints, authentication, database models, migrations, and business logic.

- **CMS/**  
  Contains the C#/.NET CMS codebase. This can include:
  - `CMS.Web/`: An ASP.NET MVC/Core project for a web-based CMS interface.
  - `CMS.Desktop/`: A WinForms or WPF project for a desktop CMS application.
  - `CMS.Core/`: Shared logic or libraries used by both web and desktop CMS projects.
  - `CMS.sln`: The Visual Studio solution file for managing CMS projects.

- **README.md**  
  This file, providing an overview of the repository structure and purpose.

- **.gitignore**  
  Contains ignore rules for both Node.js (`node_modules/`, etc.) and .NET (`bin/`, `obj/`, etc.) projects.

---

## How to Use

- **Backend:**  
  Navigate to the `Backend-` folder and follow the setup instructions in its own README or documentation to run the Node.js backend.

- **CMS:**  
  Navigate to the `CMS` folder and open `CMS.sln` in Visual Studio to develop or run the CMS (web or desktop).

- **Database/API:**  
  Both the backend and CMS can connect to the same database or communicate via API, depending on your architecture.

---

## Contribution

Prince Ngwako Mashumu