const app = require("./app");
const supertest = require("supertest");

test ("index.html 경로에 요청했을 때 status 코드가 200이어야 한다", async () => {
    const res = await supertest(app).get("/api/article");
    expect ((res.status).toEqual(200));
})

//  test("/test/html 경로에 요청했을 때 status 코드가 404여야 한다.", () => {

//  }

// )
