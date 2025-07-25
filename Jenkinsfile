pipeline {
    agent any
    environment {
        NEXT_PUBLIC_API_URL = credentials('NEXT_PUBLIC_API_URL_DONHANG')
        
        DOCKER_TAG = 'latest'
        CONTAINER_NAME = 'donhang-fe-container'
    }

    stages {
        stage('Remove Old Docker Image') {
            steps {
                script {
                    echo "Stopping and removing old Docker container..."
                    sh "docker stop ${env.CONTAINER_NAME} || true"
                    sh "docker rm ${env.CONTAINER_NAME} || true"
                    
                    echo "Removing old Docker image..."
                    sh "docker rmi donhang-fe:${env.DOCKER_TAG} || true"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build --build-arg NEXT_PUBLIC_API_URL=${env.NEXT_PUBLIC_API_URL} -t donhang-fe:${env.DOCKER_TAG} ."
                }
            }
        }

        stage('Run Container') {
            steps {
                script {
                    sh """
                        docker run -d \\
                            --restart unless-stopped \\
                            --name ${env.CONTAINER_NAME} \\
                            -p 3002:3000 \\
                            donhang-fe:${env.DOCKER_TAG}
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully'
            cleanWs()
        }
        failure {
            echo 'Pipeline failed'
            script {
                sh "docker stop ${env.CONTAINER_NAME} || true"
                sh "docker rm ${env.CONTAINER_NAME} || true"
                cleanWs()
            }
        }
        always {
            echo 'Pipeline completed'
            cleanWs()
        }
    }
} 