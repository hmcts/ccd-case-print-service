#!groovy

properties(
  [[$class: 'GithubProjectProperty', projectUrlStr: 'https://github.com/hmcts/ccd-case-print-service/'],
   pipelineTriggers([[$class: 'GitHubPushTrigger']])]
)

@Library('Reform')
import uk.gov.hmcts.Ansible
import uk.gov.hmcts.Packager
import uk.gov.hmcts.RPMTagger

ansible = new Ansible(this, 'ccdata')
packager = new Packager(this, 'ccdata')

String channel = '#ccd-notifications'

milestone()
lock(resource: "ccd-case-print-service-${env.BRANCH_NAME}", inversePrecedence: true) {
  node {
    try {
      wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm']) {
        stage('Checkout') {
          deleteDir()
          checkout scm
        }

        stage('Setup (install only)') {
          sh "yarn install"
        }

        stage('Node security check') {
          try {
            sh "yarn test:nsp 2> nsp-report.txt"
          } catch (ignore) {
            sh "cat nsp-report.txt"
            archiveArtifacts 'nsp-report.txt'
            notifyBuildResult channel: channel, color: 'warning',
              message: 'Node security check failed see the report for the errors'
          }
          sh "rm nsp-report.txt"
        }

        stage('Test') {
          sh "yarn test"
        }

        onMaster {
          def rpmVersion

          stage('Package application (RPM)') {
            rpmVersion = packager.nodeRPM('ccd-case-print-service')
          }

          stage('Publish RPM') {
            packager.publishNodeRPM('ccd-case-print-service')
          }

          def rpmTagger = new RPMTagger(
            this,
            'ccd-case-print-service',
            packager.rpmName('ccd-case-print-service', rpmVersion),
            'ccdata-local'
          )

          def version = "{ccd_case_print_service_version: ${rpmVersion}}"

          deploy('develop', 'dev', version, rpmTagger)
          // deploy('master', 'test', version, rpmTagger)
        }

        milestone()
      }
    } catch (err) {
      notifyBuildFailure channel: channel
      throw err
    }
  }
}

def deploy(branch, env, version, rpmTagger) {
  stage('Deploy: ' + env) {
    ansible.runDeployPlaybook(version, env, branch)
    rpmTagger.tagDeploymentSuccessfulOn(env)
  }

  stage('Smoke Tests: ' + env) {
    sh "curl -vf https://return-case-doc." + env + ".ccd.reform.hmcts.net/health"
    rpmTagger.tagTestingPassedOn(env)
  }
}
