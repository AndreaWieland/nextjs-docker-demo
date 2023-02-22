#!/usr/bin/env groovy

pipeline {
    agent any
    parameters {
        booleanParam(
            name: 'testval',
            defaultValue: true,
            description: 'checking if the pipeline is triggered')
    }

    agent { label (params.AGENT_LABEL ?: 'aws-linux-backend-deploy') }

    stages {
        stage('Init node') {
            steps {
                echo 'test'
            }
        }
    }
}
