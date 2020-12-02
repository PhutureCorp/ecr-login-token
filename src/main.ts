//import * as os from 'os';
import {setFailed, info, setOutput} from '@actions/core';
import {getInputs, Inputs} from './context';
//import * as docker from './docker';
import * as stateHelper from './state-helper';
import ECR from 'aws-sdk/clients/ecr';
import STS from 'aws-sdk/clients/sts';
import {Credentials} from 'aws-sdk';

export async function run(): Promise<void> {
  try {
    const {registry, username, password, arn} = getInputs();

    let creds = new Credentials({
      accessKeyId: username,
      secretAccessKey: password
    });
    const region = await getRegion(registry);

    var sts = new STS({credentials: creds, region: region});

    var _newCreds = await sts.assumeRole({RoleArn: arn, RoleSessionName: 'AssumeRoleECR'}).promise();

    if (arn != '' && _newCreds && _newCreds.Credentials) {
      info(`🔑 Assuming New Role ${_newCreds.AssumedRoleUser?.Arn}...`);
      creds = new Credentials({
        accessKeyId: _newCreds.Credentials.AccessKeyId,
        secretAccessKey: _newCreds.Credentials.SecretAccessKey
      });
    }

    var ecr = new ECR({credentials: creds, region: region});

    info(`🔑 Getting Token...`);
    var token = await ecr.getAuthorizationToken({}).promise();
    var data = token.authorizationData;
    if (data) {
      const tokenData = data[0].authorizationToken as string;
      let buff = Buffer.from(tokenData, 'base64');
      let token = buff.toString('ascii').split(':')[1];
      setOutput('token', token);
    }

    stateHelper.setRegistry(registry);
    //stateHelper.setLogout(logout);
  } catch (error) {
    setFailed(error.message);
  }
}

export const getRegion = async (registry: string): Promise<string> => {
  return registry.substring(registry.indexOf('ecr.') + 4, registry.indexOf('.amazonaws'));
};

async function logout(): Promise<void> {}

if (!stateHelper.IsPost) {
  run();
} else {
  logout();
}
