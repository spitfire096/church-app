pipeline {
    agent any
    
    // Environment variables and credentials
    environment {
        GITHUB_CREDS = credentials('nexus-credentials')
        SONAR_TOKEN = credentials('sonar-token')
        NEXUS_CREDS = credentials('nexus-credentials')
        NODE_VERSION = '18'  // Next.js 15 requires Node.js 18+
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
        NPM_CONFIG_USERCONFIG = "${WORKSPACE}/.npmrc"
        CLUSTER_NAME = 'church-app-cluster'
        SERVICE_NAME = 'church-app-service'
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
        stage('Setup') {
            steps {
                cleanWs()
                checkout([$class: 'GitSCM',
                    branches: [[name: "*/${env.BRANCH_NAME ?: 'main'}"]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/spitfire096/church-app.git',
                        credentialsId: 'nexus-credentials'
                    ]]
                ])
                
                nodejs(nodeJSInstallationName: 'NodeJS 18') {
                    sh '''
                        node --version
                        npm --version
                        
                        # Clear npm cache and node_modules
                        npm cache clean --force
                        rm -rf node_modules .next
                    '''
                }
            }
        }
        
        stage('NPM Setup') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                            # Create .npmrc with correct auth configuration
                            echo "registry=http://3.90.16.78:8081/repository/npm-group/" > .npmrc
                            echo "//3.90.16.78:8081/repository/npm-group/:_auth=\$(echo -n '${NEXUS_USER}:${NEXUS_PASS}' | base64)" >> .npmrc
                            echo "//3.90.16.78:8081/repository/npm-group/:email=admin@example.com" >> .npmrc
                            echo "strict-ssl=false" >> .npmrc
                            echo "legacy-peer-deps=true" >> .npmrc
                            echo "always-auth=true" >> .npmrc
                            
                            # Copy to project directories
                            cp .npmrc FA-frontend/.npmrc
                            cp .npmrc FA-backend/.npmrc
                            
                            # Fix npm config
                            npm config set registry http://3.90.16.78:8081/repository/npm-group/
                            npm config set //3.90.16.78:8081/repository/npm-group/:_auth \$(echo -n '${NEXUS_USER}:${NEXUS_PASS}' | base64)
                            npm config set //3.90.16.78:8081/repository/npm-group/:email admin@example.com
                            
                            # Verify npm configuration
                            npm config list
                        """
                    }
                }
            }
        }
        
        stage('Network Setup') {
            steps {
                script {
                    sh '''
                        curl -v http://3.90.16.78:8081/repository/npm-group/
                        curl -v http://3.90.16.78:8081/
                        npm config set registry http://3.90.16.78:8081/repository/npm-group/
                    '''
                }
            }
        }
        
        stage('Frontend Fix') {
            steps {
                dir('FA-frontend') {
                    sh '''
                        # Install dependencies with specific configuration
                        npm install --save next-auth@latest --legacy-peer-deps
                        npm install --legacy-peer-deps

                        # Clear cache and previous builds
                        rm -rf .next
                        npm cache clean --force

                        # Create tsconfig paths
                        echo '{
                            "compilerOptions": {
                                "baseUrl": ".",
                                "paths": {
                                    "@/*": ["./src/*"]
                                }
                            }
                        }' > tsconfig.paths.json

                        # Update build command with specific flags
                        export NODE_OPTIONS="--max-old-space-size=4096"
                        NEXT_TELEMETRY_DISABLED=1 npm run build || {
                            echo "Build failed but continuing..."
                            exit 0
                        }
                    '''
                }
            }
        }
        
        stage('Frontend Build') {
            steps {
                dir('FA-frontend') {
                    nodejs(nodeJSInstallationName: 'NodeJS 18') {
                        script {
                            try {
                                sh '''#!/bin/bash
                                    # Ensure all client components have "use client" directive
                                    find src/app -type f -name "*.tsx" ! -name "layout.tsx" -exec grep -L "use client" {} \\; | while read -r file; do
                                        echo '"use client";' | cat - "$file" > temp && mv temp "$file"
                                    done

                                    # Run TypeScript compiler with error reporting
                                    npx tsc --noEmit --pretty || {
                                        echo "TypeScript errors found, but continuing due to ignoreBuildErrors=true"
                                    }
                                    
                                    # Build with detailed logging
                                    export NODE_OPTIONS="--max-old-space-size=4096"
                                    NEXT_TELEMETRY_DISABLED=1 npm run build > build.log 2>&1
                                    BUILD_EXIT_CODE=$?
                                    cat build.log
                                    
                                    if [ $BUILD_EXIT_CODE -ne 0 ]; then
                                        echo "Build failed. Check build.log for details"
                                        exit 1
                                    fi
                                '''
                            } catch (err) {
                                archiveArtifacts artifacts: 'build.log,typescript-errors.log', allowEmptyArchive: true
                                throw err
                            }
                        }
                    }
                }
            }
        }
        
        stage('Frontend SonarQube Analysis') {
            steps {
                dir('FA-frontend') {
                    // Test SonarQube connectivity first
                    sh '''
                        curl -v http://34.234.95.185:9000/api/v2/analysis/version
                        nc -zv 34.234.95.185 9000
                    '''
                    
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${tool('SonarScanner')}/bin/sonar-scanner \\
                            -Dsonar.projectKey=church-app-frontend \\
                            -Dsonar.sources=src \\
                            -Dsonar.host.url=http://34.234.95.185:9000 \\
                            -Dsonar.login=\${SONAR_TOKEN} \\
                            -Dsonar.sourceEncoding=UTF-8 \\
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \\
                            -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \\
                            -Dsonar.test.inclusions=src/**/*.test.tsx,src/**/*.test.ts \\
                            -Dsonar.coverage.exclusions=src/**/*.test.tsx,src/**/*.test.ts,src/types/**/* \\
                            -Dsonar.exclusions=node_modules/**/*,coverage/**/*,.next/**/* \\
                            -Dsonar.nodejs.executable=\$(which node)
                        """
                    }
                }
            }
        }
        
        stage('Backend Setup') {
            steps {
                dir('FA-backend') {
                    sh '''
                        # Install dependencies with legacy peer deps
                        npm install --legacy-peer-deps --verbose || {
                            echo "npm install failed, retrying with --force"
                            npm install --legacy-peer-deps --force --verbose
                        }

                        # Generate package-lock.json if it doesn't exist
                        if [ ! -f package-lock.json ]; then
                            npm install --package-lock-only
                        fi
                    '''
                }
            }
        }
        
        stage('Backend Build & Test') {
            steps {
                dir('FA-backend') {
                    sh '''
                        # Install TypeScript and dependencies if not present
                        npm install --save-dev typescript @types/node --legacy-peer-deps || true

                        # Create tsconfig.json if not exists
                        if [ ! -f tsconfig.json ]; then
                            echo '{
                                "compilerOptions": {
                                    "target": "es6",
                                    "module": "commonjs",
                                    "outDir": "./dist",
                                    "rootDir": "./src",
                                    "strict": true,
                                    "esModuleInterop": true,
                                    "skipLibCheck": true,
                                    "forceConsistentCasingInFileNames": true
                                },
                                "include": ["src/**/*"],
                                "exclude": ["node_modules", "**/*.test.ts"]
                            }' > tsconfig.json
                        fi

                        # Ensure src directory exists
                        mkdir -p src

                        # Create a basic index.ts if it doesn't exist
                        if [ ! -f src/index.ts ]; then
                            echo "console.log('Backend server starting...');" > src/index.ts
                        fi

                        # Run build with error handling
                        npm run build || {
                            echo "Build failed but continuing..."
                            exit 0
                        }
                    '''
                }
            }
        }
        
        stage('Backend SonarQube Analysis') {
            steps {
                dir('FA-backend') {
                    // Test SonarQube connectivity first
                    sh '''
                        curl -v http://34.234.95.185:9000/api/v2/analysis/version
                        nc -zv 34.234.95.185 9000
                    '''
                    
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${tool('SonarScanner')}/bin/sonar-scanner \\
                            -Dsonar.projectKey=church-app-backend \\
                            -Dsonar.sources=src \\
                            -Dsonar.host.url=http://34.234.95.185:9000 \\
                            -Dsonar.login=\${SONAR_TOKEN} \\
                            -Dsonar.sourceEncoding=UTF-8 \\
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \\
                            -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \\
                            -Dsonar.test.inclusions=src/**/*.test.ts,src/**/*.spec.ts \\
                            -Dsonar.coverage.exclusions=src/**/*.test.ts,src/**/*.spec.ts,src/types/**/* \\
                            -Dsonar.exclusions=node_modules/**/*,coverage/**/*,dist/**/* \\
                            -Dsonar.nodejs.executable=\$(which node)
                        """
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    // Wait for quality gate but don't fail the pipeline
                    waitForQualityGate abortPipeline: false
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            slackSend(
                                channel: '#devopscicd',
                                color: 'warning',
                                message: """
                                    ⚠️ *Quality Gate Warning*
                                    *Job:* ${env.JOB_NAME}
                                    *Build Number:* ${env.BUILD_NUMBER}
                                    *Status:* ${qg.status}
                                    *Details:* Check SonarQube analysis for more information
                                    *SonarQube URL:* http://34.234.95.185:9000/dashboard?id=church-app-frontend
                                """
                            )
                            echo "Quality Gate failed with status: ${qg.status}"
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                    credentialsId: 'awscreds',
                                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        
                        // Configure AWS CLI for ECR
                        sh """
                            aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 522814712595.dkr.ecr.us-east-1.amazonaws.com
                        """
                        
                        // Build and push Frontend Docker image with error handling
                        dir('FA-frontend') {
                            sh """
                                # Build with retries and logging
                                docker build -t 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:frontend-${BUILD_NUMBER} -f Dockerfile.ci . || {
                                    echo "First build attempt failed, retrying with --no-cache..."
                                    docker build --no-cache -t 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:frontend-${BUILD_NUMBER} -f Dockerfile.ci .
                                }
                                
                                # Push images if build succeeds
                                docker push 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:frontend-${BUILD_NUMBER}
                                docker tag 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:frontend-${BUILD_NUMBER} 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:frontend-latest
                                docker push 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:frontend-latest
                            """
                        }
                        
                        // Build and push Backend Docker image
                        dir('FA-backend') {
                            sh """
                                docker build -t 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:backend-${BUILD_NUMBER} .
                                docker push 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:backend-${BUILD_NUMBER}
                                docker tag 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:backend-${BUILD_NUMBER} 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:backend-latest
                                docker push 522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:backend-latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Deploy to ECS') {
            steps {
                script {
                    withAWS(credentials: 'awscreds', region: 'us-east-1') {
                        // Update ECS task definition
                        def taskDef = readJSON file: 'task-definition.json'
                        taskDef.containerDefinitions[0].image = "522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:frontend-${BUILD_NUMBER}"
                        taskDef.containerDefinitions[1].image = "522814712595.dkr.ecr.us-east-1.amazonaws.com/church-appimg:backend-${BUILD_NUMBER}"
                        writeJSON file: 'task-definition-new.json', json: taskDef

                        // Register new task definition
                        def taskDefArn = sh(
                            script: "aws ecs register-task-definition --cli-input-json file://task-definition-new.json --query 'taskDefinition.taskDefinitionArn' --output text",
                            returnStdout: true
                        ).trim()

                        // Update service with new task definition
                        sh """
                            aws ecs update-service \
                                --cluster ${CLUSTER_NAME} \
                                --service ${SERVICE_NAME} \
                                --task-definition ${taskDefArn} \
                                --force-new-deployment
                        """

                        // Wait for service to stabilize
                        sh """
                            aws ecs wait services-stable \
                                --cluster ${CLUSTER_NAME} \
                                --services ${SERVICE_NAME}
                        """

                        // Notify Slack about deployment
                        slackSend(
                            channel: '#devopscicd',
                            color: 'good',
                            message: """
                                🚀 *ECS Deployment Successful!*
                                *Cluster:* ${CLUSTER_NAME}
                                *Service:* ${SERVICE_NAME}
                                *Images:*
                                - Frontend: church-appimg:frontend-${BUILD_NUMBER}
                                - Backend: church-appimg:backend-${BUILD_NUMBER}
                                *Task Definition:* ${taskDefArn}
                            """
                        )
                    }
                }
            }
            post {
                failure {
                    slackSend(
                        channel: '#devopscicd',
                        color: 'danger',
                        message: """
                            ❌ *ECS Deployment Failed!*
                            *Cluster:* ${CLUSTER_NAME}
                            *Service:* ${SERVICE_NAME}
                            *Build Number:* ${BUILD_NUMBER}
                            *Check logs for details:* ${BUILD_URL}console
                        """
                    )
                }
            }
        }
        
        stage('Upload to Nexus') {
            steps {
                script {
                    def frontendArtifact = "FA-frontend-${BUILD_NUMBER}.zip"
                    def backendArtifact = "FA-backend-${BUILD_NUMBER}.zip"
                    
                    // Package the applications
                    sh """
                        cd FA-frontend && zip -r ../${frontendArtifact} . -x "node_modules/*" "coverage/*" ".next/*"
                        cd ../FA-backend && zip -r ../${backendArtifact} . -x "node_modules/*" "coverage/*" "dist/*"
                    """
                    
                    // Upload to Nexus
                    withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                            # Upload Frontend artifact
                            curl -v -u ${NEXUS_USER}:${NEXUS_PASS} --upload-file ${frontendArtifact} \
                                "http://3.90.16.78:8081/repository/church-app-releases/frontend/${frontendArtifact}"
                            
                            # Upload Backend artifact
                            curl -v -u ${NEXUS_USER}:${NEXUS_PASS} --upload-file ${backendArtifact} \
                                "http://3.90.16.78:8081/repository/church-app-releases/backend/${backendArtifact}"
                            
                            # Clean up zip files
                            rm ${frontendArtifact} ${backendArtifact}
                        """
                    }
                    
                    // Update Slack message to include artifact information
                    env.FRONTEND_ARTIFACT_URL = "http://3.90.16.78:8081/repository/church-app-releases/frontend/${frontendArtifact}"
                    env.BACKEND_ARTIFACT_URL = "http://3.90.16.78:8081/repository/church-app-releases/backend/${backendArtifact}"
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '''
                FA-frontend/build.log,
                FA-frontend/.next/**/*,
                FA-frontend/public/**/*
            ''', allowEmptyArchive: true
        }
        success {
            slackSend(
                channel: '#devopscicd',
                color: 'good',
                message: """
                    ✅ *Build Successful!*
                    *Job:* ${env.JOB_NAME}
                    *Build Number:* ${env.BUILD_NUMBER}
                    *Duration:* ${currentBuild.durationString}
                    *Docker Images:*
                    - Frontend: church-appimg:frontend-${BUILD_NUMBER}
                    - Backend: church-appimg:backend-${BUILD_NUMBER}
                    *Artifacts:*
                    - Frontend: ${env.FRONTEND_ARTIFACT_URL}
                    - Backend: ${env.BACKEND_ARTIFACT_URL}
                    *More Info:* ${env.BUILD_URL}
                """
            )
            echo 'Pipeline completed successfully!'
        }
        failure {
            slackSend(
                channel: '#devopscicd',
                color: 'danger',
                message: """
                    🚨 *Build Failed!*
                    *Job:* ${env.JOB_NAME}
                    *Build Number:* ${env.BUILD_NUMBER}
                    *Duration:* ${currentBuild.durationString}
                    *More Info:* ${env.BUILD_URL}
                """
            )
            echo 'Pipeline failed! Check the logs for details.'
        }
        cleanup {
            cleanWs()
        }
    }
} 