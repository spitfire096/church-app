pipeline {
    agent any
    
    // Environment variables and credentials
    environment {
        GITHUB_CREDS = credentials('nexus-credentials')
        SONAR_TOKEN = credentials('sonar-token')
        NEXUS_CREDS = credentials('nexus-credentials')
        NPM_CONFIG_USERCONFIG = "${env.WORKSPACE}/.npmrc"
    }
    
    // Tool configurations
    tools {
        git 'Default'
        nodejs 'NodeJS 18'
    }
    
    // Pipeline options
    options {
        skipDefaultCheckout(true)
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Checkout') {
            steps {
                deleteDir()  // Deletes everything before checking out code
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/spitfire096/church-app.git',
                        credentialsId: 'nexus-credentials'
                    ]]
                ])
            }
        }
        
        stage('NPM Setup') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                            # Create minimal .npmrc file
                            echo "registry=http://54.235.236.251:8081/repository/npm-group/" > .npmrc
                            echo "//54.235.236.251:8081/repository/npm-group/:_auth=\$(echo -n '${NEXUS_USER}:${NEXUS_PASS}' | base64)" >> .npmrc
                            
                            # Copy to project directories
                            mkdir -p FA-frontend FA-backend
                            cp .npmrc FA-frontend/.npmrc
                            cp .npmrc FA-backend/.npmrc
                            
                            # Set npm config
                            npm config set userconfig \$PWD/.npmrc
                        """
                    }
                }
            }
        }
        
        stage('Frontend Setup') {
            steps {
                dir('FA-frontend') {
                    sh '''
                        # Verify npm configuration
                        npm config list
                        
                        # Install dependencies with network retry
                        npm install --verbose --fetch-retries=5 --fetch-retry-factor=2 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
                    '''
                }
            }
        }
        
        stage('Frontend Build & Test') {
            steps {
                dir('FA-frontend') {
                    sh 'npm run lint'
                    sh 'npm run test:coverage'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Frontend SonarQube Analysis') {
            steps {
                dir('FA-frontend') {
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${tool('SonarScanner')}/bin/sonar-scanner \
                            -Dsonar.projectKey=church-app-frontend \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=\${SONAR_HOST_URL} \
                            -Dsonar.login=\${SONAR_TOKEN}
                        """
                    }
                }
            }
        }
        
        stage('Backend Setup') {
            steps {
                dir('FA-backend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Backend Build & Test') {
            steps {
                dir('FA-backend') {
                    sh 'npm run lint'
                    sh 'npm run test:coverage'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Backend SonarQube Analysis') {
            steps {
                dir('FA-backend') {
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${tool('SonarScanner')}/bin/sonar-scanner \
                            -Dsonar.projectKey=church-app-backend \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=\${SONAR_HOST_URL} \
                            -Dsonar.login=\${SONAR_TOKEN}
                        """
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            // Consider adding notifications here
            // emailext, slack notifications, etc.
        }
    }
} 