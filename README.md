# HealthSpan - A Personalized Dietary Nutrition System for Elderly Health Management

## Overview
HealthSpan is a comprehensive dietary nutrition system designed specifically for elderly health management. It combines personalized nutrition planning with AI-powered recommendations to help elderly individuals maintain optimal health through proper nutrition.

## Tech Stack

- **Mobile**: Flutter (Cross-platform mobile application)
- **Web**: React + Vite (Responsive web application)
- **Backend**: FastAPI (High-performance Python API)
- **Database**: PostgreSQL (Relational database for structured data)
- **Authentication**: Firebase Authentication (Secure user authentication)
- **AI**: Llama 3 (Large language model for personalized recommendations)
- **Vector Database**: FAISS (Efficient similarity search for nutritional data)
- **Datasets**: NHANES, USDA FoodData Central, Personalized Medical Diet Recommendation Dataset

## Project Structure

```
healthspan/
├── mobile/                 # Flutter mobile application
├── web/                    # React + Vite web application
├── backend/                # FastAPI backend
├── database/               # Database schemas and migrations
├── ai/                     # AI models and services
├── datasets/               # Nutritional and health datasets
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── docker-compose.yml      # Docker Compose configuration
├── README.md               # Project documentation
└── .gitignore              # Git ignore rules
```

### Backend Structure
```
backend/
├── app/                    # Main application
│   ├── api/                # API endpoints
│   ├── core/               # Core configuration
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── tests/                  # Test suite
├── requirements.txt        # Python dependencies
└── main.py                 # Application entry point
```

### Mobile Structure
```
mobile/
├── android/                # Android-specific code
├── ios/                    # iOS-specific code
├── lib/                    # Dart/Flutter code
│   ├── data/               # Data models and repositories
│   ├── domain/             # Business logic and use cases
│   ├── presentation/       # UI components and screens
│   └── di/                 # Dependency injection
└── pubspec.yaml            # Flutter dependencies
```

### Web Structure
```
web/
├── public/                 # Static assets
├── src/                    # React source code
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   ├── store/              # State management
│   └── utils/              # Utility functions
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Node.js dependencies
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git
- Node.js (for web development)
- Flutter SDK (for mobile development)
- Python 3.9+ (for backend development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd healthspan
```

2. Set up environment variables:
   - Copy `.env.example` files to `.env` in each service directory
   - Configure Firebase credentials in mobile and web applications
   - Configure database credentials in backend

3. Start the services:
```bash
docker-compose up --build
```

4. Access the applications:
   - Web Application: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - Mobile: Run `flutter run` in the mobile directory

## Features

- Personalized meal planning based on health conditions, preferences, and nutritional needs
- AI-powered dietary recommendations using Llama 3
- Nutritional tracking and analysis
- Medication-nutrient interaction checking
- Meal planning and grocery list generation
- Health metric tracking and visualization
- Caregiver portal for monitoring and assistance
- Multi-language support
- Offline functionality for mobile application

## Data Sources

- **NHANES**: National Health and Nutrition Examination Survey data for population health insights
- **USDA FoodData Central**: Comprehensive food nutrient database
- **Personalized Medical Diet Recommendation Dataset**: Clinical guidelines for condition-specific diets

## Architecture

HealthSpan follows Clean Architecture principles:

1. **Enterprise Business Rules** (Domain layer): Entities and use cases
2. **Application Business Rules** (Application layer): Use cases and business logic
3. **Interface Adapters** (Interface layer): Controllers, presenters, gateways
4. **Frameworks and Drivers** (Infrastructure layer): Databases, frameworks, external services

## AI Integration

The AI component uses Llama 3 for:
- Personalized meal recommendations based on health profiles
- Recipe modification suggestions for dietary restrictions
- Nutritional advice and education
- Conversational interface for user interaction

FAISS is used for efficient similarity search across nutritional databases to find suitable food alternatives and similar nutritional profiles.

## Security

- Firebase Authentication for secure user management
- Role-based access control (patients, caregivers, administrators)
- Data encryption at rest and in transit
- HIPAA-compliant data handling practices
- Regular security audits and updates

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Web Development
```bash
cd web
npm install
npm run dev
```

### Mobile Development
```bash
cd mobile
flutter pub get
flutter run
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Web Tests
```bash
cd web
npm test
```

### Mobile Tests
```bash
cd mobile
flutter test
```

## Deployment

The application is designed for deployment using Docker Compose. For production deployment:

1. Configure environment variables for production
2. Set up proper SSL/TLS certificates
3. Configure production-grade PostgreSQL settings
4. Set up Firebase production credentials
5. Deploy using Docker Compose or Kubernetes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/yourusername/healthspan](https://github.com/yourusername/healthspan)
```
>>>>>>> d7bf140 (feat: complete full stack healthspan application with user isolation and unique PIN management)
