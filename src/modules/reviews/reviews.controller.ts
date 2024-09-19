import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post, Put,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import {
  Paginate,
  Paginated,
  PaginatedSwaggerDocs,
  PaginateQuery,
} from 'nestjs-paginate';
import { Review } from './review.entity';
import { REVIEW_PAGINATION_CONFIG } from './config-review';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ReviewDto } from './review.dto';
import { NewReviewDto } from './new-review.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBody({
    type: NewReviewDto,
    description: 'Create new review',
  })
  @Post()
  create(
    @Body() newReviewDto: NewReviewDto,
    @Request() req: any,
  ): Promise<ReviewDto> {
    return this.reviewsService.create(newReviewDto, req.user);
  }

  @PaginatedSwaggerDocs(Review, REVIEW_PAGINATION_CONFIG)
  @Get()
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Review>> {
    return await this.reviewsService.findAll(query);
  }

  @Get(':productId')
  async findAllByProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<Review[] | null> {
    return await this.reviewsService.findAllByProduct(productId);
  }

  @ApiBody({
    type: ReviewDto,
    description: 'Update review',
  })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: ReviewDto,
    @Request() req: any,
  ): Promise<ReviewDto | null> {
    return this.reviewsService.update(id, updateReviewDto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.reviewsService.remove(id);
  }
}
