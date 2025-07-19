import { GraphAuth, graphAuth } from './graph-auth';
import { encodeBase64 } from './base64';

/**
 * Fetch files from Microsoft Graph using an OAuth access token.
 */
export class GraphClient {
  constructor(private readonly auth: GraphAuth = graphAuth) {}

  /**
   * Retrieve a file as an array buffer given its share URL or drive item ID.
   *
   * @param identifier - File URL or item ID.
   * @returns Raw file contents.
   */
  public async fetchFile(identifier: string): Promise<ArrayBuffer> {
    const token = this.auth.getToken();
    if (!token) throw new Error('Graph token unavailable');
    const root = 'https://graph.microsoft.com/v1.0';
    const url = identifier.startsWith('http')
      ? `${root}/shares/u!${encodeBase64(identifier)}/driveItem/content`
      : `${root}/me/drive/items/${identifier}/content`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch workbook');
    return res.arrayBuffer();
  }
}

export const graphClient = new GraphClient();
