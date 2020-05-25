// @flow

import axios from 'axios';
import queryString from 'query-string';

type AnyObjectType = {[string]: any};

type AuthConfiguration = {
  username: string,
  password: string,
};

type Configuration = {
  auth: ?AuthConfiguration,
  root: string,
};

type GetCallDetailsType = {
  auth: AuthConfiguration | void,
  headers: {[string]: string},
  responseType?: string,
};

type PostCallDetailsType = {
  auth: AuthConfiguration | void,
  data: any,
  headers: {[string]: string},
  method: 'post' | 'POST',
  responseType?: string,
  url: string,
};

type Template = {
  compiledTemplate: AnyObjectType,
  creatorId: string,
  id: string,
  index: number,
  name: string,
  structuredDocument: AnyObjectType,
  timestamp: number,
  title: string,
  version: string,
};

export class APIClient {
  conf: Configuration;
  jwt: string = '';
  loginPromise: Promise<AnyObjectType> = Promise.resolve({});

  constructor(conf: Configuration | string) {
    if (typeof conf === 'string') {
      this.conf = {root: conf, auth: undefined};
    } else {
      this.conf = Object.assign({}, conf);
    }
  }

  async waitForLogin(): Promise<AnyObjectType> {
    return this.loginPromise;
  }

  async postCall(
    url: string,
    params: any,
    headers: ?AnyObjectType,
  ): Promise<AnyObjectType> {
    return this.waitForLogin().then(() => {
      let callHeaders = Object.assign({}, headers);

      callHeaders['Content-Type'] =
        callHeaders['Content-Type'] || 'application/x-www-form-urlencoded';

      if (this.jwt) {
        callHeaders['OPENLAW_JWT'] = this.jwt;
      }

      const data =
        typeof params === 'string' ? params : queryString.stringify(params);

      const postCallDetails: PostCallDetailsType = {
        method: 'post',
        url: this.conf.root + url,
        data: data,
        headers: callHeaders,
        auth: undefined,
      };

      if (this.conf.auth) {
        postCallDetails.auth = Object.assign({}, this.conf.auth);
      }

      const urlRegex = new RegExp(/contract\/docx|contract\/pdf/);
      if (urlRegex.test(url)) {
        postCallDetails.responseType = 'blob';
      }

      return axios(postCallDetails)
        .then(result => {
          if (result.headers['openlaw_jwt']) {
            this.jwt = result.headers['openlaw_jwt'];
          }
          return result;
        })
        .catch(error => {
          throw error;
        });
    });
  }

  async getCall(
    url: string,
    params: ?AnyObjectType,
    headers: ?AnyObjectType,
  ): Promise<AnyObjectType> {
    return this.waitForLogin().then(() => {
      let callHeaders = Object.assign({}, headers);
      let paramsUrl = '';

      if (params) {
        paramsUrl = '?' + queryString.stringify(params);
      }

      if (this.jwt) {
        callHeaders['OPENLAW_JWT'] = this.jwt;
      }

      const getCallDetails: GetCallDetailsType = {
        headers: callHeaders,
        auth: undefined,
      };

      if (this.conf.auth) {
        getCallDetails.auth = Object.assign({}, this.conf.auth);
      }

      const urlRegex = new RegExp(
        /templates\/json|contract\/docx|contract\/pdf|contract\/json/,
      );

      if (urlRegex.test(url)) {
        getCallDetails.responseType = 'blob';
      }

      return axios
        .get(this.conf.root + url + paramsUrl, getCallDetails)
        .then(result => {
          if (result.headers['openlaw_jwt']) {
            this.jwt = result.headers['openlaw_jwt'];
          }
          return result;
        })
        .catch(error => {
          if (error.data) {
            throw error.data;
          }
          throw error;
        });
    });
  }

  async login(userId: string, password: string) {
    this.loginPromise = this.postCall('/app/login', {userId, password});
    return this.loginPromise;
  }

  async uploadContract(params: AnyObjectType): Promise<string> {
    const headers = {
      'Content-Type': 'text/plain;charset=UTF-8',
    };
    return this.postCall(
      '/upload/contract',
      JSON.stringify(params),
      headers,
    ).then(response => response.data);
  }

  async uploadFlow(params: AnyObjectType): Promise<string> {
    const headers = {
      'Content-Type': 'text/plain;charset=UTF-8',
    };
    return this.postCall('/upload/flow', JSON.stringify(params), headers).then(
      response => response.data,
    );
  }

  async uploadContractToGoogle(id: string) {
    const headers = {
      Origin: 'location.hostname',
      'Access-Control-Allow-Origin': '*',
    };

    return this.getCall('/driveAuthPage/' + id, headers);
  }

  async prepareSignature(
    contractId: string,
    fullName: string,
    accessToken: ?string,
  ): Promise<AnyObjectType> {
    return this.getCall('/prepareSignature/contract/' + contractId, {
      fullName,
      accessToken,
    });
  }

  async getAccessToken(contractId: string): Promise<AnyObjectType> {
    return this.getCall('/contract/token/' + contractId);
  }

  async getFlowAccessToken(flowId: string): Promise<string> {
    return this.getCall('/flow/token/' + flowId).then(
      response => response.data,
    );
  }

  async generateFlowAccessToken(flowId: string): Promise<string> {
    return this.postCall('/flow/updateToken/' + flowId).then(
      response => response.data,
    );
  }

  async signContract(
    contractId: string,
    fullName: string,
    accessToken: ?string,
  ): Promise<AnyObjectType> {
    return this.getCall('/sign/contract/' + contractId, {
      fullName,
      accessToken,
    });
  }

  async loadContractStatus(
    contractId: string,
    accessToken: ?string,
  ): Promise<AnyObjectType> {
    return this.getCall('/contract/sign/status', {
      id: contractId,
      accessToken,
    }).then(result => result.data);
  }

  async stopContract(id: string) {
    return this.getCall('/contract/stop/' + id);
  }

  async resumeContract(id: string) {
    return this.getCall('/contract/resume/' + id);
  }

  async sendContract(
    readonlyEmails: Array<string>,
    editEmails: Array<string>,
    id: string,
  ) {
    return this.postCall('/send/contract', {
      readonlyEmails,
      editEmails,
      id,
    });
  }

  async changeEthereumNetwork(name: string): Promise<AnyObjectType> {
    return this.getCall('/ethereum/changeEthereumNetwork/' + name);
  }

  async getCurrentNetwork() {
    return this.getCall('/network').then(response => response.data);
  }

  async saveTemplate(title: string, value: string) {
    const headers = {
      'Content-Type': 'text/plain;charset=UTF-8',
    };

    return this.postCall('/upload/template/' + title, value, headers);
  }

  async getTemplateVersions(
    title: string,
    pageSize: number,
    page: number,
  ): Promise<Array<Template>> {
    return this.getCall('/templates/version', {
      title,
      pageSize,
      page,
    }).then(response => response.data);
  }

  async getTemplate(title: string): Promise<AnyObjectType> {
    return this.getCall('/template/raw/' + title).then(
      response => response.data,
    );
  }

  async getTemplateById(id: string): Promise<AnyObjectType> {
    return this.getCall('/template/id/raw/' + id).then(
      response => response.data,
    );
  }

  async getTemplateVersion(title: string, version: string): Promise<string> {
    return this.getCall(
      '/template/raw/' + encodeURI(title) + '/' + version,
    ).then(response => response.data);
  }

  async getContract(
    contractId: string,
    accessToken: ?string,
  ): Promise<AnyObjectType> {
    return this.getCall('/contract/raw/' + contractId, {accessToken}).then(
      response => response.data,
    );
  }

  async getFlow(flowId: string, accessToken: ?string): Promise<AnyObjectType> {
    return this.getCall('/flow/raw/' + flowId, {accessToken}).then(
      response => response.data,
    );
  }

  async searchUsers(keyword: string, page: number, pageSize: number) {
    return this.getCall('/users/search', {
      keyword,
      page,
      pageSize,
    }).then(response => response.data);
  }

  async deleteUser(userId: string) {
    return this.getCall('/users/delete', {userId}).then(
      response => response.data,
    );
  }

  async toAdminUser(userId: string) {
    return this.getCall('/users/toadmin', {userId});
  }

  async toRestricted(userId: string) {
    return this.getCall('/users/torestricted', {userId});
  }

  async toStandardUser(userId: string) {
    return this.getCall('/users/touser', {userId});
  }

  async templateSearch(keyword: string, page: number, pageSize: number) {
    return this.getCall('/templates/search', {
      keyword,
      page,
      pageSize,
    }).then(response => response.data);
  }

  async searchDeletedTemplates(
    keyword: string,
    page: number,
    pageSize: number,
  ) {
    return this.getCall('/templates/searchDeleted', {
      keyword,
      page,
      pageSize,
    }).then(response => response.data);
  }

  async deleteTemplate(name: string) {
    return this.getCall('/templates/delete', {name});
  }

  async restoreTemplate(name: string) {
    return this.getCall('/templates/restore', {name});
  }

  async renameTemplate(oldName: string, newName: string) {
    return this.getCall('/templates/rename', {
      name: oldName,
      newName,
    });
  }

  async sendTxHash(
    contractId: string,
    network: string,
    txHash: string,
    accessToken: ?string,
  ) {
    return this.getCall('/contract/signature/sendTxHash', {
      contractId,
      network,
      txHash,
      accessToken,
    });
  }

  async sendTxHashForCall(
    contractId: string,
    userAccount: string,
    smartContractAddress: string,
    network: string,
    txHash: string,
  ) {
    return this.getCall('/contract/call/sendTxHash', {
      contractId,
      userAccount,
      smartContractAddress,
      network,
      txHash,
    });
  }

  async sendERC712SignatureForCall(
    contractId: string,
    identifier: string,
    userAccount: string,
    smartContractAddress: string,
    signedData: string,
  ) {
    return this.getCall('/contract/call/erc712', {
      contractId,
      userAccount,
      smartContractAddress,
      signedData,
      identifier,
    });
  }

  async changeContractAlias(contractId: string, newName: string) {
    return this.getCall('/contract/alias/' + contractId, {
      contractId,
      newName,
    });
  }

  async searchContracts(
    keyword: string,
    page: number,
    pageSize: number,
    sortBy: string,
  ) {
    return this.getCall('/contracts/search', {
      keyword,
      page,
      pageSize,
      sortBy,
    }).then(response => response.data);
  }

  async searchAddress(term: string) {
    return this.getCall('/address/search', {term}).then(
      response => response.data,
    );
  }

  async getAddressDetails(placeId: string) {
    return this.getCall('/address/details', {placeId}).then(
      response => response.data,
    );
  }

  async getStripeAccounts() {
    return this.getCall('/user/getStripeAccounts').then(
      response => response.data,
    );
  }

  async getCommunityActivity(filter: string, page: number, pageSize: number) {
    return this.getCall('/recentActivity', {
      filter,
      page,
      pageSize,
    }).then(response => response.data);
  }

  async downloadAsDocx(params: AnyObjectType) {
    const data = JSON.stringify(params);
    return this.postCall('/download/contract/docx', {data}).then(response => {
      const blob = new Blob([response.data], {type: response.data.type});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'unknown';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body && document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }

  async downloadAsPdf(params: AnyObjectType) {
    const data = JSON.stringify(params);
    return this.postCall('/download/contract/pdf', {data}).then(response => {
      const blob = new Blob([response.data], {type: response.data.type});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'unknown';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body && document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }

  async downloadTemplateAsJson(title: string) {
    return this.getCall('/templates/json/' + title).then(response => {
      const blob = new Blob([response.data], {type: response.data.type});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'unknown';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename=(.+)/);
        if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body && document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }

  async downloadContractAsDocx(contractId: string) {
    return this.getCall('/contract/docx/' + contractId).then(response => {
      const blob = new Blob([response.data], {type: response.data.type});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'unknown';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body && document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }

  async downloadContractAsPdf(contractId: string) {
    return this.getCall('/contract/pdf/' + contractId).then(response => {
      const blob = new Blob([response.data], {type: response.data.type});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'unknown';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body && document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }

  async downloadContractAsJson(contractId: string) {
    return this.getCall('/contract/json/' + contractId).then(response => {
      const blob = new Blob([response.data], {type: response.data.type});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'unknown';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename=(.+)/);
        if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body && document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }
}
