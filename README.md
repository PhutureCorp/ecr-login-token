![ci](https://github.com/PhutureCorp/ecr-login-token/workflows/ci/badge.svg)
[![GitHub release](https://img.shields.io/github/release/PhutureCorp/ecr-login-token.svg?style=flat-square)](https://github.com/PhutureCorp/ecr-login-token/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-PhutureCorp--ecr--login--token-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/ecr-login-token)

## About

GitHub Action to get the needed ecr short lived (12 hrs) token so containers can be used natively from Amazon ECR.

___

- [About](#about)
- [Usage](#usage)
  - [AWS Elastic Container Registry (ECR)](#aws-elastic-container-registry-ecr)
- [Customizing](#customizing)
  - [inputs](#inputs)
- [Keep up-to-date with GitHub Dependabot](#keep-up-to-date-with-github-dependabot)
- [Limitation](#limitation)

## Usage

### AWS Elastic Container Registry (ECR)

Use an IAM user with the [ability to download from ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/ecr_managed_policies.html).
Then create and download access keys and save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` [as secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository)
in your GitHub repo.

```yaml
name: Build using Amazon ECR Container

on:
  push:
    branches: main

jobs:
  login:
    runs-on: ubuntu-latest
    outputs:
      token: ${{ steps.ecr.outputs.token }}
    steps:
      - id: ecr
        name: Get token to login to Amazon ECR
        uses: PhutureCorp/ecr-login-token@v0.8.0
        with:
          registry: <aws-account-number>.dkr.ecr.<region>.amazonaws.com
          username: ${{ secrets.AWS_ACCESS_KEY_ID }}
          password: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  build:
    runs-on: ubuntu-latest
    needs: login
    container:
      image: <aws-account-number>.dkr.ecr.<region>.amazonaws.com/<image>:<version>
      credentials:
        username: AWS
        password: ${{ needs.login.outputs.token }}
    steps:
    - name: Check out code
      uses: actions/checkout@v2
```


> Replace `<aws-account-number>` and `<region>` with their respective values.


## Customizing

### inputs

Following inputs can be used as `step.with` keys

| Name             | Type    | Default                     | Description                        |
|------------------|---------|-----------------------------|------------------------------------|
| `registry`       | String  |                             | Server address of Docker registry. If not set then will default to Docker Hub |
| `username`       | String  |                             | Username used to log against the Docker registry |
| `password`       | String  |                             | Password or personal access token used to log against the Docker registry |

## Keep up-to-date with GitHub Dependabot

Since [Dependabot](https://docs.github.com/en/github/administering-a-repository/keeping-your-actions-up-to-date-with-github-dependabot)
has [native GitHub Actions support](https://docs.github.com/en/github/administering-a-repository/configuration-options-for-dependency-updates#package-ecosystem),
to enable it on your GitHub repo all you need to do is add the `.github/dependabot.yml` file:

```yaml
version: 2
updates:
  # Maintain dependencies for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "daily"
```

## Limitation

None So Far
