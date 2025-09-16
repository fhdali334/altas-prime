# Atlas Prime - AI Chat Platform

Atlas Prime is a comprehensive AI-powered chat platform that provides intelligent conversational agents with advanced analytics, monitoring, and administrative capabilities.

## 🚀 Features

### Core Platform
- **Multi-Agent Chat System**: Interact with specialized AI agents for different tasks
- **File Processing**: Upload and process various file types within conversations
- **Real-time Messaging**: Instant responses with typing indicators and message status
- **User Authentication**: Secure login/registration with email verification

### Analytics & Monitoring (Phase 2)
- **Personal Usage Analytics**: Track your token usage, costs, and conversation metrics
- **Real-time Usage Monitoring**: Live updates on token consumption and costs during chats
- **Chat-Specific Analytics**: Detailed breakdown of individual conversation performance
- **Usage Visualization**: Interactive charts and graphs for usage patterns
- **Budget Tracking**: Monitor spending and receive alerts for usage limits

### Administrative Features
- **User Management**: Complete admin panel for managing users and their access
- **System Monitoring**: Real-time system statistics and performance metrics
- **Role-Based Access Control**: Separate admin and user interfaces with appropriate permissions
- **Usage Oversight**: System-wide analytics and user activity monitoring
- **Data Export**: Export analytics and usage data for reporting

### Enhanced User Experience
- **Dashboard Overview**: Personalized dashboard with usage summaries and recent activity
- **Download Links**: Automatic detection and formatting of downloadable content
- **Clean Message Formatting**: Intelligent removal of markdown formatting for better readability
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Authentication**: JWT-based authentication system
- **API Integration**: RESTful API with comprehensive analytics endpoints
- **Charts**: Recharts for data visualization
- **File Handling**: Support for multiple file formats and processing

## 📊 Analytics Features

### For Users
- **Personal Usage Dashboard**: View your token consumption, costs, and usage patterns
- **Chat Analytics**: Detailed metrics for each conversation including:
  - Token breakdown (input/output/file processing)
  - Cost analysis and efficiency metrics
  - Performance metrics (response times, processing speed)
  - Usage progression over time

### For Administrators
- **System Overview**: Complete platform statistics and health monitoring
- **User Management**: 
  - View all users with usage statistics
  - Detailed user profiles and activity
  - User role management and permissions
- **Platform Analytics**:
  - System-wide usage trends
  - Cost analysis across all users
  - Performance monitoring and optimization insights

## 🔐 Security & Roles

### User Roles
- **User**: Access to personal chats, analytics, and standard features
- **Admin**: Full system access including user management and system analytics

### Security Features
- JWT-based authentication
- Role-based access control
- Secure API endpoints with proper authorization
- Data privacy and user isolation

## 📈 Usage Monitoring

### Real-time Features
- Live token usage tracking during conversations
- Cost monitoring with automatic updates
- Warning system for approaching usage limits
- Performance metrics and response time tracking

### Analytics Dashboard
- Daily, weekly, and monthly usage breakdowns
- Agent-specific usage statistics
- Cost efficiency analysis
- Historical trend analysis

## 🎯 Getting Started

### For Users
1. **Register/Login**: Create your account or sign in
2. **Choose an Agent**: Select from available AI agents based on your needs
3. **Start Chatting**: Begin conversations with intelligent responses
4. **Monitor Usage**: Track your token usage and costs in real-time
5. **View Analytics**: Access detailed analytics from your dashboard

### For Administrators
1. **Admin Access**: Login with admin credentials
2. **User Management**: Monitor and manage user accounts
3. **System Monitoring**: View platform-wide statistics and performance
4. **Analytics Review**: Access comprehensive system analytics and reports

## 📱 User Interface

### Chat Interface
- Clean, intuitive messaging interface
- Real-time usage indicators
- File upload and processing capabilities
- Download link detection and formatting
- Typing indicators and message status

### Analytics Dashboard
- Interactive charts and visualizations
- Usage summaries and trends
- Cost tracking and budget monitoring
- Performance metrics and insights

### Admin Panel
- User management interface
- System statistics dashboard
- Platform monitoring tools
- Data export capabilities

## 🔧 API Integration

Atlas Prime provides comprehensive REST APIs for:
- User authentication and management
- Chat functionality and message handling
- Analytics and usage tracking
- Administrative operations
- Real-time monitoring and updates

## 📞 Support

For technical support or questions about Atlas Prime, please contact our support team or refer to the documentation for detailed API specifications and integration guides.

---

**Atlas Prime Phase 2** - Enhanced with comprehensive analytics, monitoring, and administrative capabilities for a complete AI chat platform experience.

📦 Installation & Setup

Follow these steps to run Atlas Prime locally after cloning from GitHub.

1. Clone the Repository
git clone https://github.com/your-username/atlas-prime.git
cd atlas-prime

2. Install Dependencies

Make sure you have Node.js (>=18) and npm/yarn/pnpm installed.

Using npm:

npm install


Using yarn:

yarn install

3. Configure Environment Variables

Create a .env.local file in the root directory with the following variables (example):

# App
NEXT_PUBLIC_APP_NAME=Atlas Prime
NEXT_PUBLIC_API_URL=http://localhost:5000

# Authentication
JWT_SECRET=your_jwt_secret_key

# Database (if required)
DATABASE_URL=postgresql://user:password@localhost:5432/atlasprime

# Optional: Monitoring / Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true


⚠️ Make sure to replace values with your actual credentials (database, JWT secret, API endpoint, etc.).

4. Run the Development Server
npm run dev


Now open http://localhost:3000
 in your browser.

5. Build for Production
npm run build
npm start

6. Lint & Format Code (optional)
npm run lint