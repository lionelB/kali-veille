import DilaApiClient from "@socialgouv/dila-api-client";

const dilaApi = new DilaApiClient();

// fetch list of CC given its idcc
const data = dilaApi
  .fetch({
    path: "consult/kaliCont",
    method: "POST",
    params: {
      id: "KALICONT000005635421" // idcc 1505
    }
  })
  .then(data => console.log(JSON.stringify(data, 0, 2)))
  .catch(console.error);
