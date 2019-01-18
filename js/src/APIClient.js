// @flow
import axios from 'axios';
import queryString from 'query-string';

type AuthConfiguration = {
  username: string,
  password: string,
}

type Configuration = {
  root: string,
  auth: ?AuthConfiguration,
}

type Template = {
  id: string,
  name: string,
  compiledTemplate: Object,
  structuredDocument: Object,
  timestamp: number,
  title: string,
  version: string,
  index: number,
  creatorId: string,
};

export class APIClient {

  conf: Configuration;
  jwt: string = '';
  loginPromise: Promise<Object> = Promise.resolve({});

  constructor(conf: Configuration | string) {
    if (typeof conf === 'string') {
      this.conf = {root: conf, auth: undefined};
    } else {
      this.conf = Object.assign({}, conf);
    }
  }

  async waitForLogin(): Promise<Object> {
    return this.loginPromise;
  }

  async postCall(url: string, params: any, headers: ?Object): Promise<Object> {
    return this.waitForLogin().then(() => {
      let callHeaders = Object.assign({}, headers);
      callHeaders['Content-Type'] = callHeaders['Content-Type'] || 'application/x-www-form-urlencoded';
      if (this.jwt) {
        callHeaders['OPENLAW_JWT'] = this.jwt;
      }

      const data = typeof params === 'string' ? params : queryString.stringify(params);

      const postCallDetails = {
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
        // $FlowFixMe - add new property for flow sealed object
        postCallDetails.responseType = 'blob';
      }

      return axios(postCallDetails).then(result => {
        if (result.headers['openlaw_jwt']) {
          this.jwt = result.headers['openlaw_jwt'];
        }
        return result;
      }).catch((error) => {
        throw error;
      });
    });
  }

  async getCall(url: string, params: ?Object, headers: ?Object): Promise<Object> {
    return this.waitForLogin().then(() => {
      let callHeaders = Object.assign({}, headers);
      let paramsUrl = '';
      if (params) {
        paramsUrl = '?' + queryString.stringify(params);
      }
      if (this.jwt) {
        callHeaders['OPENLAW_JWT'] = this.jwt;
      }

      const getCallDetails = {
        headers: callHeaders,
        auth: undefined,
      };

      if (this.conf.auth) {
        getCallDetails.auth = Object.assign({}, this.conf.auth);
      }

      const urlRegex = new RegExp(/templates\/json|draft\/json|contract\/docx|contract\/pdf|contract\/json/);
      if (urlRegex.test(url)) {
        // $FlowFixMe - add new property for flow sealed object
        getCallDetails.responseType = 'blob';
      }

      return axios.get(this.conf.root + url + paramsUrl, getCallDetails).then(result => {
        if (result.headers['openlaw_jwt']) {
          this.jwt = result.headers['openlaw_jwt'];
        }
        return result;
      })
        .catch((error) => {
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

  async uploadContract(params: Object): Promise<string> {
    const headers = {
      'Content-Type': 'text/plain;charset=UTF-8',
    };
    return this.postCall('/upload/contract', JSON.stringify(params), headers)
      .then(response => response.data);
  }

  async uploadDraft(params: Object): Promise<string> {
    const headers = {
      'Content-Type': 'text/plain;charset=UTF-8',
    };

    return this.postCall('/upload/draft', JSON.stringify(params), headers)
      .then(response => response.data);
  }

  async uploadContractToGoogle(id: string) {
    const headers = {
      Origin: 'location.hostname',
      'Access-Control-Allow-Origin': '*',
    };

    return this.getCall('/driveAuthPage/' + id, headers);
  }

  async sendDraft(
    readonlyEmails: Array<string>,
    editEmails: Array<string>,
    id: string,
  ) {
    return this.postCall('/send/draft',
      {
        readonlyEmails,
        editEmails, id
      }
    );
  }
  async prepareSignature(
    contractId: string,
    fullName: string,
    accessToken: ?string
  ): Promise<Object> {
    return this.getCall('/prepareSignature/contract/' + contractId,
      {
        fullName,
        accessToken
      }
    );
  }

    async getAccessToken(
        contractId: string
    ): Promise<Object> {
        return this.getCall('/contract/token/' + contractId);
    }

  async signContract(
    contractId: string,
    fullName: string,
    accessToken: ?string
  ): Promise<Object> {
    return this.getCall('/sign/contract/' + contractId,
      {
        fullName,
        accessToken
      }
    );
  }

  async loadContractStatus(
    contractId: string,
    accessToken: ?string
  ): Promise<Object> {
    return this.getCall('/contract/sign/status',
      {
        id: contractId,
        accessToken
      }
    ).then(result => result.data);
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
    return this.postCall('/send/contract',
      {
        readonlyEmails,
        editEmails,
        id
      }
    );
  }

  async changeEthereumNetwork(name: string): Promise<Object> {
    return this.getCall('/ethereum/changeEthereumNetwork/' + name);
  }

  async getCurrentNetwork() {
    return this.getCall('/network')
      .then(response => response.data);
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
    return this.getCall('/templates/version',
      {
        title,
        pageSize,
        page,
      },
    ).then(response => response.data);
  }

  async getDraftVersions(
    draftId: string,
    pageSize: number,
    page: number,
    accessToken:?string
  ): Promise<Array<Template>> {
    return this.getCall('/drafts/version',
      {
        draftId,
        pageSize,
        page,
        accessToken
      },
    ).then(response => response.data);
  }

  async getTemplate(title: string): Promise<Object> {
    return this.getCall('/template/raw/' + title)
      .then(response => response.data);
  }

  async getTemplateVersion(
    title: string,
    version: string,
  ): Promise<string> {
    return this.getCall('/template/raw/' + title + '/' + version)
      .then(response => response.data);
  }

  async getDraftVersion(
    draftId: string,
    version: number,
    accessToken:?string
  ): Promise<Object> {
    return this.getCall('/draft/raw/' + draftId + '/' + version, {accessToken})
      .then(response => response.data);
  }

  async getContract(contractId: string, accessToken:?string): Promise<Object> {
    return this.getCall('/contract/raw/' + contractId, {accessToken})
      .then(response => response.data);
  }

  async searchUsers(keyword: string, page: number, pageSize: number) {
    return this.getCall('/users/search',
      {
        keyword,
        page,
        pageSize
      }
    ).then(response => response.data);
  }

  async deleteUser(userId: string) {
    return this.getCall('/users/delete', {userId})
      .then(response => response.data);
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
    return this.getCall('/templates/search',
      {
        keyword,
        page,
        pageSize,
      },
    ).then(response => response.data);
  }

  async searchDeletedTemplates(
    keyword: string,
    page: number,
    pageSize: number,
  ) {
    return this.getCall('/templates/searchDeleted',
      {
        keyword,
        page,
        pageSize,
      },
    ).then(response => response.data);
  }

  async deleteTemplate(name: string) {
    return this.getCall('/templates/delete', {name});
  }

  async restoreTemplate(name: string) {
    return this.getCall('/templates/restore', {name});
  }

  async renameTemplate(oldName: string, newName: string) {
    return this.getCall('/templates/rename',
      {
        name: oldName,
        newName,
      },
    );
  }

  async sendTxHash(contractId: string, network: string, txHash: string, accessToken:?string) {
    return this.getCall('/contract/signature/sendTxHash',
      {
        contractId,
        network,
        txHash,
        accessToken
      }
    );
  }

  async changeContractAlias(contractId: string, newName: string) {
    return this.getCall('/contract/alias/' + contractId,
      {
        contractId,
        newName,
      },
    );
  }

  async changeDraftAlias(draftId: string, newName: string) {
    return this.getCall('/draft/alias/' + draftId,
      {
        draftId,
        newName,
      },
    );
  }

  async searchContracts(
    keyword: string,
    page: number,
    pageSize: number,
    sortBy: string,
  ) {
    return this.getCall('/contracts/search',
      {
        keyword,
        page,
        pageSize,
        sortBy,
      },
    ).then(response => response.data);
  }

  async searchDrafts(
    keyword: string,
    page: number,
    pageSize: number,
    sortBy: string,
  ) {
    return this.getCall('/drafts/search',
      {
        keyword,
        page,
        pageSize,
        sortBy,
      },
    ).then(response => response.data);
  }

  async searchAddress(term: string) {
    return this.getCall('/address/search', {term})
      .then(response => response.data);
  }

  async getUserDetails(email: string) {
    return this.getCall('/user/details', {email})
      .then(response => response.data);
  }

  async getAddressDetails(placeId: string) {
    return this.getCall('/address/details', {placeId})
      .then(response => response.data);
  }

  async getStripeAccounts() {
    return this.getCall('/user/getStripeAccounts')
      .then(response => response.data);
  }

  async getCommunityActivity(
    filter: string,
    page: number,
    pageSize: number,
  ) {
    return this.getCall('/recentActivity',
      {
        filter,
        page,
        pageSize,
      },
    ).then(response => response.data);
  }

  async downloadAsDocx(params: Object) {
    const data = JSON.stringify(params);
    return this.postCall('/download/contract/docx', {data})
      .then(response => {
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
        // $FlowFixMe
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  }

  async downloadAsPdf(params: Object) {
    const data = JSON.stringify(params);
    return this.postCall('/download/contract/pdf', {data})
      .then(response => {
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
        // $FlowFixMe
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  }

  async downloadTemplateAsJson(title: string) {
    return this.getCall('/templates/json/' + title)
      .then(response => {
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
        // $FlowFixMe
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  }

  async downloadDraftAsJson(draftId: string) {
    return this.getCall('/draft/json/' + draftId)
      .then(response => {
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
        // $FlowFixMe
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  }

  async downloadContractAsDocx(contractId: string) {
    return this.getCall('/contract/docx/' + contractId)
      .then(response => {
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
        // $FlowFixMe
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  }

  async downloadContractAsPdf(contractId: string) {
    return this.getCall('/contract/pdf/' + contractId)
      .then(response => {
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
        // $FlowFixMe
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  }

  async downloadContractAsJson(contractId: string) {
    return this.getCall('/contract/json/' + contractId)
      .then(response => {
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
        // $FlowFixMe
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  }

}
