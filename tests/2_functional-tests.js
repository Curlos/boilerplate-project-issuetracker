const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id1 = "";
let id2 = "";

suite('Functional Tests', function() {
  suite("POST /api/issues/{project} => object with issue data", () => {
      test("Every field filled in", (done) => {
        chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in",
          assigned_to: "Chai and Mocha",
          status_text: "In QA"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(
            res.body.created_by,
            "Functional Test - Every field filled in"
          );
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "In QA");
          assert.equal(res.body.project_name, "apitest");
          id1 = res.body._id;
          console.log("id 1 has been set as " + id1);
          done();
        });
      })

      test("only required fields filled in", (done) => {
        chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Only required fields filled in",
          assigned_to: "",
          status_text: ""
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(
            res.body.created_by,
            "Functional Test - Only required fields filled in"
          );
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.equal(res.body.project_name, "apitest");

          id2 = res.body._id;
          console.log("id 2 has been set as " + id2);
          done();
        });
      })

      test("Missing required fields", (done) => {
        chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "",
          issue_text: "",
          created_by: "",
          assigned_to: "Chai and Mocha",
          status_text: "In QA"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, '');
          done();
        });
      })
  })

  suite("GET /api/issues/{project} => Array of objects with issue data", () => {
      test("View issues on a project", (done) => {
        chai
        .request(server)
        .get("/api/issues/apitest")
        .query({})
        .end(function(err, res) {
            assert.property(res.body[0], "issue_title");
            assert.property(res.body[0], "issue_text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "updated_on");
            assert.property(res.body[0], "created_by");
            assert.property(res.body[0], "assigned_to");
            assert.property(res.body[0], "open");
            assert.property(res.body[0], "status_text");
            assert.property(res.body[0], "_id");
            done();
        });
      })

      test("View issues on a project with one filter", (done) => {
        chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ created_by: "Functional Test - Every field filled in" })
        .end(function(err, res) {
            res.body.forEach(issueResult => assert.equal(issueResult.created_by, 
            "Functional Test - Every field filled in"));
            done();
        });
      })

      test("View issues on a project with multiple filters", (done) => {
        chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ created_by: "Bill Gates", issue_title: "COVID21"})
        .end(function(err, res) {
            res.body.forEach(issueResult => {
                assert.equal(issueResult.created_by, "Bill Gates");
                assert.equal(issueResult.issue_title, "COVID21");
            })
            done();
        });
      })
  })
  suite("PUT /api/issues/{project} => text", () => {
    test("Update one field on an issue", function(done) {
        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            _id: id1,
            issue_text: "new text"
            })
          .end(function(err, res) {
            assert.equal(res.body.result, "successfully updated");
            done();
          });
    });

    test("Update multiple fields on an issue", function(done) {
        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            _id: id1,
            issue_title: "COVID21",
            issue_text: "Deadly kung flu",
            created_by: "Bill Gates"
          })
          .end(function(err, res) {
            assert.equal(res.body.result, "successfully updated");
            done();
          });
    });

    test("Update an issue with missing _id", function(done) {
        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            issue_title: "COVID21",
            issue_text: "Deadly kung flu",
            created_by: "Bill Gates"
          })
          .end(function(err, res) {
            assert.equal(res.body.error, 'missing _id');
            done();
          });
    });

    test("Update an issue with no fields to update", function(done) {
        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
              _id: id2
          })
          .end(function(err, res) {
              assert.equal(res.body.error, 'no update field(s) sent');
            done();
          });
    });

    test("Update an issue with an invalid _id", function(done) {
        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            _id: '611849125b91fe9b78227f8f',
            issue_title: "COVID21",
            issue_text: "Deadly kung flu",
            created_by: "Bill Gates"
          })
          .end(function(err, res) {
            assert.equal(res.body.error, "could not update");
            done();
          });
    });
  
  })

  suite("DELETE /api/issues/{project} => test", () => {
    test("Delete an issue", function(done) {
        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({
              _id: id1
            })
          .end(function(err, res) {
            assert.equal(res.body.result, 'successfully deleted');
            done();
        });
    });

    test("Delete an issue with an invalid _id", function(done) {
        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({
              _id: '6012735625491da6ebc51d7f'
            })
          .end(function(err, res) {
            assert.equal(res.body.error, 'could not delete');
            done();
        });
    });

    test("Delete an issue with missing _id", function(done) {
        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({})
          .end(function(err, res) {
            assert.equal(res.body.error, 'missing _id');
            done();
        });
    });
  })
});
