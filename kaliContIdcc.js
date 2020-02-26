import DilaApiClient from "@socialgouv/dila-api-client";

const dilaApi = new DilaApiClient();

dilaApi
  .fetch({
    path: "consult/kaliContIdcc",
    method: "POST",
    params: {
      id: "1043"
    }
  })
  .then(data => console.log(JSON.stringify(data, 0, 2)))
  .catch(console.error);
