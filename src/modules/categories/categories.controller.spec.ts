import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { Category } from './category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('=> should ensure the JwtAuthGuard is applied to the methods of controller', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      CategoriesController.prototype.create,
    );
    const guard = new guards[0]();

    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it('create => should create a new category with parent and return its data', async () => {
    const createCategoryDto = {
      name: 'roses',
      description: 'Roses description',
      parentId: 1,
    } as CategoryDto;

    // const newCategory = null as any;
    //
    // jest.spyOn(service, 'create');
    //
    // const result = await controller.create(createCategoryDto);
    //
    // expect(service.create).toHaveBeenCalled();
    // expect(service.create).toHaveBeenCalledWith(createCategoryDto);

    // expect(result).toBe(newCategory);
  });

  it('create => should create a new category without parent and return its data', async () => {
    const createCategoryDto = {
      name: 'roses',
      description: 'Roses description',
    } as CategoryDto;

    let newCategory = null as any;

    jest.spyOn(service, 'create').mockImplementation(() => newCategory);

    const result = await controller.create(createCategoryDto);

    expect(service.create).toHaveBeenCalled();
    expect(service.create).toHaveBeenCalledWith(createCategoryDto);

    expect(result).toBe(newCategory);
  });

  it('create => should find the category parent category and throw error', async () => {});

  it('findAll => should return a pagination of category', async () => {});

  it('findOne => should find a category by a given id and return its data', async () => {
    const id = 1;

    const category = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
      parent: null,
    } as Category;

    // @ts-ignore
    jest.spyOn(service, 'findOneById').mockReturnValue(category);

    const result = await controller.findOne(id);

    expect(result).toEqual(category);

    expect(service.findOneById).toHaveBeenCalled();
    expect(service.findOneById).toHaveBeenCalledWith(id);
  });

  it('update => should find a category with parent by a given id and update its data', async () => {});

  it('update => should find a category without parent by a given id and update its data', async () => {
    const id = 1;

    const updateCategoryDto = {
      name: 'red roses',
      description: 'Roses description',
    } as unknown as CategoryDto;

    const category = {
      id: Date.now(),
      name: 'red roses',
      description: 'Roses description',
      parent: null,
    } as CategoryDto;

    // @ts-ignore
    jest.spyOn(service, 'update').mockReturnValue(category);

    const result = await controller.update(id, updateCategoryDto);

    expect(result).toEqual(category);

    expect(service.update).toHaveBeenCalled();
    expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
  });

  it('update => should find the existent category and throw error', async () => {});

  it('update => should find the parent category and throw error', async () => {});

  it('remove => should find a category by a given id and remove', async () => {
    const id = 1;

    const res = undefined;

    jest.spyOn(service, 'remove').mockResolvedValue(undefined);

    const result = await controller.remove(id);

    expect(result).toEqual(res);

    expect(service.remove).toHaveBeenCalled();
    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
