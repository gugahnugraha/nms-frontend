# Network Monitoring System (NMS) - Frontend

A comprehensive network monitoring solution with real-time monitoring, device management, alerts, reports, and network topology visualization.

![NMS Dashboard](https://via.placeholder.com/800x450?text=NMS+Dashboard)

## Features

- **Real-time Network Monitoring**: Monitor devices, interfaces, and services in real-time
- **Device Management**: Add, edit, and configure network devices
- **Interactive Network Topology**: Visual representation of network connections and relationships
- **Customizable Dashboards**: Build dashboards with widgets to visualize network metrics
- **Comprehensive Alerting**: Receive notifications for critical events and thresholds
- **Detailed Reporting**: Generate reports on various metrics including device status, performance, and availability
- **Historical Data Analysis**: Analyze historical performance data with customizable charts
- **Multi-language Support**: English and Indonesian language support

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Directory Structure](#directory-structure)
- [Backend Integration](#backend-integration)
- [API Endpoints](#api-endpoints)
- [Monitoring Stack Integration](#monitoring-stack-integration)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- Backend API server running
- Prometheus and SNMP Exporter (for monitoring components)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gugahnugraha/nms6.git
   cd nms6/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file and set your API endpoint:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

5. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_PROMETHEUS_URL` | Prometheus URL | http://localhost:9090 |
| `REACT_APP_VERSION` | Application version | 1.0.0 |

## Directory Structure

```
frontend/
├── public/               # Static files
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── details/      # Device details components
│   │   ├── devices/      # Device management components
│   │   ├── layout/       # Layout components (header, sidebar)
│   │   ├── monitoring/   # Monitoring components
│   │   └── ui/           # Generic UI components
│   ├── config/           # Configuration files
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layouts
│   ├── locales/          # Internationalization files
│   ├── pages/            # Page components
│   ├── redux/            # Redux store, actions, reducers
│   │   ├── actions/      # Redux actions
│   │   ├── reducers/     # Redux reducers
│   │   └── slices/       # Redux Toolkit slices
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

### Key Directories

- **hooks/**: Custom React hooks for shared functionality

## Backend Integration

The frontend communicates with the backend through RESTful API calls and WebSocket connections. The integration is configured in `src/config/api.js` and implemented in the services directory.

### Setting Up Backend Connection

1. Ensure the backend server is running
2. Update the `.env` file with the correct backend API URL
3. The frontend will automatically connect to the backend using the provided URL

### Authentication Flow

1. The frontend authenticates with the backend using JWT tokens
2. Login credentials are sent to `/api/auth/login`
3. The received token is stored in localStorage
4. The token is included in the Authorization header for all subsequent API requests
5. WebSocket connections are authenticated using the same token

### WebSocket Integration

Real-time updates are handled through WebSocket connections:

```javascript
// Example from src/services/socketService.js
import io from 'socket.io-client';
import { API_URL } from '../config/constants';

export const connectSocket = (token) => {
  const socket = io(API_URL, {
    auth: {
      token
    }
  });
  
  return socket;
};
```

## API Endpoints

The frontend interacts with the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Devices
- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get device details
- `POST /api/devices` - Create new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `POST /api/devices/:id/ping` - Ping a device

### Monitoring
- `GET /api/devices/:id/interfaces` - Get device interfaces
- `GET /api/devices/:id/performance` - Get device performance metrics
- `GET /api/devices/:id/history` - Get historical data for a device

### Alerts
- `GET /api/alerts` - List all alerts
- `GET /api/alerts/:id` - Get alert details
- `PUT /api/alerts/:id` - Update alert status
- `POST /api/alerts` - Create new alert
- `DELETE /api/alerts/:id` - Delete alert

### Reports
- `GET /api/reports` - List available reports
- `POST /api/reports/generate` - Generate a report
- `GET /api/reports/download/:id` - Download a report

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send a message

## Monitoring Stack Integration

The NMS frontend integrates with Prometheus and SNMP Exporter for monitoring network devices.

### Prometheus Integration

Prometheus is used to collect and store metrics from network devices. The frontend connects to Prometheus to retrieve these metrics for visualization.

#### Configuration

1. Ensure Prometheus is running (typically on port 9090)
2. Update the `.env` file with the Prometheus URL
3. The frontend will use this URL to query metrics

Example Prometheus query in the frontend:

```javascript
// Example from src/hooks/usePerformanceData.js
import axios from 'axios';
import { PROMETHEUS_URL } from '../config/constants';

export const fetchMetric = async (query) => {
  const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
    params: { query }
  });
  
  return response.data.data.result;
};
```

### SNMP Exporter Integration

SNMP Exporter collects SNMP data from network devices and exposes it to Prometheus. The frontend uses this data for device monitoring.

#### Configuration

1. Configure the SNMP Exporter in the `monitoring/snmp.yml` file
2. Ensure the SNMP Exporter is running
3. Configure Prometheus to scrape metrics from the SNMP Exporter

Example SNMP Exporter configuration:

```yaml
# monitoring/snmp.yml
modules:
  router:
    walk:
      - 1.3.6.1.2.1.1.1
      - 1.3.6.1.2.1.2.2
      - 1.3.6.1.2.1.31.1.1
    version: 2
    auth:
      community: public
  server:
    walk:
      - 1.3.6.1.2.1.25.1
      - 1.3.6.1.2.1.25.2
    version: 2
    auth:
      community: public
```

### Setting up Prometheus and SNMP Exporter

1. Navigate to the monitoring directory:
   ```bash
   cd ../monitoring
   ```

2. Start Prometheus and SNMP Exporter using Docker:
   ```bash
   docker-compose up -d
   ```

3. Verify the services are running:
   ```bash
   docker-compose ps
   ```

4. Access the Prometheus UI at `http://localhost:9090`

### Prometheus Configuration for Frontend Integration

Edit the `monitoring/prometheus.yml` file to include targets for your network devices:

```yaml
scrape_configs:
  - job_name: 'snmp'
    scrape_interval: 30s
    file_sd_configs:
      - files:
        - 'snmp-targets.yml'
    metrics_path: /snmp
    params:
      module: [router]
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: 'snmp_exporter:9116'
```

## Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App
- `npm run lint` - Runs ESLint to check for code issues
- `npm run format` - Formats code using Prettier

## Deployment

### Building for Production

```bash
npm run build
```

This creates a `build` directory with production-ready assets.

### Deployment Options

1. **Static Hosting**: Deploy the `build` directory to any static hosting service
2. **Docker**: Use the provided Dockerfile to create a containerized version
3. **Nginx**: Configure Nginx to serve the static files and proxy API requests

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name nms.example.com;
    root /var/www/html/nms/frontend/build;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Build for Production

```
npm run build
```
