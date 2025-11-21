# FrostKontrol

FrostKontrol is a real-time monitoring web application designed to display the live temperatures and battery alerts of devices. Using WebSockets for live temperature updates, this application allows users to stay informed about the status of their connected devices.

## Features
- **Real-time Temperature Monitoring**: Displays the live temperature of connected devices with real-time updates using WebSockets.
- **Battery Alerts**: Notifies users when the battery level of devices falls below a predefined threshold.
- **Device Management**: Allows monitoring of multiple devices and their respective data points, such as temperature and battery levels.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Real-time Communication**: WebSockets (via Socket.io)

## Installation

### Prerequisites
Ensure that you have the following installed on your local machine:
- [Node.js](https://nodejs.org/en/) (LTS version recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (or use a cloud MongoDB service like Atlas)

### Clone the Repository
```bash
git clone https://github.com/Muhammad-Umar-Waqar/frostkontrol.git
cd frostkontrol
