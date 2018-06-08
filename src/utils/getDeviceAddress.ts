import * as Alexa from "alexa-sdk";

export async function getDeviceAddress(
  deviceId: string,
  token: string,
  apiEndpoint: string
) {
  const das = new Alexa.services.DeviceAddressService();
  const data = await das.getFullAddress(deviceId, apiEndpoint, token);

  return data;
}
