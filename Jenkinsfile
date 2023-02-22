#!/usr/bin/env groovy

pipeline {
    agent any
    parameters {
        booleanParam(
            name: 'testval',
            defaultValue: true,
            description: 'checking if the pipeline is triggered')
    }
    stages {
        stage('Init node') {
            steps {
                echo 'test'
            }
        }
    }
}
