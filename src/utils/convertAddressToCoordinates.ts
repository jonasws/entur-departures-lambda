import fetch from "node-fetch";
import { stringify } from "query-string";

const GEOCODER_API_URL = "https://api.entur.org/api/geocoder/1.1/search";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function convertAddressToCoordinates(
  address: string,
  city: string,
  countryCode: string,
  postalCode: string
): Promise<Coordinates | null> {
  const params = {
    text: `${address}, ${postalCode}, ${city}, ${countryCode}`,
    layers: "address",
    size: 1
  };

  const response = await fetch(`${GEOCODER_API_URL}?${stringify(params)}`);
  if (!response.ok) {
    console.log(response);
    throw Error("Something erred somewhere");
  } else {
    const data = await response.json();

    const hits = data.features;

    if (hits.length === 0) {
      throw Error("Unable to geocode the address of the invoking device.");
    } else {
      const [longitude, latitude] = hits[0].geometry.coordinates;
      console.log(hits[0]);
      return { longitude, latitude };
    }
  }
}
