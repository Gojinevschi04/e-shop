import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { FilesService } from '../files/files.service';
import { ConfigService } from '@nestjs/config';
import { ProductDto } from './dto/product.dto';
import { File } from '../files/file.entity';
import { BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let filesService: FilesService;

  const mockProductsRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockCategoriesRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockFilesRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        FilesService,
        ConfigService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductsRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoriesRepository,
        },
        {
          provide: getRepositoryToken(File),
          useValue: mockFilesRepository,
        },
      ],
    }).compile();

    filesService = await module.resolve(FilesService);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create => should create a new product with file and return its data', async () => {
    const categoryId = 2;

    const fileDto = {
      originalName: 'roses',
      mimetype: 'image/png',
      path: 'b323252323',
    } as File;

    const createProductDto = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
    } as ProductDto;

    const category = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
    } as Category;

    const newProduct = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      category: category,
      categoryId: categoryId,
      image: fileDto,
    };

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(category);

    jest.spyOn(mockProductsRepository, 'save').mockReturnValue(newProduct);
    // @ts-ignore
    jest.spyOn(filesService, 'saveFileData').mockReturnValue(fileDto);

    const result = await service.create(createProductDto, fileDto);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: categoryId,
    });

    expect(mockProductsRepository.save).toHaveBeenCalled();
    expect(mockProductsRepository.save).toHaveBeenCalledWith(newProduct);

    expect(result).toEqual(newProduct);
  });

  it('create => should create a new product without file and return its data', async () => {
    const categoryId = 2;

    const createProductDto = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
    } as ProductDto;

    const category = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
    } as Category;

    const newProduct = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      category: category,
      categoryId: categoryId,
    };

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(category);

    jest.spyOn(mockProductsRepository, 'save').mockReturnValue(newProduct);

    const result = await service.create(createProductDto);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: categoryId,
    });

    expect(mockProductsRepository.save).toHaveBeenCalled();
    expect(mockProductsRepository.save).toHaveBeenCalledWith(newProduct);

    expect(result).toEqual(newProduct);
  });

  it('create => should find the product category and throw error', async () => {
    const categoryId = 0;
    const createProductDto = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 0,
    } as ProductDto;
    const category = null;

    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(category);

    const result = service.create(createProductDto);

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: categoryId,
    });
    await expect(result).rejects.toBeInstanceOf(BadRequestException);
  });

  it('findAll => should return a paginated list of products', async () => {});

  it('findOneById => should find a product by given id', async () => {
    const id = 1;

    const product = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
    };

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(product);

    const result = await service.findOneById(id);

    expect(result).toEqual(product);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({
      id,
    });
  });

  it('update => should find a product with file by a given id and update its data with file', async () => {
    const id = 1;
    const categoryId = 1;
    const category = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
    } as Category;
    const imageId = '7bfe004b-a572-48eb-8b20-cc0c82939c1e.png';
    const fileDto = {
      originalName: 'roses',
      mimetype: 'image/png',
      path: 'b323252323',
    } as File;
    const updateProductDto = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 1,
    } as ProductDto;
    const product = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
      category: category,
      image: fileDto,
    };

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(product);
    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(category);
    jest.spyOn(mockProductsRepository, 'merge').mockReturnValue(product);
    jest.spyOn(filesService, 'deleteFile').mockResolvedValue();
    jest.spyOn(mockFilesRepository, 'delete');
    // @ts-ignore
    jest.spyOn(filesService, 'saveFileData').mockReturnValue(fileDto);

    jest.spyOn(mockProductsRepository, 'save').mockReturnValue(product);

    const result = await service.update(id, updateProductDto, fileDto);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({
      id: id,
    });

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: categoryId,
    });

    expect(filesService.deleteFile).toHaveBeenCalled();
    // expect(filesService.deleteFile).toHaveBeenCalledWith(imageId);

    expect(mockFilesRepository.delete).toHaveBeenCalled();
    // expect(mockFilesRepository.delete).toHaveBeenCalledWith(imageId);

    expect(mockProductsRepository.merge).toHaveBeenCalled();

    expect(filesService.saveFileData).toHaveBeenCalled();
    expect(filesService.saveFileData).toHaveBeenCalledWith(fileDto);

    expect(mockProductsRepository.save).toHaveBeenCalled();
    expect(mockProductsRepository.save).toHaveBeenCalledWith(product);

    expect(result).toEqual(product);
  });

  it('update => should find a product without file by a given id and update its data with file', async () => {
    const id = 1;
    const categoryId = 1;
    const category = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
    } as Category;
    const fileDto = {
      originalName: 'roses',
      mimetype: 'image/png',
      path: 'b323252323',
    } as File;
    const updateProductDto = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 1,
    } as ProductDto;
    const product = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
      category: category,
    };

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(product);
    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(category);
    jest.spyOn(mockProductsRepository, 'merge').mockReturnValue(product);
    // @ts-ignore
    jest.spyOn(filesService, 'saveFileData').mockReturnValue(fileDto);

    jest.spyOn(mockProductsRepository, 'save').mockReturnValue(product);

    const result = await service.update(id, updateProductDto, fileDto);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({
      id: id,
    });

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: categoryId,
    });

    expect(mockProductsRepository.merge).toHaveBeenCalled();

    expect(filesService.saveFileData).toHaveBeenCalled();
    expect(filesService.saveFileData).toHaveBeenCalledWith(fileDto);

    expect(mockProductsRepository.save).toHaveBeenCalled();
    expect(mockProductsRepository.save).toHaveBeenCalledWith(product);

    expect(result).toEqual(product);
  });

  it('update => should find a product without file by a given id and update its data', async () => {
    const id = 1;
    const categoryId = 1;
    const category = {
      id: Date.now(),
      name: 'flowers',
      description: 'Flower description',
    } as Category;
    const updateProductDto = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 1,
    } as ProductDto;
    const product = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
      category: category,
    };

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(product);
    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(category);
    jest.spyOn(mockProductsRepository, 'merge').mockReturnValue(product);
    jest.spyOn(mockProductsRepository, 'save').mockReturnValue(product);

    const result = await service.update(id, updateProductDto);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({
      id: id,
    });

    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
      id: categoryId,
    });

    expect(mockProductsRepository.merge).toHaveBeenCalled();

    expect(mockProductsRepository.save).toHaveBeenCalled();
    expect(mockProductsRepository.save).toHaveBeenCalledWith(product);

    expect(result).toEqual(product);
  });

  it('update => should find a product category and throw error', async () => {
    const id = 1;
    const categoryId = 0;
    const updateProductDto = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 0,
    } as ProductDto;
    const product = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
    };
    const category = null;

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(product);
    jest.spyOn(mockCategoriesRepository, 'findOneBy').mockReturnValue(category);

    const result = service.update(id, updateProductDto);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({
      id: id,
    });

    // expect(mockCategoriesRepository.findOneBy).toHaveBeenCalled();
    // expect(mockCategoriesRepository.findOneBy).toHaveBeenCalledWith({
    //   id: categoryId,
    // });
    await expect(result).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update => should find a product and throw error', async () => {
    const id = 0;
    const updateProductDto = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 0,
    } as ProductDto;
    const product = null;

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(product);

    const result = service.update(id, updateProductDto);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({
      id: id,
    });
    await expect(result).rejects.toBeInstanceOf(BadRequestException);
  });

  it('remove => should find an existent product with file and delete it', async () => {
    const id = 1;
    const imageId = '7bfe004b-a572-48eb-8b20-cc0c82939c1e.png';
    const file = {
      originalName: 'roses',
      mimetype: 'image/png',
      path: '7bfe004b-a572-48eb-8b20-cc0c82939c1e.png',
    } as File;
    const data = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
      image: file,
    };
    const res = undefined;

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(data);
    jest.spyOn(filesService, 'deleteFile').mockResolvedValue();
    jest.spyOn(mockFilesRepository, 'delete');

    const result = await service.remove(id);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    expect(filesService.deleteFile).toHaveBeenCalled();
    // expect(filesService.deleteFile).toHaveBeenCalledWith(imageId);

    expect(mockFilesRepository.delete).toHaveBeenCalled();
    // expect(mockFilesRepository.delete).toHaveBeenCalledWith(imageId);

    expect(mockProductsRepository.delete).toHaveBeenCalled();
    expect(mockProductsRepository.delete).toHaveBeenCalledWith(id);

    expect(result).toEqual(res);
  });

  it('remove => should find an existent product without file and delete it', async () => {
    const id = 1;
    const data = {
      color: 'string',
      material: 'string',
      brand: 'string',
      price: 12,
      name: 'string',
      description: 'string',
      isAvailable: true,
      categoryId: 2,
    };
    const res = undefined;

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(data);

    const result = await service.remove(id);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    expect(mockProductsRepository.delete).toHaveBeenCalled();
    expect(mockProductsRepository.delete).toHaveBeenCalledWith(id);

    expect(result).toEqual(res);
  });

  it('remove => should find the existent product and throw error', async () => {
    const id = 0;
    const data = null;

    jest.spyOn(mockProductsRepository, 'findOneBy').mockReturnValue(data);

    const remove = service.remove(id);

    expect(mockProductsRepository.findOneBy).toHaveBeenCalled();
    expect(mockProductsRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    await expect(remove).rejects.toBeInstanceOf(BadRequestException);
  });
});
