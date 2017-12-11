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
          sh "yarn test:nsp"
        }

        stage('Test') {
          sh "yarn test"
        }

        onDevelop {
          publishAndDeploy('develop', 'dev')
        }

        onMaster {
          publishAndDeploy('master', 'test')
        }

        milestone()
      }
    } catch (err) {
      notifyBuildFailure channel: '#ccd-notifications'
      throw err
    }
  }
}

def publishAndDeploy(branch, env) {
  def rpmVersion
  def version

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

  stage('Deploy: ' + env) {
    version = "{ccd_case_print_service_version: ${rpmVersion}}"
    ansible.runDeployPlaybook(version, env, branch)
    rpmTagger.tagDeploymentSuccessfulOn(env)
  }

  stage('Smoke Tests: ' + env) {
    sh "curl -vf https://return-case-doc." + env + ".ccd.reform.hmcts.net/health"
    rpmTagger.tagTestingPassedOn(env)
  }
}
