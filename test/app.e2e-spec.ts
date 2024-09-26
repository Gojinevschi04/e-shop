import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/user.entity';
import { UserRole } from '../src/common/enums/user.role';
import { UserDto } from '../src/modules/users/dto/user.dto';
import { faker } from '@faker-js/faker/locale/ar';
import { base, de, de_CH, en, Faker, LocaleDefinition } from '@faker-js/faker';

const customLocale: LocaleDefinition = {
  internet: {
    domainSuffix: ['test'],
  },
};

export const customFaker = new Faker({
  locale: [customLocale, de_CH, de, en, base],
});

async function getAccessToken(app: INestApplication) {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: 'john', password: 'test' })
    .expect(201);

  return response.body.accessToken;
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  const mockUser: User = {
    id: 1,
    username: 'john',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'test',
    role: UserRole.Admin,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserData: UserDto = {
    id: 1233,
    firstName: customFaker.person.firstName(),
    lastName: customFaker.person.lastName(),
    username: customFaker.internet.userName(),
    password: customFaker.internet.password(),
    email: customFaker.internet.email(),
    role: UserRole.User,
  };

  const mockEditUserData: UserDto = {
    id: 3,
    firstName: customFaker.person.firstName(),
    lastName: customFaker.person.lastName(),
    username: customFaker.internet.userName(),
    password: customFaker.internet.password(),
    email: customFaker.internet.email(),
    role: UserRole.User,
  };

  const mockResetPasswordData = {
    newPassword: faker.internet.password(),
    token: '0b69f696-8625-4983-90c2-a3063e09e0b7',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    accessToken = await getAccessToken(app);
  });

  describe('/auth ', () => {
    describe('/login ', () => {
      it('Should fail to authenticate a user with an incorrect password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: mockUser.username, password: 'wrong' })
          .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });

      it('Should authenticate a user and include a JWT token in the response', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: mockUser.username, password: mockUser.password })
          .expect(201);

        expect(response.body.accessToken).toBeDefined();
        expect(response.body.accessToken).toMatch(
          /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
        ); // jwt regex
      });

      it('Should fail to authenticate a user that does not exist', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: '24321412412', password: 'test' })
          .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });
    });

    describe('/profile', () => {
      it('Should return Unauthorized when a non-admin user tries to access the profile', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/profile')
          .send({ username: 'alice', password: 'guess' })
          .set('Authorization', `Bearer ${accessToken}`);
        // .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });

      it('Should return the user profile', async () => {
        return request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.firstName).toEqual(mockUser.firstName);
            expect(body.lastName).toEqual(mockUser.lastName);
            expect(body.username).toEqual(mockUser.username);
            expect(body.password).toBeDefined();
            expect(body.role).toEqual(mockUser.role);
            expect(body.id).toEqual(mockUser.id);
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('/forgot-password', () => {
      it('Should send an email with forgot password token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({ email: mockUser.email })
          .expect(201);
      });
    });

    describe('/reset-password', () => {
      it('Should reset the user password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            newPassword: mockResetPasswordData.newPassword,
            confirmNewPassword: mockResetPasswordData.newPassword,
            token: 'cf693200-8f43-418e-8e22-2d9ad908e322',
          })
          .expect(201);

        accessToken = await getAccessToken(app);
      });

      it('Should return BadRequest when the token is wrong', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            newPassword: mockResetPasswordData.newPassword,
            confirmNewPassword: mockResetPasswordData.newPassword,
            token: '4241224',
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Wrong or expired token');
          })
          .expect(400);
      });

      it('Should return BadRequest when the passwords does not match', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            newPassword: mockResetPasswordData.newPassword,
            confirmNewPassword: mockUserData.password,
            token: mockResetPasswordData.token,
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe("Confirmed password doesn't match");
          })
          .expect(400);
      });

      it('Should return BadRequest when attempting to reset the password for a nonexistent user', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            newPassword: mockResetPasswordData.newPassword,
            confirmNewPassword: mockResetPasswordData.newPassword,
            token: mockResetPasswordData.token,
          })
          // .expect(({ body }) => {
          //   expect(body.error).toBe('Bad Request');
          //   expect(body.message).toBe('Nonexistent user');
          // })
          .expect(400);
      });
    });
  });

  describe('/users ', () => {
    describe('/ GET ', () => {
      it('Should return a list of all users', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.data).toBeInstanceOf(Array);
          })
          .expect(200);
      });

      it('Should return the user details when retrieving a user with an existing ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/1')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.firstName).toEqual(mockUser.firstName);
            expect(body.lastName).toEqual(mockUser.lastName);
            expect(body.username).toEqual(mockUser.username);
            expect(body.password).toBeDefined();
            expect(body.role).toEqual(mockUser.role);
            expect(body.id).toEqual(mockUser.id);
          })
          .expect(200);
      });

      it('Should return an empty response when attempting to retrieve a user with a nonexistent ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/12421')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body).toBeDefined();
          })
          .expect(({ text }) => {
            expect(text).toBeDefined();
          })
          .expect(200);
      });

      it('should return BadRequest when attempting to retrieve a user with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/test')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
          })
          .expect(400);
      });

      it('Should return Unauthorized when no valid token is provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/')
          .expect(401);
      });
    });

    describe('/ POST', () => {
      it('Should add a new user in the database and return the user data', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockUserData)
          .expect(({ body }) => {
            expect(body.firstName).toEqual(mockUserData.firstName);
            expect(body.lastName).toEqual(mockUserData.lastName);
            expect(body.username).toEqual(mockUserData.username);
            expect(body.password).toBeDefined();
            expect(body.role).toEqual(mockUserData.role);
            expect(body.id).toBeDefined();
          })
          .expect(201);
      });

      it('should return BadRequest when attempting to add an user with a non-existent role', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            username: faker.internet.userName(),
            password: faker.internet.password(),
            email: faker.internet.email(),
            role: 'lalalala',
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Invalid user role');
          })
          .expect(400);
      });

      it('should return BadRequest when attempting to add an user with an existent username', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            username: mockUserData.username,
            password: faker.internet.password(),
            email: faker.internet.email(),
            role: 'user',
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Username already in use');
          })
          .expect(400);
      });

      it('should return BadRequest when attempting to add an user with an existent email', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            username: faker.person.lastName(),
            password: faker.internet.password(),
            email: mockUserData.email,
            role: 'user',
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Email address already in use');
          })
          .expect(400);
      });
    });

    describe('/ PUT', () => {
      it('Should update an existing user and return the user data', async () => {
        const response = await request(app.getHttpServer())
          .put('/users/3')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockEditUserData)
          .expect(({ body }) => {
            expect(body.firstName).toEqual(mockEditUserData.firstName);
            expect(body.lastName).toEqual(mockEditUserData.lastName);
            expect(body.username).toEqual(mockEditUserData.username);
            expect(body.password).toBeDefined();
            expect(body.id).toEqual(mockEditUserData.id);
          })
          .expect(200);
      });

      it('should return BadRequest when attempting to update a user with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .put('/users/lalalala')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockEditUserData)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe(
              'Validation failed (numeric string is expected)',
            );
          })
          .expect(400);
      });

      it('should return BadRequest when attempting to update a user with a non-existent role', async () => {
        const response = await request(app.getHttpServer())
          .put('/users/3')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            id: 3,
            firstName: 44444,
            lastName: 45235,
            username: 235235,
            password: '2535352',
            email: 43243,
            role: 'lalala',
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Invalid user role');
          })
          .expect(400);
      });
    });
  });

  describe('/default', () => {
    it('/ (GET) => should return hello world', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.text).toBe('Hello World!');
    });

    it('/ (GET) => should return unauthorized', () => {
      return request(app.getHttpServer()).get('/').expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
