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
    const region = await getRegion(registry);

    var ecr = new ECR({credentials: creds, region: region});

    // core.info(`🔑 Getting Reps....`);
    // var repoInfo = await ecr.describeRepositories().promise();
    // var repos = repoInfo.repositories;
    // var registryId;
    // if (repos) {
    //   repos.forEach(repo => {
    //     core.info(`...Repo:${repo.registryId} - ${repo.repositoryName}`);
    //     registryId = repo.registryId;
    //     if (repo.repositoryName === registry) {
    //       registryId = repo.registryId;
    //       core.info(`Repo Match Found`);
    //     }
    //   });
    // }

    core.info(`🔑 Getting Token...`);
    var token = await ecr.getAuthorizationToken({}).promise();
    var data = token.authorizationData;
    if (data) {
      const tokenData = data[0].authorizationToken as string;
      let buff = Buffer.from(tokenData, 'base64');
      let token = buff.toString('ascii').split(':')[1];
      core.setOutput('token', token);
    }

    //return;
    //stateHelper.setRegistry(registry);
    //stateHelper.setLogout(logout);
    //await docker.login(registry, username, password);

  } catch (error) {
    core.setFailed(error.message);
  }
}

export const getRegion = async (registry: string): Promise<string> => {
  return registry.substring(registry.indexOf('ecr.') + 4, registry.indexOf('.amazonaws'));
};

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
