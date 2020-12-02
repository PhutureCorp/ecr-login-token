import {getInput} from '@actions/core';

export interface Inputs {
  registry: string;
  username: string;
  password: string;
  arn: string;
}

export function getInputs(): Inputs {
  return {
    registry: getInput('registry'),
    username: getInput('username'),
    password: getInput('password'),
    arn: getInput('arn')
  };
}
