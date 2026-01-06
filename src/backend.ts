import { PluginSDK } from '@micropress/plugin-sdk';

export async function listGalleries(event: any, sdk: PluginSDK) {
  const galleries = await sdk.listData('gallery-');
  return { statusCode: 200, body: JSON.stringify({ galleries }) };
}

export async function getGallery(event: any, sdk: PluginSDK) {
  const { id } = event.pathParameters;
  const gallery = await sdk.getData(`gallery-${id}`);
  
  if (!gallery) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  }
  return { statusCode: 200, body: JSON.stringify(gallery) };
}
