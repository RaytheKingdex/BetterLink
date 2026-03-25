# BetterLink Mobile

React Native (Expo) mobile client for the BetterLink platform —  
Jamaica's student-employer networking and job-matching app.

---

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your Android device **or** Android Studio emulator

### Install

```bash
cd BetterLinkMobile
npm install
```

### Configure the API base URL

Open `src/api/client.js` and update `BASE_URL`:

| Environment         | Value                          |
|---------------------|-------------------------------|
| Android emulator    | `http://10.0.2.2:5000`        |
| Physical device     | `http://<your-LAN-IP>:5000`   |
| Production          | `https://api.betterlink.app`  |

### Start

```bash
# Expo Go (fastest for dev)
npm start

# Android emulator directly
npm run android
```

---

## Project Structure

```
BetterLinkMobile/
├── App.js                         # Root — SafeAreaProvider + AuthProvider
├── app.json                       # Expo config
├── src/
│   ├── api/
│   │   ├── client.js              # Central fetch helper + token helpers
│   │   ├── auth.js                # login, registerStudent, registerEmployer
│   │   ├── users.js               # getMe, updateMe  ← /api/users/me
│   │   ├── jobs.js                # getJobs, getJobById, createJob, applyToJob
│   │   ├── applications.js        # getMyApplications
│   │   └── communities.js         # create, get, join, postMessage
│   │
│   ├── context/
│   │   └── AuthContext.js         # Global auth state, signIn, signOut, role
│   │
│   ├── navigation/
│   │   └── AppNavigator.js        # Auth stack + Student tabs + Employer tabs
│   │
│   ├── components/
│   │   └── index.js               # Button, InputField, Badge, Card, EmptyState…
│   │
│   ├── theme/
│   │   └── index.js               # Colors, Typography, Spacing, Radius
│   │
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   ├── RegisterStudentScreen.js
│       │   └── RegisterEmployerScreen.js
│       │
│       ├── student/
│       │   ├── JobsScreen.js          # Paginated job feed + search
│       │   ├── JobDetailScreen.js     # Job info + apply with cover letter
│       │   └── ApplicationsScreen.js  # Tracked applications + status
│       │
│       ├── employer/
│       │   └── PostJobScreen.js       # Create job listing
│       │
│       └── shared/
│           ├── CommunitiesScreen.js   # Create + find + join communities
│           ├── CommunityDetailScreen.js # Chat interface + membership
│           └── ProfileScreen.js       # View + edit profile, sign out
```

---

## API Endpoints Connected

| Method | Endpoint                        | Screen(s)                    |
|--------|---------------------------------|------------------------------|
| POST   | /api/auth/login                 | LoginScreen                  |
| POST   | /api/auth/register/student      | RegisterStudentScreen        |
| POST   | /api/auth/register/employer     | RegisterEmployerScreen       |
| GET    | /api/users/me                   | ProfileScreen, AuthContext   |
| PUT    | /api/users/me                   | ProfileScreen                |
| GET    | /api/jobs                       | JobsScreen                   |
| GET    | /api/jobs/:id                   | JobDetailScreen              |
| POST   | /api/jobs                       | PostJobScreen (Employer)     |
| POST   | /api/jobs/:id/apply             | JobDetailScreen (Student)    |
| GET    | /api/applications/me            | ApplicationsScreen (Student) |
| POST   | /api/communities                | CommunitiesScreen            |
| GET    | /api/communities/:id            | CommunityDetailScreen        |
| POST   | /api/communities/:id/join       | CommunityDetailScreen        |
| POST   | /api/communities/:id/messages   | CommunityDetailScreen        |

---

## Role-Based Navigation

| Role       | Tabs                                               |
|------------|----------------------------------------------------|
| Student    | Jobs · My Applications · Communities · Profile    |
| Employer   | Browse Jobs · Post a Job · Communities · Profile  |
| Logged out | Login → Register Student / Register Employer      |

---

## Tech Stack

| Concern          | Choice                              |
|------------------|-------------------------------------|
| Framework        | React Native (Expo SDK 50)          |
| Navigation       | React Navigation 6 (Stack + Tabs)   |
| Token storage    | expo-secure-store (encrypted)       |
| State            | React Context + hooks               |
| Type checking    | PropTypes                           |
| Styling          | StyleSheet (no external UI lib)     |
