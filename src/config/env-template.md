# NMS Frontend Environment Configuration Template
# Copy dan sesuaikan dengan environment yang diinginkan

# ========================================
# ENVIRONMENT MODE (Pilih salah satu)
# ========================================

# Development Mode - Localhost
# REACT_APP_ENVIRONMENT=DEVELOPMENT
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000

# Development Mode - IP Lokal (VM)
REACT_APP_ENVIRONMENT=DEVELOPMENT_IP
REACT_APP_API_URL=http://10.10.100.44:5000/api
REACT_APP_SOCKET_URL=http://10.10.100.44:5000

# Production Mode - Domain
# REACT_APP_ENVIRONMENT=PRODUCTION_DOMAIN
# REACT_APP_API_URL=https://nms.gugahnugraha.my.id/api
# REACT_APP_SOCKET_URL=https://nms.gugahnugraha.my.id

# Production Mode - IP Lokal (Nginx)
# REACT_APP_ENVIRONMENT=PRODUCTION_IP
# REACT_APP_API_URL=http://10.10.100.44:80/api
# REACT_APP_SOCKET_URL=http://10.10.100.44:80

# ========================================
# OPTIONAL CONFIGURATIONS
# ========================================

# Prometheus URL (jika menggunakan monitoring)
REACT_APP_PROMETHEUS_URL=http://10.10.100.44:9090

# Demo Mode
# REACT_APP_DEMO_MODE=false

# ========================================
# NOTES
# ========================================
# 1. Uncomment environment yang sesuai dengan kebutuhan
# 2. Jika REACT_APP_ENVIRONMENT tidak diset, sistem akan auto-detect
# 3. Auto-detection berdasarkan hostname:
#    - localhost:3000 → Development (localhost:5000)
#    - 10.10.100.44:3000 → Development IP (10.10.100.44:5000)
#    - 10.10.100.44:80 → Production IP (10.10.100.44:80)
#    - nms.gugahnugraha.my.id → Production Domain
# 4. Untuk development di VM, gunakan DEVELOPMENT_IP
# 5. Untuk production via Nginx, gunakan PRODUCTION_IP
# 6. Untuk production via domain, gunakan PRODUCTION_DOMAIN
