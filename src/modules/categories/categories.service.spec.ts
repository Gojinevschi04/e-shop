import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { CategoryDto } from './dto/category.dto';
import { BadRequestException } from '@nestjs/common';
import { PaginateQuery } from 'nestjs-paginate';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoriesRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create => should create a new category with parent and return its data', async () => {
    const createCategoryDto = {
      name: 'roses',
      description: 'Roses description',
      parentId: 1,
    } as CategoryDto;

    const parent = {
      id: 1,
      name: 'flowers',
      description: 'Flower description',
      parent: null,
    } as Category;

    const createCategory = {
      name: 'roses',
      description: 'Roses description',
      parentId: 1,
      parent: parent,
    };

    const newCategory = {
      id: Date.now(),
      name: 'roses',
      description: 'Roses description',
      parent: parent,
    } as Category;

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(parent);
    jest.spyOn(mockCategoriesRepository, 'save').mockReturnValue(newCategory);

    const result = await service.create(createCategoryDto);
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });

    expect(mockCategoriesRepository.save).toHaveBeenCalled();
    expect(mockCategoriesRepository.save).toHaveBeenCalledWith(createCategory);

    expect(result).toEqual(newCategory);
  });

  it('create => should create a new category without parent and return its data', async () => {
    const createCategoryDto = {
      name: 'flowers',
      description: 'Flower description',
    } as CategoryDto;

    const newCategory = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
      parent: null,
    } as Category;

    jest.spyOn(mockCategoriesRepository, 'save').mockReturnValue(newCategory);

    const result = await service.create(createCategoryDto);

    expect(mockCategoriesRepository.save).toHaveBeenCalled();
    expect(mockCategoriesRepository.save).toHaveBeenCalledWith(
      createCategoryDto,
    );

    expect(result).toEqual(newCategory);
  });

  it('create => should find the category parent category and throw error', async () => {
    const parentId = 0;
    const parent = null;

    const createCategoryDto = {
      name: 'flowers',
      description: 'Flower description',
      parentId: 0,
    } as CategoryDto;

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(parent);

    const create = service.create(createCategoryDto);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: parentId,
    });

    await expect(create).rejects.toBeInstanceOf(BadRequestException);
  });

  it('findAll => should return a pagination of category', async () => {
    const query: PaginateQuery = { path: '' };

    const category = {
      id: Date.now(),
      name: 'roses',
      description: 'Roses description',
      parent: null,
    } as Category;

    const categories = [category];

    // const result = await service.findAll(query);
  });

  it('update => should find a category with parent by a given id and update its data', async () => {
    const id = 2;
    const parentId = 1;

    const updateCategoryDto = {
      name: 'red roses',
      description: 'Roses description 123',
      parentId: 1,
    } as unknown as CategoryDto;

    const oldCategoryData = {
      id: Date.now(),
      name: 'roses',
      description: 'Roses description',
      parent: null,
    } as Category;

    const parent = {
      id: 1,
      name: 'flowers',
      description: 'Flower description',
      parent: null,
    } as Category;

    const categoryData = {
      id: Date.now(),
      name: 'red roses',
      description: 'Roses description 123',
      parent: parent,
    } as CategoryDto;

    jest
      .spyOn(mockCategoriesRepository, 'findOneBy')
      .mockReturnValue(oldCategoryData);
    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(parent);
    jest.spyOn(mockCategoriesRepository, 'merge').mockReturnValue(categoryData);
    jest.spyOn(mockCategoriesRepository, 'save').mockReturnValue(categoryData);

    const result = await service.update(id, updateCategoryDto);

    expect(result).toEqual(categoryData);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({ id: id });
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: parentId,
    });

    expect(mockCategoriesRepository.merge).toHaveBeenCalled();

    expect(mockCategoriesRepository.save).toHaveBeenCalled();
    expect(mockCategoriesRepository.save).toHaveBeenCalledWith(categoryData);
  });

  it('update => should find a category without parent by a given id and update its data', async () => {
    const id = 1;

    const updateCategoryDto = {
      name: 'flowers',
      description: 'Flower description 22',
      parentId: null,
    } as unknown as CategoryDto;

    const oldCategoryData = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
      parent: null,
    } as Category;

    const categoryData = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description 22',
      parent: null,
    } as CategoryDto;

    jest
      .spyOn(mockCategoriesRepository, 'findOneBy')
      .mockReturnValue(oldCategoryData);

    jest.spyOn(mockCategoriesRepository, 'merge').mockReturnValue(categoryData);
    jest.spyOn(mockCategoriesRepository, 'save').mockReturnValue(categoryData);

    const result = await service.update(id, updateCategoryDto);

    expect(result).toEqual(categoryData);
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    expect(mockCategoriesRepository.merge).toHaveBeenCalled();

    expect(mockCategoriesRepository.save).toHaveBeenCalled();
    expect(mockCategoriesRepository.save).toHaveBeenCalledWith(categoryData);
  });

  it('update => should find the existent category and throw error', async () => {
    const id = 0;
    const updateCategoryDto = {
      name: 'flowers',
      description: 'Flower description',
      parentId: 0,
    } as CategoryDto;
    const oldCategoryData = null;

    jest
      .spyOn(mockCategoriesRepository, 'findOneBy')
      .mockReturnValue(oldCategoryData);

    const update = service.update(id, updateCategoryDto);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    await expect(update).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update => should find the parent category and throw error', async () => {
    const id = 1;

    const parentId = 0;

    const updateCategoryDto = {
      name: 'flowers',
      description: 'Flower description 123',
      parentId: 0,
    } as CategoryDto;

    const oldCategoryData = {
      name: 'flowers',
      description: 'Flower description',
      parent: null,
    };

    const parent = null;

    jest
      .spyOn(mockCategoriesRepository, 'findOneBy')
      .mockReturnValue(oldCategoryData);

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(parent);

    const update = service.update(id, updateCategoryDto);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({ id: id });
    // expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
    //   id: parentId,
    // });

    await expect(update).rejects.toBeInstanceOf(BadRequestException);
  });

  it('findOneById => should find a category by a given id and return its data', async () => {
    const id = 1;

    const category = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
      parent: null,
    } as Category;

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(category);

    const result = await service.findOneById(id);

    expect(result).toEqual(category);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id,
    });
  });

  it('remove => should find a category by a given id, remove and then return Number of affected rows', async () => {
    const id = 1;

    const data = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
      parent: null,
    } as Category;
    const res = undefined;

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(data);
    jest.spyOn(mockCategoriesRepository, 'delete').mockReturnValue(res);
    const result = await service.remove(id);

    expect(result).toEqual(res);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    expect(mockCategoriesRepository.delete).toHaveBeenCalled();
    expect(mockCategoriesRepository.delete).toHaveBeenCalledWith(id);
  });

  it('remove => should find the existent category and throw error', async () => {
    const id = 0;
    const data = null;

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(data);

    const remove = service.remove(id);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    await expect(remove).rejects.toBeInstanceOf(BadRequestException);
  });
});
