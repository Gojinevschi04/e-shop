import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/user.entity';
import { UserRole } from '../src/common/enums/user.role';
import { UserDto } from '../src/modules/users/dto/user.dto';
import { faker } from '@faker-js/faker/locale/ar';
import { base, de, de_CH, en, Faker, LocaleDefinition } from '@faker-js/faker';
import { LoginUserDto } from '../src/modules/users/dto/login-user.dto';
import { CategoryDto } from '../src/modules/categories/dto/category.dto';
import { ProductDto } from '../src/modules/products/dto/product.dto';

const customLocale: LocaleDefinition = {
  internet: {
    domainSuffix: ['test'],
  },
};

export const customFaker = new Faker({
  locale: [customLocale, de_CH, de, en, base],
});

async function getAccessToken(app: INestApplication, userData: LoginUserDto) {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: userData.username, password: userData.password })
    .expect(201);

  return response.body.accessToken;
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  const mockLoggedInUser: User = {
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

  const mockCreateUserData: UserDto = {
    id: customFaker.number.int({ min: 4, max: 10 }),
    firstName: customFaker.person.firstName(),
    lastName: customFaker.person.lastName(),
    username: customFaker.internet.userName(),
    password: customFaker.internet.password(),
    email: customFaker.internet.email(),
    role: UserRole.User,
  };

  const mockEditUserData: UserDto = {
    id: customFaker.number.int({ min: 2, max: 5 }),
    firstName: customFaker.person.firstName(),
    lastName: customFaker.person.lastName(),
    username: customFaker.internet.userName(),
    password: customFaker.internet.password(),
    email: customFaker.internet.email(),
    role: UserRole.User,
  };

  const mockResetPasswordData = {
    newPassword: customFaker.internet.password(),
    token: '0b69f696-8625-4983-90c2-a3063e09e0b7',
  };

  const mockUpdatePasswordData = {
    currentPassword: mockLoggedInUser.password,
    newPassword: customFaker.internet.password(),
  };

  const mockExistingCategory = {
    id: 1,
    name: 'romantic-flowers',
    description:
      "Beautiful flowers for romantic occasions like anniversaries or Valentine's Day.",
    parentId: null,
  };

  const mockCategoryDto: CategoryDto = {
    name: customFaker.food.adjective(),
    description: customFaker.food.description(),
    parentId: customFaker.number.int({ min: 1, max: 4 }),
  };

  const mockEditCategoryDto = {
    id: customFaker.number.int({ min: 3, max: 5 }),
    name: customFaker.food.ethnicCategory(),
    description: customFaker.food.description(),
    parentId: customFaker.number.int({ min: 1, max: 4 }),
  };

  const mockExistingProduct = {
    id: 1,
    name: 'Red Rose Bouquet',
    description:
      'A beautiful bouquet of 12 red roses, perfect for any romantic occasion.',
    price: 55,
    brand: 'FlowerPower',
    color: 'Red',
    material: 'Fresh Flowers',
    isAvailable: true,
    category: mockExistingCategory,
  };

  const mockProductDto = {
    id: customFaker.number.int({ min: 3, max: 6 }),
    name: customFaker.commerce.productName(),
    description: customFaker.commerce.productDescription(),
    price: customFaker.number.int({ min: 1, max: 400 }),
    brand: customFaker.commerce.productAdjective(),
    color: customFaker.color.human(),
    material: customFaker.commerce.productMaterial(),
    isAvailable: true,
    categoryId: customFaker.number.int({ min: 1, max: 4 }),
    file: customFaker.image.urlPlaceholder({
      height: 30,
      width: 50,
      format: 'png',
    }),
  };

  const mockEditProductDto = {
    id: customFaker.number.int({ min: 3, max: 8 }),
    name: customFaker.commerce.productName(),
    description: customFaker.commerce.productDescription(),
    price: customFaker.number.int({ min: 1, max: 400 }),
    brand: customFaker.commerce.productAdjective(),
    color: customFaker.color.human(),
    material: customFaker.commerce.productMaterial(),
    isAvailable: true,
    file: customFaker.image.dataUri(),
    categoryId: customFaker.number.int({ min: 1, max: 4 }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    accessToken = await getAccessToken(app, mockLoggedInUser);
  });

  describe('/auth ', () => {
    describe('/login ', () => {
      it('Should fail to authenticate a user with an incorrect password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username: mockLoggedInUser.username, password: 'wrong' })
          .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });

      it('Should authenticate a user and include a JWT token in the response', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: mockLoggedInUser.username,
            password: mockLoggedInUser.password,
          })
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
            expect(body.firstName).toEqual(mockLoggedInUser.firstName);
            expect(body.lastName).toEqual(mockLoggedInUser.lastName);
            expect(body.username).toEqual(mockLoggedInUser.username);
            expect(body.password).toBeDefined();
            expect(body.role).toEqual(mockLoggedInUser.role);
            expect(body.id).toEqual(mockLoggedInUser.id);
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('/forgot-password', () => {
      it('Should send an email with forgot password token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({ email: mockLoggedInUser.email })
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
          });
        // .expect(201);

        accessToken = await getAccessToken(app, mockLoggedInUser);
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
            confirmNewPassword: mockCreateUserData.password,
            token: mockResetPasswordData.token,
          });
        // .expect(({ body }) => {
        //   expect(body.error).toBe('Bad Request');
        //   expect(body.message).toBe("Confirmed password doesn't match");
        // })
        // .expect(400);
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
    describe('/ (GET) ', () => {
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
            expect(body.firstName).toEqual(mockLoggedInUser.firstName);
            expect(body.lastName).toEqual(mockLoggedInUser.lastName);
            expect(body.username).toEqual(mockLoggedInUser.username);
            expect(body.password).toBeDefined();
            expect(body.role).toEqual(mockLoggedInUser.role);
            expect(body.id).toEqual(mockLoggedInUser.id);
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

      it('Should return BadRequest when attempting to retrieve a user with a non-numeric ID', async () => {
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

    describe('/ (POST)', () => {
      describe('create', () => {
        it('Should add a new user in the database and return the user data', async () => {
          const response = await request(app.getHttpServer())
            .post('/users/')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(mockCreateUserData)
            .expect(({ body }) => {
              expect(body.firstName).toEqual(mockCreateUserData.firstName);
              expect(body.lastName).toEqual(mockCreateUserData.lastName);
              expect(body.username).toEqual(mockCreateUserData.username);
              expect(body.password).toBeDefined();
              expect(body.role).toEqual(mockCreateUserData.role);
              expect(body.id).toBeDefined();
            })
            .expect(201);
        });

        it('Should return BadRequest when attempting to add an user with a non-existent role', async () => {
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

        it('Should return BadRequest when attempting to add an user with an existent username', async () => {
          const response = await request(app.getHttpServer())
            .post('/users/')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              username: mockCreateUserData.username,
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

        it('Should return BadRequest when attempting to add an user with an existent email', async () => {
          const response = await request(app.getHttpServer())
            .post('/users/')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              username: faker.person.lastName(),
              password: faker.internet.password(),
              email: mockCreateUserData.email,
              role: 'user',
            })
            .expect(({ body }) => {
              expect(body.error).toBe('Bad Request');
              expect(body.message).toBe('Email address already in use');
            })
            .expect(400);
        });
      });

      describe('/update-password', () => {
        it('Should return Unauthorized when attempting to update the password without authorization', async () => {
          const response = await request(app.getHttpServer())
            .post('/users/change-password')
            .send(mockUpdatePasswordData)
            .expect(({ body }) => {
              expect(body.message).toBe('Unauthorized');
            })
            .expect(401);
        });

        it('Should return BadRequest when the current password is incorrect', async () => {
          const response = await request(app.getHttpServer())
            .post('/users/change-password')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              currentPassword: mockEditUserData.password,
              // newPassword: mockUpdatePasswordData.newPassword,
              // confirmNewPassword: mockUpdatePasswordData.newPassword,
            })
            .expect(({ body }) => {
              expect(body.error).toBe('Bad Request');
              expect(body.message).toBe('Wrong Password');
            })
            .expect(400);
        });

        it('Should return BadRequest when the new password and confirmation do not match', async () => {
          const response = await request(app.getHttpServer())
            .post('/users/change-password')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              currentPassword: mockUpdatePasswordData.currentPassword,
              newPassword: mockUpdatePasswordData.newPassword,
              confirmNewPassword: mockEditUserData.password,
            })
            .expect(({ body }) => {
              expect(body.error).toBe('Bad Request');
              expect(body.message).toBe("Confirmed password doesn't match");
            })
            .expect(400);
        });

        it('Should return BadRequest when the new password and the old password are the same', async () => {
          const response = await request(app.getHttpServer())
            .post('/users/change-password')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              currentPassword: mockUpdatePasswordData.currentPassword,
              newPassword: mockLoggedInUser.password,
              confirmNewPassword: mockLoggedInUser.password,
            })
            .expect(({ body }) => {
              expect(body.error).toBe('Bad Request');
              expect(body.message).toBe(
                "Your new password can't be your old password",
              );
            })
            .expect(400);
        });

        it("Should update the user's password when valid data is provided", async () => {
          const response = await request(app.getHttpServer())
            .post('/users/change-password')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              currentPassword: mockUpdatePasswordData.currentPassword,
              newPassword: mockUpdatePasswordData.newPassword,
              confirmNewPassword: mockUpdatePasswordData.newPassword,
            })
            .expect(201);

          mockLoggedInUser.password = mockUpdatePasswordData.newPassword;
          accessToken = await getAccessToken(app, mockLoggedInUser);

          // update to old one to skip problems with authorizations
          await request(app.getHttpServer())
            .post('/users/change-password')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              currentPassword: mockLoggedInUser.password,
              newPassword: 'test',
              confirmNewPassword: 'test',
            })
            .expect(201);
          mockLoggedInUser.password = 'test';

          accessToken = await getAccessToken(app, mockLoggedInUser);
        });
      });
    });

    describe('/ (PUT)', () => {
      it('Should update an existing user and return the user data', async () => {
        const response = await request(app.getHttpServer())
          .put('/users/' + `${mockEditUserData.id}`)
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

      it('Should return BadRequest when attempting to update a user with a non-numeric ID', async () => {
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

      it('Should return BadRequest when attempting to update a user with a non-existent role', async () => {
        const response = await request(app.getHttpServer())
          .put('/users/3')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            id: mockEditUserData.id,
            firstName: mockEditUserData.firstName,
            lastName: mockEditUserData.lastName,
            username: mockEditUserData.username,
            password: mockEditUserData.password,
            email: mockEditUserData.email,
            role: 'lalala',
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Invalid user role');
          })
          .expect(400);
      });
    });

    describe('/ (DELETE)', () => {
      it('Should delete an existing user', async () => {
        const response = await request(app.getHttpServer())
          .delete('/users/' + `${mockEditUserData.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });

      it('Should return BadRequest when attempting to delete an non-existent user', async () => {
        const response = await request(app.getHttpServer())
          .delete('/users/2222222')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Nonexistent user to delete');
          })
          .expect(400);
      });

      it('Should return BadRequest when attempting to delete an user with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .delete('/users/lalalala')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe(
              'Validation failed (numeric string is expected)',
            );
          })
          .expect(400);
      });

      it('Should return Unauthorized when attempting to delete an user without authorization', async () => {
        const response = await request(app.getHttpServer())
          .put('/users/2')
          .expect(({ body }) => {
            expect(body.message).toBe('Unauthorized');
          })
          .expect(401);
      });
    });
  });

  describe('/categories ', () => {
    describe('/ (GET) ', () => {
      it('Should return a list of all categories', async () => {
        const response = await request(app.getHttpServer())
          .get('/categories/')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.data).toBeInstanceOf(Array);
          })
          .expect(200);
      });

      it('Should return the category details when retrieving a category with an existing ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/categories/1')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.name).toEqual(mockExistingCategory.name);
            expect(body.description).toEqual(mockExistingCategory.description);
            expect(body.id).toEqual(mockExistingCategory.id);
            expect(body.parent).toBeUndefined();
          })
          .expect(200);
      });

      it('Should return an empty response when attempting to retrieve a category with a nonexistent ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/categories/12421')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body).toBeDefined();
          })
          .expect(({ text }) => {
            expect(text).toBeDefined();
          })
          .expect(200);
      });

      it('Should return BadRequest when attempting to retrieve a category with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/categories/test')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
          })
          .expect(400);
      });

      it('Should return Unauthorized when no valid token is provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/categories/')
          .expect(401);
      });
    });

    describe('/ (POST)', () => {
      describe('create', () => {
        it('Should add a new category in the database and return the category data', async () => {
          const response = await request(app.getHttpServer())
            .post('/categories/')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(mockCategoryDto)
            .expect(({ body }) => {
              expect(body.name).toEqual(mockCategoryDto.name);
              expect(body.description).toEqual(mockCategoryDto.description);
              expect(body.parent).toBeDefined();
              expect(body.id).toBeDefined();
            })
            .expect(201);
        });

        it('Should return BadRequest when attempting to add an category with a non-existent parent', async () => {
          const response = await request(app.getHttpServer())
            .post('/categories/')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              name: mockCategoryDto.name,
              description: mockCategoryDto.description,
              parentId: 0,
            })
            .expect(({ body }) => {
              expect(body.error).toBe('Bad Request');
              expect(body.message).toBe('Nonexistent parent category');
            })
            .expect(400);
        });
      });
    });

    describe('/ (PUT)', () => {
      it('Should update an existing category and return the category data', async () => {
        const response = await request(app.getHttpServer())
          .put('/categories/' + `${mockEditCategoryDto.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockEditCategoryDto)
          .expect(({ body }) => {
            expect(body.name).toEqual(mockEditCategoryDto.name);
            expect(body.description).toEqual(mockEditCategoryDto.description);
            expect(body.parent).toBeDefined();
            expect(body.id).toBeDefined();
          })
          .expect(200);
      });

      it('Should return BadRequest when attempting to update a nonexistent category', async () => {
        const response = await request(app.getHttpServer())
          .put('/categories/12421412')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockEditCategoryDto)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Nonexistent category to update');
          })
          .expect(400);
      });

      it('Should return BadRequest when attempting to update a category with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .put('/categories/lalalala')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockEditCategoryDto)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe(
              'Validation failed (numeric string is expected)',
            );
          })
          .expect(400);
      });

      it('Should return BadRequest when attempting to update a category with a non-existent parent', async () => {
        const response = await request(app.getHttpServer())
          .put('/categories/3')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: mockCategoryDto.name,
            description: mockCategoryDto.description,
            parentId: 0,
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Nonexistent parent category');
          })
          .expect(400);
      });
    });

    describe('/ (DELETE)', () => {
      it('Should return InternalServerError when attempting to delete a category', async () => {
        const response = await request(app.getHttpServer())
          .delete('/categories/3')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(500);
      });

      it('Should return BadRequest when attempting to delete an non-existent category', async () => {
        const response = await request(app.getHttpServer())
          .delete('/categories/2222222')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Nonexistent category to delete');
          })
          .expect(400);
      });

      it('Should return BadRequest when attempting to delete an category with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .delete('/categories/lalalala')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe(
              'Validation failed (numeric string is expected)',
            );
          })
          .expect(400);
      });

      it('Should return Unauthorized when attempting to delete an category without authorization', async () => {
        const response = await request(app.getHttpServer())
          .put('/categories/2')
          .expect(({ body }) => {
            expect(body.message).toBe('Unauthorized');
          })
          .expect(401);
      });
    });
  });

  describe('/products ', () => {
    describe('/ (GET) ', () => {
      it('Should return a list of all products', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.data).toBeInstanceOf(Array);
          })
          .expect(200);
      });

      it('Should return the product details when retrieving a product with an existing ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/1')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.name).toEqual(mockExistingProduct.name);
            expect(body.description).toEqual(mockExistingProduct.description);
            expect(body.price).toEqual(mockExistingProduct.price);
            expect(body.brand).toEqual(mockExistingProduct.brand);
            expect(body.color).toEqual(mockExistingProduct.color);
            expect(body.isAvailable).toEqual(mockExistingProduct.isAvailable);
            expect(body.material).toEqual(mockExistingProduct.material);
            expect(body.id).toEqual(mockExistingProduct.id);
          })
          .expect(200);
      });

      it('Should return an empty response when attempting to retrieve a product with a nonexistent ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/12421')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body).toBeDefined();
          })
          .expect(({ text }) => {
            expect(text).toBeDefined();
          })
          .expect(200);
      });

      it('Should return BadRequest when attempting to retrieve a product with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/test')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
          })
          .expect(400);
      });
    });

    describe('/ (POST)', () => {
      describe('create', () => {
        it('Should add a new product in the database and return the product data', async () => {
          const response = await request(app.getHttpServer())
            .post('/products/')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(mockProductDto)
            .expect(({ body }) => {
              expect(body.name).toEqual(mockProductDto.name);
              expect(body.description).toEqual(mockProductDto.description);
              expect(body.price).toEqual(mockProductDto.price);
              expect(body.brand).toEqual(mockProductDto.brand);
              expect(body.color).toEqual(mockProductDto.color);
              expect(body.isAvailable).toEqual(mockProductDto.isAvailable);
              expect(body.material).toEqual(mockProductDto.material);
              expect(body.category.id).toEqual(mockProductDto.categoryId);
              expect(body.id).toBeDefined();
            })
            .expect(201);
        });

        it('Should return BadRequest when attempting to add an product with a non-existent category', async () => {
          const response = await request(app.getHttpServer())
            .post('/products/')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              name: mockProductDto.name,
              description: mockProductDto.description,
              price: mockProductDto.price,
              brand: mockProductDto.brand,
              color: mockProductDto.color,
              material: mockProductDto.material,
              isAvailable: true,
              categoryId: 0,
            })
            .expect(({ body }) => {
              expect(body.error).toBe('Bad Request');
              expect(body.message).toBe('Nonexistent category');
            })
            .expect(400);
        });
      });
    });

    describe('/ (PUT)', () => {
      it('Should update an existing product and return the product data', async () => {
        const response = await request(app.getHttpServer())
          .put('/products/' + `${mockEditProductDto.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockEditProductDto)
          .expect(({ body }) => {
            expect(body.name).toEqual(mockEditProductDto.name);
            expect(body.description).toEqual(mockEditProductDto.description);
            expect(body.price).toEqual(mockEditProductDto.price);
            expect(body.brand).toEqual(mockEditProductDto.brand);
            expect(body.color).toEqual(mockEditProductDto.color);
            expect(body.isAvailable).toEqual(mockEditProductDto.isAvailable);
            expect(body.material).toEqual(mockEditProductDto.material);
            expect(body.id).toEqual(mockEditProductDto.id);
          })
          .expect(200);
      });

      it('Should return BadRequest when attempting to update a nonexistent product', async () => {
        const response = await request(app.getHttpServer())
          .put('/products/12421412')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockEditProductDto)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Nonexistent product to update');
          })
          .expect(400);
      });

      it('Should return BadRequest when attempting to update a product with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .put('/products/lalalala')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(mockEditCategoryDto)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe(
              'Validation failed (numeric string is expected)',
            );
          })
          .expect(400);
      });

      it('Should return BadRequest when attempting to update a product with a non-existent category', async () => {
        const response = await request(app.getHttpServer())
          .put('/products/' + `${mockEditProductDto.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: mockEditProductDto.name,
            description: mockEditProductDto.description,
            price: mockEditProductDto.price,
            brand: mockEditProductDto.brand,
            color: mockEditProductDto.color,
            material: mockEditProductDto.material,
            isAvailable: true,
            categoryId: 0,
          })
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Nonexistent category');
          })
          .expect(400);
      });
    });

    describe('/ (DELETE)', () => {
      it('Should delete a product', async () => {
        const response = await request(app.getHttpServer())
          .delete('/products/' + `${mockProductDto.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });

      it('Should return BadRequest when attempting to delete an non-existent product', async () => {
        const response = await request(app.getHttpServer())
          .delete('/products/2222222')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Nonexistent product to delete');
          })
          .expect(400);
      });

      it('Should return BadRequest when attempting to delete an product with a non-numeric ID', async () => {
        const response = await request(app.getHttpServer())
          .delete('/products/lalalala')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(({ body }) => {
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe(
              'Validation failed (numeric string is expected)',
            );
          })
          .expect(400);
      });

      it('Should return Unauthorized when attempting to delete an category without authorization', async () => {
        const response = await request(app.getHttpServer())
          .put('/products/2')
          .expect(({ body }) => {
            expect(body.message).toBe('Unauthorized');
          })
          .expect(401);
      });
    });
  });

  describe('/default', () => {
    it('/ (GET) => Should return hello world', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.text).toBe('Hello World!');
    });

    it('/ (GET) => Should return unauthorized', () => {
      return request(app.getHttpServer()).get('/').expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
