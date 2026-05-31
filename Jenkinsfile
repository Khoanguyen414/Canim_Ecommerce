// Jenkins pipeline for LOCAL DEMO ONLY — not the public hosting platform.
// Requires: Docker, Docker Compose, JDK 21, Node.js 20+, Python 3.12 (optional for non-Docker AI build).

pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'canim_ecommerce_demo'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend/canim_ecommerce') {
                    sh './mvnw clean package -DskipTests -B'
                }
            }
        }

        stage('Build AI Service Docker image') {
            steps {
                dir('ai-service') {
                    sh 'docker build -t canim-ai-service:local .'
                }
            }
        }

        stage('Build Storefront') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Admin Frontend') {
            steps {
                dir('admin-frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Run Docker Compose') {
            steps {
                sh '''
                  if [ ! -f .env ]; then
                    cp .env.example .env
                  fi
                  docker compose up -d --build
                '''
            }
        }
    }

    post {
        always {
            echo 'Demo URLs:'
            echo '  Backend: http://localhost:8080/canim_ecommerce'
            echo '  AI:      http://localhost:8001'
            echo '  Storefront: npm run dev in frontend/ (port 5173)'
            echo '  Admin:      npm run dev in admin-frontend/ (port 5174)'
        }
    }
}
