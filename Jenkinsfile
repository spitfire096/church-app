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
                    // Create .npmrc file with proper authentication
                    sh """
                        echo "registry=http://54.235.236.251:8081/repository/npm-group/" > .npmrc
                        echo "//54.235.236.251:8081/repository/npm-group/:_auth=\$(echo -n ${NEXUS_CREDS_USR}:${NEXUS_CREDS_PSW} | base64)" >> .npmrc
                        echo "email=${NEXUS_CREDS_USR}@example.com" >> .npmrc
                        echo "always-auth=true" >> .npmrc
                        
                        # Copy .npmrc to frontend and backend directories
                        cp .npmrc FA-frontend/.npmrc
                        mkdir -p FA-backend && cp .npmrc FA-backend/.npmrc
                        
                        # Also set npm config globally for this user
                        npm config set registry http://54.235.236.251:8081/repository/npm-group/
                        npm config set //54.235.236.251:8081/repository/npm-group/:_auth \$(echo -n ${NEXUS_CREDS_USR}:${NEXUS_CREDS_PSW} | base64)
                        npm config set email ${NEXUS_CREDS_USR}@example.com
                        npm config set always-auth true
                    """
                }
            }
        }
        
        stage('Frontend Setup') {
            steps {
                dir('FA-frontend') {
                    sh '''
                        # Verify npm configuration
                        npm config list
                        
                        # Install dependencies
                        npm install --verbose
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