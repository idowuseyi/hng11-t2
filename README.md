# HNG TASK 2 - USER AND ORGANIZATION 



describe('Auth Register Endpoint', () => {
  it('Should Register User Successfully with Default Organisation', async () => {
    const response = await request(app).post('/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('firstName', 'John');
    expect(response.body.data.user).toHaveProperty('lastName', 'Doe');
    expect(response.body.data.user).toHaveProperty('email', 'johndoe@example.com');
    expect(response.body.data.user).toHaveProperty('organisation');
    expect(response.body.data.user.organisation).toHaveProperty('name', 'John\'s Organisation');
  });

  it('Should Log the user in successfully', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'johndoe@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('firstName', 'John');
    expect(response.body.data.user).toHaveProperty('lastName', 'Doe');
    expect(response.body.data.user).toHaveProperty('email', 'johndoe@example.com');
  });

  it('Should Fail If Required Fields Are Missing', async () => {
    const response = await request(app).post('/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
    });
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveProperty('email');
    expect(response.body.errors.email).toBe('Email is required');

    const response2 = await request(app).post('/auth/register').send({
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    });
    expect(response2.status).toBe(422);
    expect(response2.body).toHaveProperty('errors');
    expect(response2.body.errors).toHaveProperty('firstName');
    expect(response2.body.errors.firstName).toBe('First Name is required');

    const response3 = await request(app).post('/auth/register').send({
      firstName: 'John',
      email: 'johndoe@example.com',
      password: 'password123',
    });
    expect(response3.status).toBe(422);
    expect(response3.body).toHaveProperty('errors');
    expect(response3.body.errors).toHaveProperty('lastName');
    expect(response3.body.errors.lastName).toBe('Last Name is required');

    const response4 = await request(app).post('/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
    });
    expect(response4.status).toBe(422);
    expect(response4.body).toHaveProperty('errors');
    expect(response4.body.errors).toHaveProperty('password');
    expect(response4.body.errors.password).toBe('Password is required');
  });

  it('Should Fail if there’s Duplicate Email or UserID', async () => {
    const response = await request(app).post('/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toHaveProperty('email');
    expect(response.body.errors.email).toBe('Email already exists');

    const response2 = await request(app).post('/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'janedoe@example.com',
      password: 'password123',
    });
    expect(response2.status).toBe(422);
    expect(response2.body).toHaveProperty('errors');
    expect(response2.body.errors).toHaveProperty('userId');
    expect(response2.body.errors.userId).toBe('User ID already exists');
  });
});

describe('Organisation Endpoint', () => {
  it('Should Not Allow Users to See Data from Organisations They Don’t Have Access To', async () => {
    const response = await request(app).get('/api/organisations').set('Authorization', `Bearer ${token}`);
    expect(response.status).

expect(response.status).toBe(403);
expect(response.body).toHaveProperty('status', 'error');
expect(response.body).toHaveProperty('message', 'You do not have access to this organisation');

const response2 = await request(app).get('/api/organisations/123').set('Authorization', `Bearer ${token}`);
expect(response2.status).toBe(404);
expect(response2.body).toHaveProperty('status', 'error');
expect(response2.body).toHaveProperty('message', 'Organisation not found');
});

it('Should Allow Users to See Data from Organisations They Have Access To', async () => {
const response = await request(app).get('/api/organisations').set('Authorization', `Bearer ${token}`);
expect(response.status).toBe(200);
expect(response.body).toHaveProperty('status', 'success');
expect(response.body).toHaveProperty('data');
expect(response.body.data).toBeAnArray();

const response2 = await request(app).get('/api/organisations/123').set('Authorization', `Bearer ${token}`);
expect(response2.status).toBe(200);
expect(response2.body).toHaveProperty('status', 'success');
expect(response2.body).toHaveProperty('data');
expect(response2.body.data).toHaveProperty('name', 'John's Organisation');
});
});

describe('Token Generation', () => {
it('Should Generate a Token with the Correct User Details', async () => {
const response = await request(app).post('/auth/login').send({
email: 'johndoe@example.com',
password: 'password123',
});
expect(response.status).toBe(200);
expect(response.body).toHaveProperty('status', 'success');
expect(response.body).toHaveProperty('data');
expect(response.body.data).toHaveProperty('accessToken');
expect(response.body.data).toHaveProperty('user');
expect(response.body.data.user).toHaveProperty('firstName', 'John');
expect(response.body.data.user).toHaveProperty('lastName', 'Doe');
expect(response.body.data.user).toHaveProperty('email', 'johndoe@example.com');
});

it('Should Expire the Token at the Correct Time', async () => {
const response = await request(app).post('/auth/login').send({
email: 'johndoe@example.com',
password: 'password123',
});
expect(response.status).toBe(200);
expect(response.body).toHaveProperty('status', 'success');
expect(response.body).toHaveProperty('data');
expect(response.body.data).toHaveProperty('accessToken');
expect(response.body.data).toHaveProperty('expiresIn', 3600); // 1 hour
});
});
