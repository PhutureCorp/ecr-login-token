import * as os from 'os';
import * as core from '@actions/core';
import {getInputs, Inputs} from './context';
import * as docker from './docker';
import * as stateHelper from './state-helper';
import AWS, {ECR, Config, Credentials} from 'aws-sdk';
export async function run(): Promise<void> {
  try {
    if (os.platform() !== 'linux') {
      throw new Error('Only supported on linux platform');
    }

    const {registry, username, password, logout} = getInputs();

    const creds = new Credentials({
      accessKeyId: username,
      secretAccessKey: password
    });
    AWS.config.credentials = creds;

    var ecr = new ECR();
    var token = await ecr.getAuthorizationToken({registryIds: [registry]}).promise();
    var data = token.authorizationData;
    if (data) {
      core.info(`🔑 Getting Token...`)
      core.setOutput('token', data[0].authorizationToken);
    }
    return;
    stateHelper.setRegistry(registry);
    stateHelper.setLogout(logout);
    await docker.login(registry, username, password);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function logout(): Promise<void> {
  if (!stateHelper.logout) {
    return;
  }
  await docker.logout(stateHelper.registry);
}

if (!stateHelper.IsPost) {
  run();
} else {
  logout();
}
