import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/user.entity';
import { UserRole } from '../src/common/enums/user.role';
import { UserDto } from '../src/modules/users/dto/user.dto';

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
    id: 56,
    firstName: 'string',
    lastName: 'string',
    username: 'string',
    password: 'string',
    email: 'example@gmail.com',
    role: UserRole.User,
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
      it('/login => authenticates a user and includes a jwt token in the response', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: mockUser.username, password: 'wrong' })
          .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });

      it('/login => fails to authenticate user with an incorrect password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: mockUser.username, password: mockUser.password })
          .expect(201);

        expect(response.body.accessToken).toBeDefined();
        expect(response.body.accessToken).toMatch(
          /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
        ); // jwt regex
      });

      it('/login => fails to authenticate user that does not exist', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: '24321412412', password: 'test' })
          .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });
    });

    describe('/profile', () => {
      it('/profile => returns unauthorized for non admin user', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/profile')
          .send({ username: 'alice', password: 'guess' })
          .set('Authorization', `Bearer ${accessToken}`);
        // .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });

      it('/profile => returns the user profile', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
        expect(response.body).toBeDefined();

        const { id, firstName, lastName, password, email, imagePath, role } =
          response.body;

        expect(typeof id).toBe('number');
        expect(firstName).toEqual(mockUser.firstName);
        expect(lastName).toEqual(mockUser.lastName);
        expect(email).toEqual(mockUser.email);
        expect(password).toBeDefined();
        expect(role).toEqual('admin');
        expect(response).toBeDefined();
      });
    });
  });

  describe('/users ', () => {
    describe('/ GET ', () => {
      it('', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/')
          // .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });
    });

    describe('/ POST', () => {
      it('', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockUserData)
          .expect(201);
        expect(response.body).toBeDefined();
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
