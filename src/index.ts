const Alexa = require("alexa-sdk");
import { getDeparturesByQuayId } from "entur-departures";

const METRO_QUAY_ID = process.env.METRO_QUAY_ID;
const BUS_QUAY_ID = process.env.BUS_QUAY_ID;

const minutesBetween = (date1, date2) =>
  Math.floor((date1 - date2) / (1000 * 60));

const pluralOrSingular = (phrase, n) => `${phrase}${n !== 1 ? "s" : ""}`;

const getQuayIdFromSlot = (slot: string) => {
  if (slot === "metro") {
    return METRO_QUAY_ID;
  } else if (slot === "bus") {
    return BUS_QUAY_ID;
  } else {
    return null;
  }
};

const handlers = {
  async GetDeparturesIntent() {
    const intentObj = this.event.request.intent;
    if (
      intentObj.slots.transportType.value &&
      getQuayIdFromSlot(intentObj.slots.transportType.value)
    ) {
        const transportMode = intentObj.slots.transportType.value;
      const quayId = getQuayIdFromSlot(transportMode);
      try {
        const quayInfo = await getDeparturesByQuayId(quayId, 1);

        const now = new Date();

        const minutesTillNextDeparture = minutesBetween(
          new Date(quayInfo.quay.estimatedCalls[0].expectedDepartureTime),
          new Date()
        );

          const message = `The next ${transportMode} departs in ${
          minutesTillNextDeparture
        } ${pluralOrSingular("minute", minutesTillNextDeparture)}.`;

        this.emit(":tell", message);
      } catch (err) {
        this.emit(
          ":tell",
          "I'm sorry: There was an error retrieving subway departure times."
        );
      }
    } else {
        console.log(intentObj);
        this.emit(":tell", "I'm sorry, I could not determine which transport type you were referring to.");
    }
  }
};

exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = process.env.SKILL_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
