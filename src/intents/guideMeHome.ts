import * as R from "ramda";
import { simpleJourneyPlanner } from "entur-departures";

import { convertAddressToCoordinates } from "../utils/convertAddressToCoordinates";
import { getDeviceAddress } from "../utils/getDeviceAddress";
import { minutesBetween } from "../utils/date-utils";

// TODO: Make this configurable
const HOME_ID = process.env.METRO_QUAY_ID;

const findFirstNonFootLeg = R.find(R.complement(R.propEq("mode", "foot")));

export async function GuideMeHomeIntent() {
  // TODO: Use the Address API to obtain the address
  try {
    if (this.event.context.System.user.permissions) {
      const token = this.event.context.System.user.permissions.consentToken;
      const apiEndpoint = this.event.context.System.apiEndpoint;
      const deviceId = this.event.context.System.device.deviceId;

      const {
        addressLine1: address,
        city,
        countryCode,
        postalCode
      } = await getDeviceAddress(deviceId, token, apiEndpoint);
      const coordinates = await convertAddressToCoordinates(
        address,
        city,
        countryCode,
        postalCode
      );

      console.log(`Coordinates: ${coordinates}`);

      const fromPlace = { name: "FINNs kontor", coordinates };
      const toPlace = { name: "Munkelia T", place: "NSR:Quay:10667" };

      const startTime = new Date();
      const data = await simpleJourneyPlanner(fromPlace, toPlace, startTime);
      const tripPatterns = data.trip.tripPatterns;

      if (tripPatterns.length === 0) {
        throw new Error("No trip suggestions found");
      } else {
        const firstTrip = tripPatterns[0];

        const leg = findFirstNonFootLeg(firstTrip.legs);

        const message = `In order to get home, take the number ${
          leg.line.publicCode
        } ${leg.mode} towards ${
          leg.fromEstimatedCall.destinationDisplay.frontText
        }. It leaves from ${leg.fromPlace.name} in ${minutesBetween(
          new Date(leg.aimedStartTime).getTime(),
          Date.now()
        )} minutes.`;

        this.emit(":tell", message);
      }
    } else {
      this.emit(":tell", "I need access to the device address!");
    }
  } catch (err) {
    console.error(err);
    this.emit(
      ":tell",
      "I'm sorry: I was unable to plan your journey home. I guess you are on your own. Good luck to you!"
    );
  }
}
