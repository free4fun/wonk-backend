import assert from 'assert';
import { createServer } from 'http';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import { connectDB } from '../../src/config/database.js';
import User from '../../src/models/userModel.js';
import Cafe from '../../src/models/cafeModel.js';

const baseURL = 'http://localhost';
let server;
let port;

describe('API Integration Tests', function() {
  let testUser;
  let authToken;

  before(async function() {
    this.timeout(10000); // Aumentar el tiempo de espera si es necesario
    await connectDB();
    server = createServer(app);
    await new Promise(resolve => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  beforeEach(async function() {
    await User.deleteMany({});
    await Cafe.deleteMany({});
  
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    authToken = testUser.generateAuthToken();
  });

  after(async function() {
    await mongoose.connection.close();
    await new Promise(resolve => server.close(resolve));
  });

  describe('Authentication', function() {
    it('should register a new user', async function() {
      const response = await fetch(`${baseURL}:${port}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123'
        })
      });

      assert.strictEqual(response.status, 201);
      const body = await response.json();
      assert(body.token);
      assert(body.user);
      assert.strictEqual(body.user.username, 'newuser');
      assert.strictEqual(body.user.email, 'newuser@example.com');
    });

    it('should not register a user with an existing email', async function() {
      const response = await fetch(`${baseURL}:${port}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'anotheruser',
          email: 'test@example.com',
          password: 'password123'
        })
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert(body.message.includes('Email already exists'));
    });

    it('should login an existing user', async function() {
      const response = await fetch(`${baseURL}:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert(body.token);
      assert(body.user);
      assert.strictEqual(body.user.email, 'test@example.com');
    });

    it('should not login with incorrect credentials', async function() {
      const response = await fetch(`${baseURL}:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert(body.message.includes('Invalid credentials'));
    });
  });

  describe('Cafe API', function() {
    it('should create a new cafe', async function() {
      const cafeData = {
        name: 'Test Cafe',
        address: '123 Test St',
        phone: '1234567890',
        menu: ['Coffee', 'Tea'],
        openingHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: '10:00', close: '16:00' }
        },
        longitude: -73.9857,
        latitude: 40.7484,
        schedule: [
          { day: 'Monday', open: '09:00', close: '18:00' },
          { day: 'Tuesday', open: '09:00', close: '18:00' }
        ]
      };

      const response = await fetch(`${baseURL}:${port}/api/cafes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(cafeData)
      });

      assert.strictEqual(response.status, 201);
      const body = await response.json();
      assert.strictEqual(body.name, 'Test Cafe');
      assert.strictEqual(body.address, '123 Test St');
      assert.strictEqual(body.phone, '1234567890');
      assert.deepStrictEqual(body.menu, ['Coffee', 'Tea']);
      assert.strictEqual(body.longitude, -73.9857);
      assert.strictEqual(body.latitude, 40.7484);
    });

    it('should not create a cafe with missing required fields', async function() {
      const incompleteCafeData = {
        name: 'Incomplete Cafe',
        address: '456 Incomplete St'
        // Missing other required fields
      };

      const response = await fetch(`${baseURL}:${port}/api/cafes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(incompleteCafeData)
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert(body.error.includes('Validation failed'));
      assert(body.details.hasOwnProperty('phone'), 'Should have error for missing phone');
      assert(body.details.hasOwnProperty('latitude'), 'Should have error for missing latitude');
      assert(body.details.hasOwnProperty('longitude'), 'Should have error for missing longitude');
    });

    it('should get all cafes', async function() {
      const cafe = new Cafe({
        name: 'Test Cafe',
        address: '123 Test St',
        phone: '1234567890',
        menu: ['Coffee', 'Tea'],
        openingHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: '10:00', close: '16:00' }
        },
        createdBy: testUser._id,
        longitude: -73.9857,
        latitude: 40.7484,
        schedule: [
          { day: 'Monday', open: '09:00', close: '18:00' },
          { day: 'Tuesday', open: '09:00', close: '18:00' }
        ]
      });
      await cafe.save();

      const response = await fetch(`${baseURL}:${port}/api/cafes`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert(Array.isArray(body));
      assert.strictEqual(body.length, 1);
      assert.strictEqual(body[0].name, 'Test Cafe');
    });

    it('should get a specific cafe by ID', async function() {
      const cafe = new Cafe({
        name: 'Specific Cafe',
        address: '789 Specific St',
        phone: '9876543210',
        menu: ['Espresso', 'Latte'],
        openingHours: {
          monday: { open: '08:00', close: '20:00' },
          tuesday: { open: '08:00', close: '20:00' },
          wednesday: { open: '08:00', close: '20:00' },
          thursday: { open: '08:00', close: '20:00' },
          friday: { open: '08:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '18:00' }
        },
        createdBy: testUser._id,
        longitude: -74.0060,
        latitude: 40.7128,
        schedule: [
          { day: 'Monday', open: '08:00', close: '20:00' },
          { day: 'Tuesday', open: '08:00', close: '20:00' }
        ]
      });
      await cafe.save();

      const response = await fetch(`${baseURL}:${port}/api/cafes/${cafe._id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert.strictEqual(body.name, 'Specific Cafe');
      assert.strictEqual(body.address, '789 Specific St');
    });

    it('should update a cafe', async function() {
      const cafe = new Cafe({
        name: 'Old Cafe Name',
        address: '123 Old St',
        phone: '1234567890',
        menu: ['Coffee'],
        openingHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '10:00', close: '15:00' },
          sunday: { open: '10:00', close: '15:00' }
        },
        createdBy: testUser._id,
        longitude: -73.9857,
        latitude: 40.7484,
        schedule: [
          { day: 'Monday', open: '09:00', close: '17:00' },
          { day: 'Tuesday', open: '09:00', close: '17:00' }
        ]
      });
      await cafe.save();

      const updatedData = {
        name: 'New Cafe Name',
        address: '456 New St',
        menu: ['Coffee', 'Tea', 'Pastries']
      };

      const response = await fetch(`${baseURL}:${port}/api/cafes/${cafe._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updatedData)
      });

      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert.strictEqual(body.name, 'New Cafe Name');
      assert.strictEqual(body.address, '456 New St');
      assert.deepStrictEqual(body.menu, ['Coffee', 'Tea', 'Pastries']);
    });

    it('should delete a cafe', async function() {
      const cafe = new Cafe({
        name: 'Cafe to Delete',
        address: '999 Delete St',
        phone: '9999999999',
        menu: ['Delete Coffee'],
        openingHours: {
          monday: { open: '00:00', close: '23:59' },
          tuesday: { open: '00:00', close: '23:59' },
          wednesday: { open: '00:00', close: '23:59' },
          thursday: { open: '00:00', close: '23:59' },
          friday: { open: '00:00', close: '23:59' },
          saturday: { open: '00:00', close: '23:59' },
          sunday: { open: '00:00', close: '23:59' }
        },
        createdBy: testUser._id,
        longitude: -73.9857,
        latitude: 40.7484,
        schedule: [
          { day: 'Monday', open: '00:00', close: '23:59' },
          { day: 'Tuesday', open: '00:00', close: '23:59' }
        ]
      });
      await cafe.save();

      const response = await fetch(`${baseURL}:${port}/api/cafes/${cafe._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert.strictEqual(body.error, 'Cafe deleted successfully');

      const deletedCafe = await Cafe.findById(cafe._id);
      assert.strictEqual(deletedCafe, null);
    });

    it('should not allow unauthorized user to create a cafe', async function() {
      const cafeData = {
        name: 'Unauthorized Cafe',
        address: '123 Unauthorized St',
        phone: '1234567890',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const response = await fetch(`${baseURL}:${port}/api/cafes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cafeData)
      });

      assert.strictEqual(response.status, 401);
      const body = await response.json();
      assert(body.error.includes('No token provided'));
    });

    it('should allow user to update a cafe they did not create', async function() {
      const user1 = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123'
      });
    
      const user2 = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      });
      const user2Token = jwt.sign({ _id: user2._id }, process.env.JWT_SECRET);
    
      const cafe = await Cafe.create({
        name: 'Test Cafe',
        description: 'A test cafe',
        latitude: 0,
        longitude: 0,
        createdBy: user1._id,
        phone: '1234567890',
        address: 'Test Address'
      });
    
      const updatedCafe = {
        name: 'Updated Test Cafe',
        description: 'An updated test cafe',
        phone: '0987654321',
        address: 'Updated Address'
      };
    
      const response = await request(app)
        .put(`/api/cafes/${cafe._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(updatedCafe);
    
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.name, 'Updated Test Cafe');
      assert.strictEqual(response.body.description, 'An updated test cafe');
      assert.strictEqual(response.body.phone, '0987654321');
      assert.strictEqual(response.body.address, 'Updated Address');
      // Asegúrate de que los campos que no se actualizaron permanezcan iguales
      assert.strictEqual(response.body.latitude, 0);
      assert.strictEqual(response.body.longitude, 0);
    });
    

    it('should handle non-existent cafe for GET request', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await fetch(`${baseURL}:${port}/api/cafes/${nonExistentId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      assert.strictEqual(response.status, 404);
      const body = await response.json();
      assert(body.error.includes('Cafe not found'));
    });

    it('should handle non-existent cafe for UPDATE request', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await fetch(`${baseURL}:${port}/api/cafes/${nonExistentId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ name: 'Updated Name' })
      });

      assert.strictEqual(response.status, 404);
      const body = await response.json();
      assert(body.error.includes('Cafe not found'));
    });

    it('should handle non-existent cafe for DELETE request', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await fetch(`${baseURL}:${port}/api/cafes/${nonExistentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      assert.strictEqual(response.status, 404);
      const body = await response.json();
      assert(body.error.includes('Cafe not found'));
    });

    it('should not allow updating a cafe with invalid data', async function() {
      const testUser = await User.create({
        username: `testuser_${Date.now()}`,
        email: `testuser_${Date.now()}@example.com`,
        password: 'password123'
      });
      const token = jwt.sign({ _id: testUser._id }, process.env.JWT_SECRET);
    
      const cafe = await Cafe.create({
        name: 'Test Cafe',
        description: 'A test cafe',
        latitude: 0,
        longitude: 0,
        createdBy: testUser._id,
        phone: '1234567890',
        address: 'Test Address'
      });
    
      const invalidCafe = {
        latitude: 'invalid',
        phone: '', // Enviamos un teléfono vacío para probar la validación
      };
    
      const response = await request(app)
        .put(`/api/cafes/${cafe._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidCafe);
    
      assert.strictEqual(response.status, 400);
      assert(response.body.error.includes('Cafe validation failed'), `Error message was: ${response.body.error}`);
      assert(response.body.error.includes('latitude'), 'Error should mention the invalid latitude');
      assert(response.body.error.includes('phone'), 'Error should mention the invalid phone');
    });
    
    

    it('should handle invalid ObjectId for cafe routes', async function() {
      const invalidId = 'notavalidobjectid';
      const response = await fetch(`${baseURL}:${port}/api/cafes/${invalidId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert(body.error.includes('Invalid ID'));
    });
  });

  describe('Error Handling', function() {
    it('should handle 404 for non-existent routes', async function() {
      const response = await fetch(`${baseURL}:${port}/api/nonexistent`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      assert.strictEqual(response.status, 404);
      const body = await response.json();
      assert(body.error.includes('Not Found'));
    });

    it('should handle server errors gracefully', async function() {
      // This test simulates a server error by passing an invalid ObjectId
      const invalidId = 'invalid-id';
      const response = await fetch(`${baseURL}:${port}/api/cafes/${invalidId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert(body.error.includes('Invalid ID'));
    });
  });
});

