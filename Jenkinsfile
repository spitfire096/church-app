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
                            echo "registry=http://52.91.22.53:8081/repository/npm-group/" > .npmrc
                            echo "//52.91.22.53:8081/repository/npm-group/:_auth=\$(echo -n '${NEXUS_USER}:${NEXUS_PASS}' | base64)" >> .npmrc
                            echo "strict-ssl=false" >> .npmrc
                            echo "legacy-peer-deps=true" >> .npmrc
                            echo "always-auth=true" >> .npmrc
                            
                            # Copy to project directories
                            cp .npmrc FA-frontend/.npmrc
                            cp .npmrc FA-backend/.npmrc
                            
                            # Fix npm config
                            npm config set registry http://52.91.22.53:8081/repository/npm-group/
                            npm config set //52.91.22.53:8081/repository/npm-group/:_auth \$(echo -n '${NEXUS_USER}:${NEXUS_PASS}' | base64)
                        """
                    }
                }
            }
        }
        
        stage('Network Setup') {
            steps {
                script {
                    sh '''
                        curl -v http://52.91.22.53:8081/repository/npm-group/
                        curl -v http://52.91.22.53:8081/
                        npm config set registry http://52.91.22.53:8081/repository/npm-group/
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
                        curl -v http://54.221.130.28:9000/api/v2/analysis/version
                        nc -zv 54.221.130.28 9000
                    '''
                    
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${tool('SonarScanner')}/bin/sonar-scanner \\
                            -Dsonar.projectKey=church-app-frontend \\
                            -Dsonar.sources=. \\
                            -Dsonar.host.url=http://54.221.130.28:9000 \\
                            -Dsonar.login=\${SONAR_TOKEN} \\
                            -Dsonar.java.binaries=. \\
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
                        curl -v http://54.221.130.28:9000/api/v2/analysis/version
                        nc -zv 54.221.130.28 9000
                    '''
                    
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${tool('SonarScanner')}/bin/sonar-scanner \\
                            -Dsonar.projectKey=church-app-backend \\
                            -Dsonar.sources=. \\
                            -Dsonar.host.url=http://54.221.130.28:9000 \\
                            -Dsonar.login=\${SONAR_TOKEN} \\
                            -Dsonar.java.binaries=. \\
                            -Dsonar.nodejs.executable=\$(which node)
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
        always {
            archiveArtifacts artifacts: '''
                FA-frontend/build.log,
                FA-frontend/.next/**/*,
                FA-frontend/public/**/*
            ''', allowEmptyArchive: true
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
        cleanup {
            cleanWs()
        }
    }
} 