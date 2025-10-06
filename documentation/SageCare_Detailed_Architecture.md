# SageCare 2.0 - Detailed Architecture Diagram

## 🏗️ Detailed System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        C1[🌐 Web Browser<br/>Chrome/Firefox/Safari]
        C2[📱 Mobile App<br/>React Native/PWA]
        C3[💻 Desktop App<br/>Electron]
    end
    
    subgraph "Frontend Services"
        F1[⚛️ React 18<br/>Functional Components]
        F2[🎨 Material-UI v5<br/>Design System]
        F3[📱 Responsive Design<br/>Mobile-First]
        F4[🔄 State Management<br/>React Query + Context]
        F5[🧭 Routing<br/>React Router v6]
        F6[📊 Charts<br/>Chart.js/Recharts]
    end
    
    subgraph "API Gateway"
        G1[🌐 Nginx<br/>Reverse Proxy]
        G2[🛡️ Rate Limiting<br/>100 req/min]
        G3[🔐 SSL Termination<br/>TLS 1.3]
        G4[📊 Load Balancing<br/>Round Robin]
    end
    
    subgraph "Backend Services"
        B1[🔌 Express.js<br/>REST API Server]
        B2[🔐 JWT Authentication<br/>jsonwebtoken]
        B3[📧 Email Service<br/>Nodemailer + SMTP]
        B4[📁 File Upload<br/>Multer + Cloud Storage]
        B5[🔍 Input Validation<br/>Joi/Yup]
        B6[📝 Logging<br/>Winston + Morgan]
    end
    
    subgraph "Database Layer"
        D1[🗄️ MongoDB Atlas<br/>Cloud Database]
        D2[📊 Mongoose ODM<br/>Schema Management]
        D3[💾 Redis Cache<br/>Session Storage]
        D4[📁 AWS S3<br/>File Storage]
    end
    
    subgraph "Video Consultation"
        V1[📹 WebRTC<br/>Peer-to-Peer]
        V2[🎤 MediaStream API<br/>Audio/Video Capture]
        V3[📡 Socket.io<br/>Signaling Server]
        V4[🎬 Media Server<br/>TURN/STUN]
    end
    
    subgraph "AI/ML Services"
        A1[🤖 OpenAI GPT-4<br/>Medical Assistant]
        A2[🍎 TensorFlow.js<br/>Food Recognition]
        A3[🎤 OpenAI Whisper<br/>Speech-to-Text]
        A4[🔍 Medical NLP<br/>Symptom Analysis]
        A5[📊 Health Analytics<br/>ML Insights]
    end
    
    subgraph "External APIs"
        E1[📧 Email Provider<br/>SendGrid/AWS SES]
        E2[💳 Payment Gateway<br/>Stripe/PayPal]
        E3[📱 Push Notifications<br/>Firebase FCM]
        E4[🗺️ Maps API<br/>Google Maps]
    end
    
    C1 --> G1
    C2 --> G1
    C3 --> G1
    
    G1 --> G2
    G2 --> G3
    G3 --> G4
    
    G4 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> B6
    
    B1 --> D1
    B1 --> D2
    B1 --> D3
    B1 --> D4
    
    B1 --> V1
    V1 --> V2
    V2 --> V3
    V3 --> V4
    
    B1 --> A1
    B1 --> A2
    B1 --> A3
    B1 --> A4
    B1 --> A5
    
    B1 --> E1
    B1 --> E2
    B1 --> E3
    B1 --> E4
    
    V2 -.->|Real-time Audio| A3
    A1 -.->|Health Chat| F1
    A2 -.->|Nutrition Analysis| F1
    A3 -.->|Live Transcription| V1
    A4 -.->|Symptom Assessment| F1
    A5 -.->|Health Insights| F1
    
    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef frontend fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef gateway fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef backend fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef database fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef video fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    classDef ai fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef external fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    
    class C1,C2,C3 client
    class F1,F2,F3,F4,F5,F6 frontend
    class G1,G2,G3,G4 gateway
    class B1,B2,B3,B4,B5,B6 backend
    class D1,D2,D3,D4 database
    class V1,V2,V3,V4 video
    class A1,A2,A3,A4,A5 ai
    class E1,E2,E3,E4 external
```

## 🔄 Detailed Data Flow

```mermaid
graph TD
    subgraph "User Authentication Flow"
        U1[👤 User Login] --> U2[📧 Email/Password]
        U2 --> U3[🔐 JWT Token Generation]
        U3 --> U4[💾 Token Storage]
        U4 --> U5[🔑 API Requests]
    end
    
    subgraph "Appointment Booking Flow"
        A1[📋 Book Appointment] --> A2[👨‍⚕️ Doctor Selection]
        A2 --> A3[📅 Time Slot Selection]
        A3 --> A4[💳 Payment Processing]
        A4 --> A5[📧 Confirmation Email]
        A5 --> A6[📱 Push Notification]
    end
    
    subgraph "Video Consultation Flow"
        V1[🎥 Join Call] --> V2[🔍 Device Check]
        V2 --> V3[📡 WebRTC Connection]
        V3 --> V4[🎤 Audio/Video Stream]
        V4 --> V5[🎤 Real-time Transcription]
        V5 --> V6[📝 Consultation Notes]
    end
    
    subgraph "Food Analysis Flow"
        F1[📸 Upload Food Photo] --> F2[🖼️ Image Processing]
        F2 --> F3[🤖 AI Analysis]
        F3 --> F4[📊 Nutrition Data]
        F4 --> F5[💡 Health Recommendations]
        F5 --> F6[📈 Health Tracking]
    end
    
    subgraph "AI Medical Assistant Flow"
        M1[💬 Start Chat] --> M2[🤖 LLM Processing]
        M2 --> M3[🔍 Symptom Analysis]
        M3 --> M4[📋 Health Assessment]
        M4 --> M5[💡 Personalized Advice]
        M5 --> M6[📊 Health Insights]
    end
    
    U5 --> A1
    U5 --> V1
    U5 --> F1
    U5 --> M1
    
    A6 --> V1
    V6 --> M2
    F6 --> M2
    M6 --> A1
```

## 🛡️ Security Implementation Details

```mermaid
graph TD
    subgraph "Transport Security"
        T1[🔐 HTTPS/TLS 1.3<br/>AES-256 Encryption]
        T2[🛡️ HSTS Headers<br/>Strict Transport Security]
        T3[🔒 CSP Headers<br/>Content Security Policy]
    end
    
    subgraph "Authentication Security"
        A1[🔑 JWT Tokens<br/>RS256 Algorithm]
        A2[⏰ Token Expiration<br/>15min Access, 7d Refresh]
        A3[🔄 Refresh Token Rotation<br/>Security Enhancement]
        A4[🚫 Token Blacklisting<br/>Logout Security]
    end
    
    subgraph "Data Security"
        D1[🔐 Database Encryption<br/>AES-256 at Rest]
        D2[🛡️ HIPAA Compliance<br/>Healthcare Data Protection]
        D3[🔒 Field-Level Encryption<br/>Sensitive Data]
        D4[📊 Audit Logging<br/>Access Tracking]
    end
    
    subgraph "Application Security"
        S1[🛡️ Input Validation<br/>XSS Prevention]
        S2[🚫 SQL Injection Protection<br/>Parameterized Queries]
        S3[🔒 CORS Policy<br/>Cross-Origin Control]
        S4[📊 Rate Limiting<br/>DDoS Protection]
    end
    
    T1 --> A1
    T2 --> A2
    T3 --> A3
    
    A1 --> D1
    A2 --> D2
    A3 --> D3
    A4 --> D4
    
    D1 --> S1
    D2 --> S2
    D3 --> S3
    D4 --> S4
```

## 📊 Database Schema Design

```mermaid
graph TD
    subgraph "User Management"
        U1[👤 Users Collection<br/>_id, email, password, profile]
        U2[🔐 Sessions Collection<br/>_id, userId, token, expires]
        U3[📊 User Health Profile<br/>_id, userId, conditions, allergies]
    end
    
    subgraph "Appointment System"
        A1[📅 Appointments Collection<br/>_id, patientId, doctorId, date, status]
        A2[👨‍⚕️ Doctors Collection<br/>_id, name, specialty, availability]
        A3[🏥 Clinics Collection<br/>_id, name, location, services]
    end
    
    subgraph "Health Data"
        H1[🍎 Nutrition Entries<br/>_id, userId, food, calories, date]
        H2[📊 Health Metrics<br/>_id, userId, weight, bloodPressure, date]
        H3[💊 Medications<br/>_id, userId, name, dosage, schedule]
    end
    
    subgraph "AI/ML Data"
        M1[🤖 Chat History<br/>_id, userId, messages, timestamp]
        M2[🔍 Symptom Records<br/>_id, userId, symptoms, assessment]
        M3[📈 Health Insights<br/>_id, userId, insights, recommendations]
    end
    
    subgraph "Video Consultation"
        V1[🎥 Consultation Records<br/>_id, appointmentId, duration, notes]
        V2[🎤 Transcription Data<br/>_id, consultationId, text, timestamp]
        V3[📝 Medical Notes<br/>_id, consultationId, notes, prescriptions]
    end
    
    U1 --> A1
    U1 --> H1
    U1 --> M1
    A1 --> V1
    V1 --> V2
    V1 --> V3
    A1 --> A2
    A2 --> A3
```

## 🔧 API Endpoints Architecture

```mermaid
graph LR
    subgraph "Authentication APIs"
        A1[POST /api/auth/register<br/>User Registration]
        A2[POST /api/auth/login<br/>User Login]
        A3[POST /api/auth/logout<br/>User Logout]
        A4[POST /api/auth/refresh<br/>Token Refresh]
    end
    
    subgraph "User Management APIs"
        U1[GET /api/users/profile<br/>Get User Profile]
        U2[PUT /api/users/profile<br/>Update Profile]
        U3[GET /api/users/health<br/>Get Health Data]
        U4[POST /api/users/health<br/>Update Health Data]
    end
    
    subgraph "Appointment APIs"
        P1[GET /api/appointments<br/>List Appointments]
        P2[POST /api/appointments<br/>Create Appointment]
        P3[PUT /api/appointments/:id<br/>Update Appointment]
        P4[DELETE /api/appointments/:id<br/>Cancel Appointment]
    end
    
    subgraph "Video Consultation APIs"
        V1[POST /api/consultations/join<br/>Join Consultation]
        V2[GET /api/consultations/:id<br/>Get Consultation]
        V3[POST /api/consultations/transcribe<br/>Save Transcription]
        V4[POST /api/consultations/notes<br/>Save Notes]
    end
    
    subgraph "AI/ML APIs"
        M1[POST /api/ai/chat<br/>AI Medical Assistant]
        M2[POST /api/ai/food-analysis<br/>Food Recognition]
        M3[POST /api/ai/symptom-check<br/>Symptom Analysis]
        M4[GET /api/ai/insights<br/>Health Insights]
    end
    
    subgraph "Nutrition APIs"
        N1[POST /api/nutrition/analyze<br/>Food Analysis]
        N2[GET /api/nutrition/history<br/>Nutrition History]
        N3[POST /api/nutrition/track<br/>Track Nutrition]
        N4[GET /api/nutrition/recommendations<br/>Get Recommendations]
    end
    
    A1 --> U1
    A2 --> U1
    U1 --> P1
    P1 --> V1
    V1 --> M1
    M1 --> N1
```

---

## **📋 Detailed Architecture Summary**

### **🎯 Technology Stack**
- **Frontend**: React 18, Material-UI v5, React Query, React Router v6
- **Backend**: Node.js, Express.js, JWT, Nodemailer, Multer
- **Database**: MongoDB Atlas, Mongoose ODM, Redis Cache
- **Video**: WebRTC, Socket.io, MediaStream API
- **AI/ML**: OpenAI GPT-4, TensorFlow.js, OpenAI Whisper, Medical NLP
- **Infrastructure**: Nginx, AWS S3, Firebase FCM, SendGrid

### **🔧 Implementation Details**
- **Authentication**: JWT with RS256, refresh token rotation
- **Security**: HTTPS/TLS 1.3, HIPAA compliance, input validation
- **Performance**: Redis caching, database indexing, CDN
- **Scalability**: Load balancing, horizontal scaling, microservices

### **📊 Data Management**
- **Schema Design**: Normalized collections with proper relationships
- **Data Security**: Field-level encryption, audit logging
- **Backup Strategy**: Automated backups, disaster recovery
- **Compliance**: HIPAA standards, data retention policies

### **🔄 Integration Points**
- **Real-time Communication**: WebRTC for video, Socket.io for signaling
- **AI Integration**: RESTful APIs for AI services
- **External Services**: Payment gateways, email providers, push notifications
- **Monitoring**: Application performance monitoring, error tracking

This detailed architecture provides comprehensive technical specifications for implementing SageCare 2.0 with enterprise-grade security, scalability, and performance. 