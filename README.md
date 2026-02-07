# Manager - Attendance Portal

A centralized platform designed for efficient employee attendance tracking and management. This system simplifies administrative workflows through a unified dashboard interface.

## System Overview

This application serves as a complete solution for monitoring workforce activity. It features a responsive web interface connected to a high-performance backend, ensuring real-time data synchronization and reliability.

## Key Functionalities

*   **Central Dashboard**: Provides a snapshot of daily operations, including attendance statistics and recent system activities.
*   **Attendance Management**: Allows administrators to mark and verify daily employee attendance status efficiently.
*   **Employee Directory**: Maintains a digital record of all personnel, including contact details and roles.
*   **System Notifications**: Delivers alerts and updates regarding system events or required actions.

## Technology Architecture

The project is built using the following technologies:

*   **Frontend**: React (Vite), Tailwind CSS for styling
*   **Backend**: Python (FastAPI), MongoDB for data storage

## Setup and Execution Guide

Follow these steps to deploy the application locally.

### Prerequisites

Ensure you have the following installed on your machine:
*   Node.js and npm
*   Python 3.10 or higher
*   MongoDB

### 1. Repository Setup

Clone the project to your local machine:

```bash
git clone https://github.com/Vinay1727/Management-.git
cd Management-
```

### 2. Frontend Initialization

The user interface is located in the `frontend` directory.

```bash
cd frontend
npm install
npm run dev
```

The frontend application will launch at `http://localhost:5173`.

### 3. Backend Initialization

The API server is located in the `backend` directory.

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend API will start at `http://localhost:8000`.

---

**Contact**
Vinay Badnoriya - Lead Architect
