#!/usr/bin/env groovy
@Library('PipelineLibrary@881d5a5fad8f12b871af73fc815d3e6189887da9') _

import groovy.transform.Field

@Field def lib = null

pipeline {
    options {
        // If the pipeline has been running for 1 hour, something is probably broken and we should timeout
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(daysToKeepStr: '14', artifactDaysToKeepStr: '14'))
        throttleJobProperty(
            categories: [],
            throttleEnabled: true,
            throttleOption: 'project',
            limitOneJobWithMatchingParams: true,
            maxConcurrentPerNode: 0,
            maxConcurrentTotal: 0,
            paramsToUseForLimit: 'BRANCH'
        )
    }

    parameters {
        string(
            name: 'AGENT_LABEL',
            defaultValue: 'aws-linux-backend-deploy',
            description: 'Label defining where the job will run')

        string(name: 'PR_ID',
            defaultValue: 'master',
            description: 'pr id for which the job is triggered.')

        gitParameter(
            name: 'BRANCH',
            branchFilter: 'origin/(.*)',
            defaultValue: 'master',
            selectedValue: 'DEFAULT',
            quickFilterEnabled: true,
            sortMode: 'ASCENDING_SMART',
            type: 'PT_BRANCH',
            listSize: '8')

        string(
            name: 'IMAGE_TAG',
            defaultValue: '',
            description: '''Image tag to deploy.<br/>
                Script will search for the latest image which tag starts with this value.<br/>
                If empty, current branch name will be used.''')

        booleanParam(
            name: 'DEPLOY_DEV',
            defaultValue: true,
            description: 'Set to True to deploy to dev cluster')

        booleanParam(
            name: 'DEPLOY_STAGING',
            defaultValue: false,
            description: 'Set to True to deploy to staging cluster')

        booleanParam(
            name: 'VERBOSE',
            defaultValue: true,
            description: 'Set to True to print more outputs from fabric commands and others')
    }

    agent { label (params.AGENT_LABEL ?: 'aws-linux-backend-deploy') }

    stages {
        stage('Init node') {
            steps {
                script {
                    sh script: 'printenv | sort', label: 'Print env variables'
                    lib = load(pwd() + '/ci/jenkinslib.groovy')
                    currentBuild.description = lib.get_job_description()
                    lib.install_requirements('sysadmin/requirements_lock.txt', params.VERBOSE)

                    if (params.BRANCH != 'master') {
                        lib.set_github_status('pending', 'apps/campfire/deploy_campfire-api')
                    }
                }
            }
        }
        stage('Update kubeconfig') {
            steps {
                script {
                    sh script: 'fab build_machines.backend.update_kubeconfig', label: 'Update kubeconfig'
                }
            }
        }
        stage('Deploy to dev') {
            when { expression { return params.DEPLOY_DEV } }
            steps {
                // min_replicas and max_replicas defined differently in the code for 'master' and 'prXXXX' namespaces
                script {
                    sh script: "fab apps.campfire.deploy_eks:environment=dev,tag_prefix=${params.IMAGE_TAG}",
                       label: 'Deploy Campfire dev API'
                }
            }
        }
        stage('Deploy to staging and staging-app-test') {
            when { expression { return (params.DEPLOY_STAGING && params.BRANCH == 'master') } }
            steps {
                script {
                    sh script: ('fab apps.campfire.deploy_eks:environment=staging,namespace=master,' +
                        "max_replicas=5,min_replicas=2,max_surge=2,tag_prefix=${params.IMAGE_TAG}"),
                        label: 'Deploy Campfire staging API'

                    sh script: ('fab apps.campfire.deploy_eks:environment=staging,namespace=app-test,' +
                        "max_replicas=5,min_replicas=2,max_surge=2,tag_prefix=${params.IMAGE_TAG}"),
                        label: 'Deploy Campfire staging-app-test API'
                }
            }
        }
        stage('Trigger deploy to production') {
            when { expression { return (params.DEPLOY_STAGING && params.BRANCH == 'master' && currentBuild.currentResult == 'SUCCESS') } }
            steps {
                script {
                    def job_parameters = [
                        string(name: 'IMAGE_TAG', value: params.IMAGE_TAG),
                    ]
                    lib.trigger_job('apps/campfire/auto_deploy_campfire_api_prod', job_parameters, true)
                }
            }
        }
    }
    post {
        success {
            script {
                if (params.BRANCH != 'master') {
                    lib.set_github_status('success', 'apps/campfire/deploy_campfire-api')
                    lib.notify_pr_watchers(params.PR_ID, 'campfire-api', "https://campfire-api-dev-pr${params.PR_ID}.yousician.com", 'deployed successfully')
                }
            }
        }
        unsuccessful {
            script {
                if (params.BRANCH == 'master') {
                    def message = slack.getFormattedSlackMessage()
                    message += '\nFailed to deploy campfire api to production.'
                    slack.notifyChannel('#campfire_backend', message)
                }
                else {
                    lib.set_github_status('failure', 'apps/campfire/deploy_campfire-api')
                    lib.notify_pr_watchers(params.PR_ID, 'campfire-api', "https://campfire-api-dev-pr${params.PR_ID}.yousician.com", 'deploy failed')
                }
            }
        }
    }
}
