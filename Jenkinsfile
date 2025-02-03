pipeline {
    agent any
    
    environment {
        NEXUS_CREDS = credentials('nexus-credentials')
        SONAR_TOKEN = credentials('sonar-token')
        NODE_VERSION = '18.x'
    }
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm config set registry http://localhost:8081/repository/npm-group/'
                sh "npm config set _auth \$(echo -n ${NEXUS_CREDS_USR}:${NEXUS_CREDS_PSW} | base64)"
            }
        }
        
        stage('Frontend Build & Test') {
            steps {
                dir('FA-frontend') {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm run test:coverage'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Frontend SonarQube Analysis') {
            steps {
                dir('FA-frontend') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        withSonarQubeEnv('SonarQube') {
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=church-app-frontend \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://your-sonarqube-ip:9000 \
                                -Dsonar.login=${SONAR_TOKEN}
                            """
                        }
                    }
                }
            }
        }
        
        stage('Backend Build & Test') {
            steps {
                dir('FA-backend') {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm run test:coverage'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Backend SonarQube Analysis') {
            steps {
                dir('FA-backend') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        withSonarQubeEnv('SonarQube') {
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=church-app-backend \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://your-sonarqube-ip:9000 \
                                -Dsonar.login=${SONAR_TOKEN}
                            """
                        }
                    }
                }
            }
        }
        
        stage('Publish to Nexus') {
            steps {
                dir('FA-frontend') {
                    sh 'npm publish'
                }
                dir('FA-backend') {
                    sh 'npm publish'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
} 