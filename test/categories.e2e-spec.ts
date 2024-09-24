import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CategoriesModule } from '../src/modules/categories/categories.module';
import { CategoriesService } from '../src/modules/categories/categories.service';

describe('Categories', () => {
  let app: INestApplication;
  let categoriesService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CategoriesModule],
    })
      .overrideProvider(CategoriesService)
      .useValue(categoriesService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET categories`, () => {
    return request(app.getHttpServer()).get('/categories').expect(200).expect({
      data: categoriesService.findAll(),
    });
  });

  // afterAll(async () => {
  //   await app.close();
  // });
});
