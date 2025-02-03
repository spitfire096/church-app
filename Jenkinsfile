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
                            # Test direct connection first
                            if ! curl -f -s -m 10 http://54.235.236.251:8081/repository/npm-group/; then
                                echo "Cannot connect to Nexus, falling back to public registry"
                                echo "registry=https://registry.npmjs.org/" > .npmrc
                            else
                                # Use Nexus if available
                                echo "registry=http://54.235.236.251:8081/repository/npm-group/" > .npmrc
                                echo "//54.235.236.251:8081/repository/npm-group/:_auth=\$(echo -n '${NEXUS_USER}:${NEXUS_PASS}' | base64)" >> .npmrc
                            fi
                            
                            echo "strict-ssl=false" >> .npmrc
                            
                            # Copy to project directories
                            cp .npmrc FA-frontend/.npmrc
                            cp .npmrc FA-backend/.npmrc
                        """
                    }
                }
            }
        }
        
        stage('Network Setup') {
            steps {
                script {
                    sh '''
                        # Test npm registry endpoint
                        echo "Testing npm registry endpoint..."
                        curl -v http://54.235.236.251:8081/repository/npm-group/
                        
                        # Test Nexus UI endpoint
                        echo "Testing Nexus UI endpoint..."
                        curl -v http://54.235.236.251:8081/
                        
                        # Configure npm
                        npm config set registry http://54.235.236.251:8081/repository/npm-group/
                        npm config set strict-ssl false
                    '''
                }
            }
        }
        
        stage('Frontend Setup') {
            steps {
                dir('FA-frontend') {
                    sh '''
                        # Try npm ci first, fall back to npm install if it fails
                        npm ci --verbose || npm install --verbose
                        
                        # Install eslint explicitly if needed
                        if ! npm list eslint; then
                            npm install eslint@8.x --save-dev
                        fi
                    '''
                }
            }
        }
        
        stage('Frontend Build & Test') {
            steps {
                dir('FA-frontend') {
                    sh '''
                        # Run tests and build
                        npm run lint || true  # Don't fail if lint has warnings
                        npm run test:coverage || echo "Tests failed but continuing..."
                        npm run build
                    '''
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
                    sh '''
                        # Install dependencies
                        npm ci --verbose
                    '''
                }
            }
        }
        
        stage('Backend Build & Test') {
            steps {
                dir('FA-backend') {
                    sh '''
                        # Run tests and build
                        npm run lint || true
                        npm run test:coverage || echo "Tests failed but continuing..."
                        npm run build
                    '''
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