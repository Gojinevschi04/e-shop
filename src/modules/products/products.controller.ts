import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import {
  Paginate,
  Paginated,
  PaginatedSwaggerDocs,
  PaginateQuery,
} from 'nestjs-paginate';
import { Product } from './product.entity';
import { PRODUCT_PAGINATION_CONFIG } from './config-product';
import { FileInterceptor } from '@nestjs/platform-express';

@Public()
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @ApiBody({
    type: ProductDto,
    description: 'Create new product',
  })
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @Body() createProductDto: ProductDto,
    // @UploadedFile(
    //   new ParseFilePipe({
    //     validators: [
    //       new MaxFileSizeValidator({ maxSize: 1000 }),
    //       new FileTypeValidator({ fileType: '/(jpg|jpeg|png|gif)$/' }),
    //     ],
    //   }),
    // )
    // imageFile: Express.Multer.File,
  ): Promise<ProductDto> {
    return this.productService.create(createProductDto);
  }

  @PaginatedSwaggerDocs(Product, PRODUCT_PAGINATION_CONFIG)
  @Get()
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Product>> {
    return await this.productService.findAll(query);
  }

  @ApiCreatedResponse({
    description: 'Product data found',
    type: ProductDto,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductDto | null> {
    return this.productService.findOneById(id);
  }

  @ApiBody({
    type: ProductDto,
    description: 'Update product',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: ProductDto,
  ): Promise<ProductDto | null> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }
}
