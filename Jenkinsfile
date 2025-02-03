pipeline {
    agent any
    
    // Environment variables and credentials
    environment {
        GITHUB_CREDS = credentials('nexus-credentials')
        SONAR_TOKEN = credentials('sonar-token')
        NEXUS_CREDS = credentials('nexus-credentials')
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
                node {
                    cleanWs()
                    checkout([$class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/spitfire096/church-app.git',
                            credentialsId: 'nexus-credentials'
                        ]]
                    ])
                }
            }
        }
        
        stage('Setup') {
            steps {
                node {
                    withEnv(["HOME=${env.WORKSPACE}"]) {
                        sh 'npm config set registry http://54.235.236.251:8081/repository/npm-group/'
                        sh "npm config set _auth \$(echo -n ${NEXUS_CREDS_USR}:${NEXUS_CREDS_PSW} | base64)"
                    }
                }
            }
        }
        
        stage('Frontend Build & Test') {
            steps {
                node {
                    withEnv(["HOME=${env.WORKSPACE}"]) {
                        dir('FA-frontend') {
                            sh 'npm install'
                            sh 'npm run lint'
                            sh 'npm run test:coverage'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Frontend SonarQube Analysis') {
            steps {
                node {
                    withSonarQubeEnv('SonarQube') {
                        dir('FA-frontend') {
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
        }
        
        stage('Frontend Quality Gate') {
            steps {
                node {
                    timeout(time: 1, unit: 'HOURS') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }
        
        stage('Backend Build & Test') {
            steps {
                node {
                    withEnv(["HOME=${env.WORKSPACE}"]) {
                        dir('FA-backend') {
                            sh 'npm install'
                            sh 'npm run lint'
                            sh 'npm run test:coverage'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Backend SonarQube Analysis') {
            steps {
                node {
                    withSonarQubeEnv('SonarQube') {
                        dir('FA-backend') {
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
        }
        
        stage('Backend Quality Gate') {
            steps {
                node {
                    timeout(time: 1, unit: 'HOURS') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }
        
        stage('Publish to Nexus') {
            steps {
                node {
                    withEnv(["HOME=${env.WORKSPACE}"]) {
                        dir('FA-frontend') {
                            sh 'npm publish'
                        }
                        dir('FA-backend') {
                            sh 'npm publish'
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                node {
                    echo 'Deploying application...'
                    // Add deployment steps here
                }
            }
        }
    }
    
    post {
        always {
            node {
                cleanWs()
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            // Add notification steps if needed
            // mail to: 'team@example.com',
            //     subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
            //     body: "Pipeline failure: ${env.BUILD_URL}"
        }
    }
} 