const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Routing test', function() {
    let _id = '';
    // #1
    test('create an issue with every field', function(done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'test',
          issue_text: 'abc123',
          created_by: 'Joe',
          assigned_to: 'Jill',
          status_text: 'In QA'
        })
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.issue_title, 'test');
          assert.equal(res.body.issue_text, 'abc123');
          assert.equal(res.body.created_by, 'Joe');
          assert.equal(res.body.assigned_to, 'Jill');
          assert.equal(res.body.status_text, 'In QA');
          assert.isAtMost(new Date(res.body.created_on), new Date());
          assert.isAtMost(new Date(res.body.updated_on), new Date());
          assert.isTrue(res.body.open);
          
          _id = res.body._id;
          done();
        });
    });

    // #2
    test('create an issue with only required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'test',
          issue_text: 'abc123',
          created_by: 'Joe',
          assigned_to: '',
          status_text: ''
        })
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.issue_title, 'test');
          assert.equal(res.body.issue_text, 'abc123');
          assert.equal(res.body.created_by, 'Joe');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.isAtMost(new Date(res.body.created_on), new Date());
          assert.isAtMost(new Date(res.body.updated_on), new Date());
          assert.isTrue(res.body.open);
          done();
        });
    });

    // #3
    test('create an issue with missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: '',
          issue_text: '',
          created_by: '',
          assigned_to: 'Ardecy',
          status_text: 'In QA'
        })
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });

    // #4
    test('view issues on a project', function(done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'updated_on');
          done();
        });  
    });

    // #5
    test('view issues on a project with one filter', function(done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({open: true})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.notEqual(res.body[0].open, false);
          done();
        });
    });

    // #6
    test('view issues on a project with multiple filters', function(done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({open: true, assigned_to: 'Jill'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.notEqual(res.body[0].open, false);
          assert.equal(res.body[0].assigned_to, 'Jill');
          done();
        });
    });

    // #7
    test('update one field on an issue', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({_id: _id, issue_title: 'Project X'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, _id);
          done();
        });
    });

    // #8
    test('update multiple fields on an issue', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({_id: _id, issue_title: 'Project XX', issue_text: 'rename project', status_text: 'updated', assigned_to: 'Jack'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, _id);
          done();
        });
    });

    // #9
    test('update an issue with missing _id', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({issue_title: 'Project XX', issue_text: 'rename project', status_text: 'updated', assigned_to: 'Jack'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    // #10
    test('update an issue with no fields to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({_id: _id})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, _id);
          done();
        });
    });

    // #11
    test('update an issue with an invalid _id', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({_id: 'abc123', issue_text: 'test'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, 'abc123');
          done();
        });
    });

    // #12
    test('delete an issue', function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({_id: _id})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, _id);
          done();
        });        
    });

    // #13
    test('delete an issue with an invalid _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({_id: 'abc123'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    // #14
    test('delete an issue with missing _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({_id: ''})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});

