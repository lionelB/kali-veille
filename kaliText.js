const DilaApiClient = require("@socialgouv/dila-api-client");

const dilaApi = new DilaApiClient();

// fetch list of CC given its idcc
dilaApi
  .fetch({
    path: "consult/kaliText",
    method: "POST",
    params: {
      id: "KALITEXT000023759095"
    }
  })
  .then(data => console.log(JSON.stringify(data, 0, 2)))
  .catch(console.error);
