import {getInput} from '@actions/core';

export interface Inputs {
  registry: string;
  username: string;
  password: string;
  logout: string;
}

export function getInputs(): Inputs {
  return {
    registry: getInput('registry'),
    username: getInput('username'),
    password: getInput('password'),
    logout: getInput('logout')
  };
}
