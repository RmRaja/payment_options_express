'use strict';
const request = require('supertest');
const expect = require('chai').expect;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  /**
   * Mocha test to check app health
   */
  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  /**
   * Mocha test to test RIDES_NOT_FOUND_ERROR
   */
  describe('GET /rides', () => {
    it('Get Rides returns 404', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect(404, done)
        .expect((res) => {
          expect(res.body?.error_code).to.equal('RIDES_NOT_FOUND_ERROR');
          expect(res.body?.message).to.equal('Could not find any rides');
        });
    });
  });

  /**
   * Mocha test to create ride with valid data
   */
  describe('POST /rides', () => {
    it('Create Ride returns 200', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 2,
          end_lat: 3,
          end_long: 4,
          rider_name: 'test',
          driver_name: 'test',
          driver_vehicle: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  /**
   *  mocha test to create ride with invalid start latitude
   */
  describe('POST /rides', () => {
    it('Create Ride with Invalid Start Latitute returns 422', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 91,
          start_long: 2,
          end_lat: 3,
          end_long: 4,
          rider_name: 'test',
          driver_name: 'test',
          driver_vehicle: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect((res) => {
          expect(res.body?.error_code).to.equal('VALIDATION_ERROR');
          expect(res.body?.message).to.equal(
            'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          );
        });
    });
  });

  /**
   * Mocha test to create ride with invalid end longitude
   */
  describe('POST /rides', () => {
    it('Create Ride with invalid end longitute returns 400', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 2,
          end_lat: 3,
          end_long: 181,
          rider_name: 'test',
          driver_name: 'test',
          driver_vehicle: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect((res) => {
          expect(res.body?.error_code).to.equal('VALIDATION_ERROR');
          expect(res.body?.message).to.equal(
            'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          );
        });
    });
  });

  /**
   * Mocha test to create ride with invalid rider name
   */
  describe('POST /rides', () => {
    it('Create Ride with invalid rider name returns 400', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 2,
          end_lat: 3,
          end_long: 4,
          rider_name: '',
          driver_name: 'test',
          driver_vehicle: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect((res) => {
          expect(res.body?.error_code).to.equal('VALIDATION_ERROR');
          expect(res.body?.message).to.equal(
            'Rider name must be a non empty string'
          );
        });
    });
  });

  /**
   * Mocha test to create ride with invalid driver name
   */
  describe('POST /rides', () => {
    it('Create Ride with invalid rider name returns 400', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 2,
          end_lat: 3,
          end_long: 4,
          rider_name: 'Raja',
          driver_name: '',
          driver_vehicle: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect((res) => {
          expect(res.body?.error_code).to.equal('VALIDATION_ERROR');
          expect(res.body?.message).to.equal(
            'Driver name must be a non empty string'
          );
        });
    });
  });

  /**
   * Mocha test to create ride with invalid driver vechicle
   */
  describe('POST /rides', () => {
    it('Create Ride with invalid driver vehicle returns 400', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 2,
          end_lat: 3,
          end_long: 4,
          rider_name: 'Raja',
          driver_name: 'Raja',
          driver_vehicle: 123,
        })
        .expect('Content-Type', /json/)
        .expect(400, done)
        .expect((res) => {
          expect(res.body?.error_code).to.equal('VALIDATION_ERROR');
          expect(res.body?.message).to.equal(
            'Driver vehicle name must be a non empty string'
          );
        });
    });
  });

  /**
   * Mocha test to get all rides
   */
  describe('GET /rides', () => {
    it('Get Rides List', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  /**
   * Mocha test to get rides with pagination
   */
  describe('GET /rides/page/1', () => {
    it('Get Rides List with pagination', (done) => {
      request(app)
        .get('/rides/page/1')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect((res) => {
          expect(res.body?.length).to.equal(1);
        });
    });
    expect();
  });

  /**
   * Mocha test to get a ride by id
   */
  describe('GET /rides/:id', () => {
    it('Get Ride By Id', (done) => {
      request(app)
        .get('/rides/1')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  /**
   * Mocha test to get a ride by id with invalid id
   */
  describe('GET /rides/:id', () => {
    it('Get Ride By Invalid Id', (done) => {
      request(app)
        .get('/rides/abc')
        .expect('Content-Type', /json/)
        .expect(404, done);
    });
  });
});
